import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { demoRepository } from "./demo";
import { supabaseRepository } from "./supabase";
import type { CatalogRepository } from "./types";

/**
 * The site reads the catalog through this one interface. With Supabase
 * configured it serves licensed, published titles; otherwise it serves the
 * labelled demo catalog so the UI can be reviewed.
 */
export const catalog: CatalogRepository = isSupabaseConfigured ? supabaseRepository : demoRepository;

export const getTitles = cache(() => catalog.listTitles());
export const getGenres = cache(() => catalog.listGenres());
export const getTitle = cache((type: Parameters<CatalogRepository["getTitle"]>[0], slug: string) =>
  catalog.getTitle(type, slug),
);
