import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabase() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Se llama desde un Server Component: el middleware ya refresca la sesión.
        }
      },
    },
  });
}

export async function getAdminUser() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export function displayNameFromUser(user: { email?: string | null; user_metadata?: Record<string, unknown> } | null): string | null {
  if (!user) return null;
  const meta = user.user_metadata ?? {};
  const fromMeta = [meta.nombre, meta.full_name, meta.name].find((value) => typeof value === "string" && value.trim());
  if (typeof fromMeta === "string") return fromMeta.trim();
  const emailName = user.email?.split("@")[0];
  return emailName || null;
}
