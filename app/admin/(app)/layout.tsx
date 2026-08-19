import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { countConsultasNuevas } from "@/lib/admin";
import { displayNameFromUser, getAdminUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminAppLayout({ children }: { children: ReactNode }) {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  const name = displayNameFromUser(user);
  const greeting = name ? `Hola, ${name}` : "Hola";
  const consultasNuevas = await countConsultasNuevas();

  return (
    <AdminShell greeting={greeting} consultasNuevas={consultasNuevas}>
      {children}
    </AdminShell>
  );
}
