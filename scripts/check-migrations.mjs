// Applies the Supabase migrations to an in-memory Postgres (PGlite) with a
// minimal auth stub, then asserts the licensing and subtitle rules.
import { PGlite } from "@electric-sql/pglite";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
import { readFileSync, readdirSync } from "node:fs";

const db = new PGlite({ extensions: { pg_trgm } });
await db.exec(`
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
`);

const dir = new URL("../supabase/migrations/", import.meta.url);
for (const f of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
  await db.exec(readFileSync(new URL(f, dir), "utf8").replace(/create extension if not exists pgcrypto;/, ""));
  console.log("applied", f);
}

let failures = 0;
const check = (name, ok) => { console.log(ok ? "PASS" : "FAIL", name); if (!ok) failures++; };
const throws = async (sql) => { try { await db.exec(sql); return false; } catch { return true; } };

const admin = "00000000-0000-0000-0000-0000000000a1";
await db.exec(`insert into auth.users values ('${admin}', 'admin@example.com');`);
check("profile created for new auth user", (await db.query(`select 1 from profiles where id = '${admin}'`)).rows.length === 1);

await db.exec(`insert into content (id, type, slug, title_mn) values ('00000000-0000-0000-0000-0000000000c1', 'movie', 'test-film', 'Тест кино');`);
check("publish without rights is rejected",
  await throws(`update content set status = 'published' where slug = 'test-film'`));

await db.exec(`insert into content_rights (content_id, rights_owner, licensed_territories, starts_at, ends_at, contract_reference, status, approved_by, approved_at)
  values ('00000000-0000-0000-0000-0000000000c1', 'Licensor LLC', '{MN}', now() - interval '1 day', now() + interval '1 year', 'CTR-001', 'approved', '${admin}', now());`);
check("publish with approved MN rights succeeds",
  !(await throws(`update content set status = 'published' where slug = 'test-film'`)));
check("public_content shows the licensed title", (await db.query(`select 1 from public_content where slug = 'test-film'`)).rows.length === 1);

await db.exec(`update content_rights set ends_at = now() - interval '1 second', starts_at = now() - interval '2 days'`);
check("expired rights hide the title", (await db.query(`select 1 from public_content where slug = 'test-film'`)).rows.length === 0);

check("rights outside MN cannot publish", await (async () => {
  await db.exec(`insert into content (id, type, slug, title_mn) values ('00000000-0000-0000-0000-0000000000c2', 'anime', 'test-anime', 'Тест анимэ');
    insert into content_rights (content_id, rights_owner, licensed_territories, starts_at, ends_at, contract_reference, status, approved_by, approved_at)
    values ('00000000-0000-0000-0000-0000000000c2', 'Licensor', '{JP}', now() - interval '1 day', now() + interval '1 year', 'CTR-002', 'approved', '${admin}', now());`);
  return throws(`update content set status = 'published' where slug = 'test-anime'`);
})());

await db.exec(`insert into video_assets (id, content_id, provider, provider_asset_id, status) values ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-0000000000c1', 'mux', 'asset_1', 'ready');`);
check("unreviewed subtitle cannot be published",
  await throws(`insert into subtitle_tracks (video_asset_id, language_code, label, storage_path, source, is_published) values ('00000000-0000-0000-0000-0000000000f1', 'mn', 'Монгол', 'subs/1.vtt', 'machine', true)`));
check("approved subtitle can be published",
  !(await throws(`insert into subtitle_tracks (video_asset_id, language_code, label, storage_path, source, review_status, is_published) values ('00000000-0000-0000-0000-0000000000f1', 'mn', 'Монгол', 'subs/1.vtt', 'professional', 'approved', true)`)));
check("subtitle languages helper", (await db.query(`select content_subtitle_languages('00000000-0000-0000-0000-0000000000c1') as l`)).rows[0].l.join() === "mn");
check("audit log written", (await db.query(`select count(*)::int as n from audit_logs`)).rows[0].n > 0);
check("search vector populated", (await db.query(`select 1 from content where search_vector @@ to_tsquery('simple', 'тест')`)).rows.length > 0);
check("19 genres seeded", (await db.query(`select count(*)::int as n from genres`)).rows[0].n === 19);
check("RLS enabled on every public table",
  (await db.query(`select count(*)::int as n from pg_tables where schemaname = 'public' and not rowsecurity`)).rows[0].n === 0);

if (failures) { console.error(`${failures} check(s) failed`); process.exit(1); }
console.log("all migration checks passed");
