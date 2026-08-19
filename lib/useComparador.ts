"use client";

import { useCallback, useSyncExternalStore } from "react";

export const COMPARE_MAX = 3;
export const COMPARE_NOTICE = "Puedes comparar hasta 3 propiedades a la vez";
const STORAGE_KEY = "isl:comparar";
const META_KEY = "isl:comparar:meta";

export type CompareSnapshot = {
  slug: string;
  titulo: string;
  imagen?: string | null;
  precio_uf?: number | null;
};

type CompareState = {
  slugs: string[];
  meta: Record<string, CompareSnapshot>;
  notice: string | null;
};

const EMPTY: CompareState = { slugs: [], meta: {}, notice: null };
const listeners = new Set<() => void>();
let snapshot: CompareState = EMPTY;
let noticeTimer: ReturnType<typeof setTimeout> | undefined;
let windowBindings = 0;

function parseSlugs(raw: string | null): string[] {
  try {
    const parsed = JSON.parse(raw ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string" && item.length > 0).slice(0, COMPARE_MAX);
  } catch {
    return [];
  }
}

function parseMeta(raw: string | null): Record<string, CompareSnapshot> {
  try {
    const parsed = JSON.parse(raw ?? "{}") as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as Record<string, CompareSnapshot>;
  } catch {
    return {};
  }
}

function readStorage(): Pick<CompareState, "slugs" | "meta"> {
  return {
    slugs: parseSlugs(localStorage.getItem(STORAGE_KEY)),
    meta: parseMeta(localStorage.getItem(META_KEY)),
  };
}

function emit() {
  listeners.forEach((listener) => listener());
}

function persist(slugs: string[], meta: Record<string, CompareSnapshot>) {
  const keptMeta: Record<string, CompareSnapshot> = {};
  for (const slug of slugs) {
    if (meta[slug]) keptMeta[slug] = meta[slug];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  localStorage.setItem(META_KEY, JSON.stringify(keptMeta));
  snapshot = { ...snapshot, slugs, meta: keptMeta };
  emit();
}

function setNotice(message: string | null) {
  snapshot = { ...snapshot, notice: message };
  emit();
  if (noticeTimer) clearTimeout(noticeTimer);
  if (message) {
    noticeTimer = setTimeout(() => {
      snapshot = { ...snapshot, notice: null };
      emit();
    }, 4000);
  }
}

function onStorage(event: StorageEvent) {
  if (event.key && event.key !== STORAGE_KEY && event.key !== META_KEY) return;
  snapshot = { ...readStorage(), notice: snapshot.notice };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (windowBindings === 0) window.addEventListener("storage", onStorage);
  windowBindings += 1;
  return () => {
    listeners.delete(listener);
    windowBindings -= 1;
    if (windowBindings === 0) window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return EMPTY;
}

if (typeof window !== "undefined") {
  snapshot = { ...readStorage(), notice: null };
}

export function useComparador() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isSelected = useCallback((slug: string) => state.slugs.includes(slug), [state.slugs]);

  const toggle = useCallback((slug: string, meta?: CompareSnapshot): string | null => {
    const current = snapshot;
    if (current.slugs.includes(slug)) {
      persist(current.slugs.filter((item) => item !== slug), current.meta);
      return null;
    }
    if (current.slugs.length >= COMPARE_MAX) {
      setNotice(COMPARE_NOTICE);
      return COMPARE_NOTICE;
    }
    persist([...current.slugs, slug], meta ? { ...current.meta, [slug]: meta } : current.meta);
    return null;
  }, []);

  const clear = useCallback(() => {
    persist([], {});
    setNotice(null);
  }, []);

  return {
    selected: state.slugs,
    items: state.meta,
    notice: state.notice,
    toggle,
    isSelected,
    clear,
    max: COMPARE_MAX,
  };
}
