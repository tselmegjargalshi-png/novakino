-- NOVAPLAY initial schema
-- Catalog, licensing rights, media, users, subscriptions, marketing, operations.
-- Every table has RLS enabled. Writes from the admin dashboard go through
-- role-checked policies; payment writes go through the service role only.

create extension if not exists pg_trgm;
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type content_type as enum ('movie', 'anime', 'series');
create type publication_status as enum ('draft', 'scheduled', 'published', 'unpublished', 'archived');
create type airing_status as enum ('upcoming', 'ongoing', 'completed');
create type access_tier as enum ('free', 'standard', 'premium');
create type rights_status as enum ('draft', 'pending_review', 'approved', 'revoked', 'expired');
create type app_role as enum ('super_admin', 'content_manager', 'subtitle_editor', 'support', 'finance', 'analyst');
create type subtitle_review_status as enum ('uploaded', 'in_review', 'approved', 'rejected');
create type subtitle_source as enum ('licensor', 'professional', 'community', 'machine');
create type video_asset_status as enum ('pending', 'processing', 'ready', 'errored', 'deleted');
create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'expired');
create type payment_status as enum ('pending', 'paid', 'failed', 'refunded', 'partially_refunded', 'canceled');
create type billing_period as enum ('monthly', 'quarterly', 'yearly');
create type ticket_status as enum ('open', 'pending', 'resolved', 'closed');

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Users and roles
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 60),
  avatar_path text,
  is_kids boolean not null default false,
  account_status text not null default 'active' check (account_status in ('active', 'suspended', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role app_role not null,
  granted_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

-- SECURITY DEFINER so policies can check roles without exposing user_roles.
create or replace function has_role(check_role app_role) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from user_roles
    where user_id = auth.uid() and (role = check_role or role = 'super_admin')
  );
$$;

create or replace function is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from user_roles where user_id = auth.uid());
$$;

create table user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  preferred_subtitle_language text default 'mn',
  preferred_audio_language text,
  autoplay_next boolean not null default true,
  favorite_genre_ids uuid[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------
create table studios (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country_code char(2),
  created_at timestamptz not null default now()
);

create table genres (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_mn text not null,
  name_en text not null,
  applies_to content_type[] not null default '{movie,anime,series}',
  sort_order int not null default 0
);

create table content (
  id uuid primary key default gen_random_uuid(),
  type content_type not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title_mn text not null,
  title_original text,
  title_en text,
  title_ja text,
  title_ko text,
  synopsis_mn text,
  release_year int check (release_year between 1888 and 2100),
  runtime_minutes int check (runtime_minutes > 0),
  age_rating text check (age_rating in ('0+', '7+', '13+', '16+', '18+')),
  external_rating numeric(3, 1) check (external_rating between 0 and 10),
  external_rating_source text,
  country_code char(2),
  origin_label text, -- e.g. 'korean-drama', 'turkish-series'
  studio_id uuid references studios (id),
  airing_status airing_status,
  access_tier access_tier not null default 'standard',
  poster_path text,
  backdrop_path text,
  status publication_status not null default 'draft',
  publish_at timestamptz,
  search_vector tsvector,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint airing_only_for_episodic check (type <> 'movie' or airing_status is null)
);

create index content_type_status_idx on content (type, status) where deleted_at is null;
create index content_search_idx on content using gin (search_vector);
create index content_title_trgm_idx on content using gin (
  (coalesce(title_mn, '') || ' ' || coalesce(title_original, '') || ' ' || coalesce(title_en, '')) gin_trgm_ops
);

create or replace function content_search_vector() returns trigger
language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('simple', coalesce(new.title_mn, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.title_original, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.title_en, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.title_ja, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.title_ko, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.synopsis_mn, '')), 'C');
  return new;
end $$;

create table content_genres (
  content_id uuid not null references content (id) on delete cascade,
  genre_id uuid not null references genres (id) on delete restrict,
  primary key (content_id, genre_id)
);
create index content_genres_genre_idx on content_genres (genre_id);

create table people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_original text,
  created_at timestamptz not null default now()
);
create index people_name_trgm_idx on people using gin (name gin_trgm_ops);

create table content_people (
  content_id uuid not null references content (id) on delete cascade,
  person_id uuid not null references people (id) on delete cascade,
  role text not null check (role in ('cast', 'director', 'writer', 'voice', 'creator')),
  character_name text,
  billing_order int not null default 0,
  primary key (content_id, person_id, role)
);

create table seasons (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references content (id) on delete cascade,
  season_number int not null check (season_number > 0),
  title_mn text,
  release_date date,
  created_at timestamptz not null default now(),
  unique (content_id, season_number)
);

create table episodes (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references seasons (id) on delete cascade,
  episode_number int not null check (episode_number > 0),
  title_mn text,
  synopsis_mn text,
  runtime_minutes int check (runtime_minutes > 0),
  thumbnail_path text,
  release_at timestamptz,
  status publication_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (season_id, episode_number)
);

-- ---------------------------------------------------------------------------
-- Licensing rights. Content cannot be published without an active,
-- approved right that covers Mongolia (MN) for streaming.
-- ---------------------------------------------------------------------------
create table content_rights (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references content (id) on delete cascade,
  rights_owner text not null,
  licensed_territories char(2)[] not null check (cardinality(licensed_territories) > 0),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  distribution_types text[] not null default '{svod}' -- svod, avod, tvod
    check (distribution_types <@ array['svod', 'avod', 'tvod']),
  allowed_audio_languages text[] not null default '{}',
  allowed_subtitle_languages text[] not null default '{}',
  drm_required boolean not null default false,
  max_resolution int check (max_resolution in (480, 720, 1080, 2160)),
  streaming_restrictions text,
  contract_reference text not null,
  status rights_status not null default 'draft',
  approved_by uuid references auth.users (id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rights_window check (ends_at > starts_at),
  constraint approval_recorded check (status <> 'approved' or (approved_by is not null and approved_at is not null))
);
create index content_rights_content_idx on content_rights (content_id, status, ends_at);

create or replace function has_active_rights(target uuid, territory char(2) default 'MN') returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from content_rights r
    where r.content_id = target
      and r.status = 'approved'
      and territory = any (r.licensed_territories)
      and now() between r.starts_at and r.ends_at
  );
$$;

create or replace function enforce_publish_rights() returns trigger
language plpgsql as $$
begin
  if new.status in ('published', 'scheduled') and not has_active_rights(new.id) then
    raise exception 'Content % cannot be published without an approved, active MN distribution right', new.slug
      using errcode = 'check_violation';
  end if;
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Media: provider-agnostic. We store provider ids, never raw private URLs.
-- ---------------------------------------------------------------------------
create table video_assets (
  id uuid primary key default gen_random_uuid(),
  content_id uuid references content (id) on delete cascade,
  episode_id uuid references episodes (id) on delete cascade,
  provider text not null check (provider in ('mux', 'cloudflare_stream', 'aws')),
  provider_asset_id text not null,
  provider_playback_id text,
  kind text not null default 'main' check (kind in ('main', 'trailer')),
  status video_asset_status not null default 'pending',
  duration_seconds int,
  max_resolution int,
  drm_enabled boolean not null default false,
  audio_languages text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint asset_owner check ((content_id is null) <> (episode_id is null)),
  unique (provider, provider_asset_id)
);

create table subtitle_tracks (
  id uuid primary key default gen_random_uuid(),
  video_asset_id uuid not null references video_assets (id) on delete cascade,
  language_code text not null check (language_code ~ '^[a-z]{2,3}(-[A-Za-z]{2,4})?$'),
  label text not null,
  storage_path text not null, -- private bucket, VTT only (SRT converted server side)
  source subtitle_source not null,
  review_status subtitle_review_status not null default 'uploaded',
  reviewed_by uuid references auth.users (id),
  reviewed_at timestamptz,
  is_published boolean not null default false,
  is_default boolean not null default false,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Machine translations and every other track must be reviewed before publishing.
  constraint publish_requires_review check (not is_published or review_status = 'approved')
);
create unique index subtitle_one_default_idx on subtitle_tracks (video_asset_id) where is_default;

-- ---------------------------------------------------------------------------
-- Viewing activity
-- ---------------------------------------------------------------------------
create table watch_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  content_id uuid not null references content (id) on delete cascade,
  episode_id uuid references episodes (id) on delete cascade,
  position_seconds int not null default 0 check (position_seconds >= 0),
  duration_seconds int,
  completed boolean not null default false,
  updated_at timestamptz not null default now()
);
create unique index watch_progress_unique_idx
  on watch_progress (user_id, content_id, coalesce(episode_id, '00000000-0000-0000-0000-000000000000'::uuid));
create index watch_progress_recent_idx on watch_progress (user_id, updated_at desc);

create table watch_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  content_id uuid not null references content (id) on delete cascade,
  episode_id uuid references episodes (id) on delete set null,
  watched_seconds int not null default 0,
  started_at timestamptz not null default now()
);
create index watch_history_user_idx on watch_history (user_id, started_at desc);
create index watch_history_content_idx on watch_history (content_id, started_at desc);

create table watchlists (
  user_id uuid not null references auth.users (id) on delete cascade,
  content_id uuid not null references content (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

create table favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  content_id uuid not null references content (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  content_id uuid not null references content (id) on delete cascade,
  rating int not null check (rating between 1 and 10),
  body text check (char_length(body) <= 2000),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, content_id)
);

-- ---------------------------------------------------------------------------
-- Subscriptions and payments. Rows are written by the server (service role)
-- after verified gateway webhooks only.
-- ---------------------------------------------------------------------------
create table subscription_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_mn text not null,
  tier access_tier not null,
  price_mnt int not null check (price_mnt >= 0),
  billing_period billing_period not null default 'monthly',
  trial_days int not null default 0 check (trial_days >= 0),
  max_resolution int not null default 1080,
  max_streams int not null default 1,
  ad_free boolean not null default false,
  features jsonb not null default '[]',
  is_available boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table promotional_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9_-]{3,32}$'),
  percent_off int check (percent_off between 1 and 100),
  amount_off_mnt int check (amount_off_mnt > 0),
  plan_ids uuid[] not null default '{}',
  max_redemptions int,
  redeemed_count int not null default 0,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint one_discount check ((percent_off is null) <> (amount_off_mnt is null))
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id uuid not null references subscription_plans (id),
  status subscription_status not null,
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  promotional_code_id uuid references promotional_codes (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint period_valid check (current_period_end > current_period_start)
);
create index subscriptions_user_idx on subscriptions (user_id, status, current_period_end desc);

create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id),
  subscription_id uuid references subscriptions (id),
  gateway text not null check (gateway in ('qpay', 'socialpay', 'other')),
  gateway_invoice_id text not null,
  amount_mnt int not null check (amount_mnt >= 0),
  status payment_status not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (gateway, gateway_invoice_id)
);

create table payment_events (
  id bigint generated always as identity primary key,
  payment_id uuid references payments (id),
  gateway text not null,
  idempotency_key text not null unique,
  event_type text not null,
  signature_verified boolean not null,
  payload jsonb not null,
  processed_at timestamptz,
  error text,
  received_at timestamptz not null default now()
);

create table refunds (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references payments (id),
  amount_mnt int not null check (amount_mnt > 0),
  reason text not null,
  gateway_refund_id text,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Marketing
-- ---------------------------------------------------------------------------
create table banners (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references content (id) on delete cascade,
  headline_mn text,
  tagline_mn text,
  sort_order int not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table homepage_collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_mn text not null,
  -- manual: curated items; rule: computed (new_movies, new_anime, new_series,
  -- mn_subtitles, most_watched, top_rated, trending); personal: per user.
  source text not null check (source in ('manual', 'rule', 'personal')),
  rule text,
  max_items int not null default 20 check (max_items between 1 and 50),
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rule_required check (source <> 'rule' or rule is not null)
);

create table collection_items (
  collection_id uuid not null references homepage_collections (id) on delete cascade,
  content_id uuid not null references content (id) on delete cascade,
  sort_order int not null default 0,
  primary key (collection_id, content_id)
);

create table announcements (
  id uuid primary key default gen_random_uuid(),
  body_mn text not null,
  link_path text check (link_path like '/%'),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  is_active boolean not null default true
);

-- ---------------------------------------------------------------------------
-- Operations
-- ---------------------------------------------------------------------------
create table support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  subject text not null check (char_length(subject) <= 200),
  body text not null check (char_length(body) <= 5000),
  status ticket_status not null default 'open',
  assigned_to uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  table_name text not null,
  record_id text,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_table_idx on audit_logs (table_name, created_at desc);

create or replace function write_audit_log() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into audit_logs (actor_id, action, table_name, record_id, old_data, new_data)
  values (
    auth.uid(),
    tg_op,
    tg_table_name,
    coalesce((case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end) ->> 'id', null),
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );
  return coalesce(new, old);
end $$;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
create trigger content_search before insert or update on content
  for each row execute function content_search_vector();
create trigger content_rights_gate before insert or update of status on content
  for each row execute function enforce_publish_rights();

do $$
declare t text;
begin
  foreach t in array array['profiles', 'content', 'episodes', 'content_rights', 'video_assets', 'subtitle_tracks',
    'reviews', 'subscription_plans', 'subscriptions', 'payments', 'homepage_collections', 'support_tickets']
  loop
    execute format('create trigger %I_updated before update on %I for each row execute function set_updated_at()', t, t);
  end loop;
  foreach t in array array['content', 'content_rights', 'episodes', 'video_assets', 'subtitle_tracks',
    'subscription_plans', 'promotional_codes', 'subscriptions', 'refunds', 'user_roles', 'banners', 'homepage_collections']
  loop
    execute format('create trigger %I_audit after insert or update or delete on %I for each row execute function write_audit_log()', t, t);
  end loop;
end $$;

-- New auth user gets a profile and preferences row.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, display_name) values (new.id, split_part(new.email, '@', 1));
  insert into user_preferences (user_id) values (new.id);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- Published, reviewed subtitle languages for a title (movie asset or any episode asset).
create or replace function content_subtitle_languages(target uuid) returns text[]
language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(distinct st.language_code order by st.language_code), '{}')
  from subtitle_tracks st
  join video_assets va on va.id = st.video_asset_id
  left join episodes e on e.id = va.episode_id
  left join seasons s on s.id = e.season_id
  where st.is_published and va.status = 'ready'
    and (va.content_id = target or s.content_id = target);
$$;

-- ---------------------------------------------------------------------------
-- Public read model: only published, released, non-deleted content with an
-- active approved right is visible to the site.
-- ---------------------------------------------------------------------------
create or replace view public_content with (security_invoker = true) as
  select c.*, content_subtitle_languages(c.id) as subtitle_languages
  from content c
  where c.deleted_at is null
    and c.status = 'published'
    and (c.publish_at is null or c.publish_at <= now())
    and has_active_rights(c.id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;
alter table user_roles enable row level security;
alter table user_preferences enable row level security;
alter table studios enable row level security;
alter table genres enable row level security;
alter table content enable row level security;
alter table content_genres enable row level security;
alter table people enable row level security;
alter table content_people enable row level security;
alter table seasons enable row level security;
alter table episodes enable row level security;
alter table content_rights enable row level security;
alter table video_assets enable row level security;
alter table subtitle_tracks enable row level security;
alter table watch_progress enable row level security;
alter table watch_history enable row level security;
alter table watchlists enable row level security;
alter table favorites enable row level security;
alter table reviews enable row level security;
alter table subscription_plans enable row level security;
alter table promotional_codes enable row level security;
alter table subscriptions enable row level security;
alter table payments enable row level security;
alter table payment_events enable row level security;
alter table refunds enable row level security;
alter table banners enable row level security;
alter table homepage_collections enable row level security;
alter table collection_items enable row level security;
alter table announcements enable row level security;
alter table support_tickets enable row level security;
alter table audit_logs enable row level security;

-- Own rows
create policy profiles_self on profiles for select using (id = auth.uid() or has_role('support'));
create policy profiles_self_update on profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_support_update on profiles for update using (has_role('support'));
create policy prefs_self on user_preferences for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy roles_read on user_roles for select using (user_id = auth.uid() or has_role('super_admin'));
create policy roles_admin on user_roles for all using (has_role('super_admin')) with check (has_role('super_admin'));

create policy progress_self on watch_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy history_self on watch_history for select using (user_id = auth.uid() or has_role('support'));
create policy history_insert on watch_history for insert with check (user_id = auth.uid());
create policy watchlist_self on watchlists for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy favorites_self on favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Public catalog reads (published + rights) and staff management
create policy content_public on content for select
  using ((deleted_at is null and status = 'published' and (publish_at is null or publish_at <= now())
          and has_active_rights(id)) or is_staff());
create policy content_manage on content for all using (has_role('content_manager')) with check (has_role('content_manager'));

create policy genres_public on genres for select using (true);
create policy genres_manage on genres for all using (has_role('content_manager')) with check (has_role('content_manager'));
create policy studios_public on studios for select using (true);
create policy studios_manage on studios for all using (has_role('content_manager')) with check (has_role('content_manager'));
create policy people_public on people for select using (true);
create policy people_manage on people for all using (has_role('content_manager')) with check (has_role('content_manager'));

create policy content_genres_public on content_genres for select using (true);
create policy content_genres_manage on content_genres for all using (has_role('content_manager')) with check (has_role('content_manager'));
create policy content_people_public on content_people for select using (true);
create policy content_people_manage on content_people for all using (has_role('content_manager')) with check (has_role('content_manager'));

create policy seasons_public on seasons for select
  using (exists (select 1 from content c where c.id = content_id)); -- inherits content visibility via RLS
create policy seasons_manage on seasons for all using (has_role('content_manager')) with check (has_role('content_manager'));
create policy episodes_public on episodes for select
  using ((status = 'published' and (release_at is null or release_at <= now())
          and exists (select 1 from seasons s where s.id = season_id)) or is_staff());
create policy episodes_manage on episodes for all using (has_role('content_manager')) with check (has_role('content_manager'));

create policy rights_staff on content_rights for select using (has_role('content_manager') or has_role('finance'));
create policy rights_manage on content_rights for all using (has_role('content_manager')) with check (has_role('content_manager'));

-- Media metadata is staff only; playback goes through the server API.
create policy assets_staff on video_assets for select using (has_role('content_manager') or has_role('subtitle_editor'));
create policy assets_manage on video_assets for all using (has_role('content_manager')) with check (has_role('content_manager'));
create policy subtitles_staff on subtitle_tracks for select using (has_role('subtitle_editor') or has_role('content_manager'));
create policy subtitles_manage on subtitle_tracks for all using (has_role('subtitle_editor')) with check (has_role('subtitle_editor'));

create policy reviews_public on reviews for select using (not is_hidden or user_id = auth.uid() or has_role('support'));
create policy reviews_self on reviews for insert with check (user_id = auth.uid());
create policy reviews_self_update on reviews for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy reviews_self_delete on reviews for delete using (user_id = auth.uid() or has_role('support'));

create policy plans_public on subscription_plans for select using (is_available or has_role('finance'));
create policy plans_manage on subscription_plans for all using (has_role('finance')) with check (has_role('finance'));
create policy promo_staff on promotional_codes for select using (has_role('finance'));
create policy promo_manage on promotional_codes for all using (has_role('finance')) with check (has_role('finance'));

-- Billing: users read their own rows; no client writes (service role bypasses RLS).
create policy subs_self on subscriptions for select using (user_id = auth.uid() or has_role('finance') or has_role('support'));
create policy payments_self on payments for select using (user_id = auth.uid() or has_role('finance'));
create policy payment_events_finance on payment_events for select using (has_role('finance'));
create policy refunds_finance on refunds for select using (has_role('finance'));

create policy banners_public on banners for select using (is_active or is_staff());
create policy banners_manage on banners for all using (has_role('content_manager')) with check (has_role('content_manager'));
create policy collections_public on homepage_collections for select using (is_active or is_staff());
create policy collections_manage on homepage_collections for all using (has_role('content_manager')) with check (has_role('content_manager'));
create policy collection_items_public on collection_items for select using (true);
create policy collection_items_manage on collection_items for all using (has_role('content_manager')) with check (has_role('content_manager'));
create policy announcements_public on announcements for select using (is_active and starts_at <= now() and (ends_at is null or ends_at > now()));
create policy announcements_manage on announcements for all using (has_role('content_manager')) with check (has_role('content_manager'));

create policy tickets_self on support_tickets for select using (user_id = auth.uid() or has_role('support'));
create policy tickets_create on support_tickets for insert with check (user_id = auth.uid());
create policy tickets_support on support_tickets for update using (has_role('support'));

create policy audit_admin on audit_logs for select using (has_role('super_admin'));

-- ---------------------------------------------------------------------------
-- Reference data: genres from the product brief. No content is seeded.
-- ---------------------------------------------------------------------------
insert into genres (slug, name_mn, name_en, applies_to, sort_order) values
  ('action', 'Экшн', 'Action', '{movie,anime,series}', 1),
  ('adventure', 'Адал явдал', 'Adventure', '{movie,anime,series}', 2),
  ('comedy', 'Инээдмийн', 'Comedy', '{movie,anime,series}', 3),
  ('drama', 'Драм', 'Drama', '{movie,series}', 4),
  ('romance', 'Романтик', 'Romance', '{movie,anime,series}', 5),
  ('horror', 'Аймшгийн', 'Horror', '{movie,series}', 6),
  ('thriller', 'Триллер', 'Thriller', '{movie,series}', 7),
  ('mystery', 'Нууцлаг', 'Mystery', '{movie,anime,series}', 8),
  ('sci-fi', 'Шинжлэх ухааны уран зөгнөлт', 'Science Fiction', '{movie,series}', 9),
  ('fantasy', 'Уран зөгнөлт', 'Fantasy', '{movie,anime,series}', 10),
  ('animation', 'Хүүхэлдэйн', 'Animation', '{movie}', 11),
  ('documentary', 'Баримтат', 'Documentary', '{movie,series}', 12),
  ('shounen', 'Шонэн', 'Shounen', '{anime}', 20),
  ('shoujo', 'Шожо', 'Shoujo', '{anime}', 21),
  ('seinen', 'Сэйнэн', 'Seinen', '{anime}', 22),
  ('isekai', 'Исэкай', 'Isekai', '{anime}', 23),
  ('slice-of-life', 'Өдөр тутмын амьдрал', 'Slice of Life', '{anime}', 24),
  ('psychological', 'Сэтгэл зүйн', 'Psychological', '{anime,series}', 25),
  ('sports', 'Спорт', 'Sports', '{anime}', 26);

insert into homepage_collections (slug, title_mn, source, rule, sort_order) values
  ('featured', 'Онцлох бүтээлүүд', 'manual', null, 1),
  ('continue-watching', 'Үргэлжлүүлэн үзэх', 'personal', 'continue_watching', 2),
  ('new-movies', 'Шинээр нэмэгдсэн кино', 'rule', 'new_movies', 3),
  ('new-anime', 'Шинэ анимэ', 'rule', 'new_anime', 4),
  ('new-series', 'Шинэ цуврал', 'rule', 'new_series', 5),
  ('mn-subtitles', 'Монгол хадмалтай', 'rule', 'mn_subtitles', 6),
  ('trending', 'Тренд болж буй', 'rule', 'trending', 7),
  ('most-watched', 'Хамгийн их үзсэн', 'rule', 'most_watched', 8),
  ('top-rated', 'Өндөр үнэлгээтэй', 'rule', 'top_rated', 9),
  ('for-you', 'Танд санал болгох', 'personal', 'recommended', 10);
