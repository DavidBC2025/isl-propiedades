import { buildWhatsAppLink } from "@/lib/whatsapp";
import { markLeadNotificado } from "@/lib/leads";
import type { Agente, Lead, SiteSettings } from "@/types/isl";

const TIPO_LABEL: Record<NonNullable<Lead["tipo"]>, string> = {
  contacto: "Contacto",
  tasacion: "Tasación",
  vender: "Quiero vender",
  visita: "Visita",
  alerta: "Alerta",
  newsletter: "Novedades",
  guia: "Guía",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function replyPhone(lead: Lead, agente: Agente | null, settings: SiteSettings | null): string | null {
  return lead.telefono?.trim() || agente?.whatsapp?.trim() || settings?.whatsapp_general?.trim() || null;
}

export async function notifyLeadByEmail(lead: Lead, settings: SiteSettings | null, agente: Agente | null): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error("RESEND_API_KEY no está configurada: el lead se guardó, pero no se envió correo.");
    return;
  }

  const to = agente?.email?.trim() || settings?.email_general?.trim();
  if (!to) {
    console.error("No hay correo de destino (agente ni email_general): el lead se guardó sin notificar.");
    return;
  }

  const tipoLabel = lead.tipo ? TIPO_LABEL[lead.tipo] : "Consulta";
  const phone = replyPhone(lead, agente, settings);
  const whatsappHref = phone
    ? buildWhatsAppLink(
        phone,
        lead.telefono
          ? `Hola ${lead.nombre}, te escribimos de ISL Propiedades por tu consulta.`
          : `Hola, llegó una consulta de ${lead.nombre} en ISL Propiedades.`,
      )
    : null;

  const rows = [
    ["Tipo", tipoLabel],
    ["Nombre", lead.nombre],
    ["Correo", lead.email ?? "—"],
    ["Teléfono", lead.telefono ?? "—"],
    ["Comuna", lead.comuna ?? "—"],
    ["Mensaje", lead.mensaje ?? "—"],
    ["Origen", lead.origen_url ?? "—"],
  ];

  const html = `
    <div style="font-family:Arial,sans-serif;color:#0A0A0A;line-height:1.5">
      <p style="letter-spacing:0.12em;font-size:12px;color:#C6A87C;text-transform:uppercase">ISL Propiedades</p>
      <h1 style="font-weight:400;font-size:24px">Nueva consulta de ${escapeHtml(lead.nombre)}</h1>
      <table style="border-collapse:collapse;width:100%;max-width:560px">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td style="padding:8px 0;border-top:1px solid #E8DCC8;color:#A1A1AA;width:140px">${escapeHtml(label)}</td><td style="padding:8px 0;border-top:1px solid #E8DCC8">${escapeHtml(value)}</td></tr>`,
          )
          .join("")}
      </table>
      ${
        whatsappHref
          ? `<p style="margin-top:24px"><a href="${escapeHtml(whatsappHref)}" style="display:inline-block;background:#C6A87C;color:#0A0A0A;text-decoration:none;padding:12px 20px;letter-spacing:0.12em;text-transform:uppercase;font-size:12px">Responder por WhatsApp</a></p>`
          : "<p>Esta consulta no trajo teléfono para responder por WhatsApp.</p>"
      }
    </div>
  `;

  try {
    // El dominio de este remitente debe estar verificado en Resend.
    // Si no lo está, el envío falla: el lead ya está guardado y no se rompe la respuesta al visitante.
    const from = process.env.RESEND_FROM?.trim() || "ISL Propiedades <notificaciones@tudominio.cl>";
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `${tipoLabel}: ${lead.nombre}`,
        html,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("Resend rechazó el correo de notificación:", response.status, detail);
      return;
    }

    await markLeadNotificado(lead.id);
  } catch (error) {
    console.error("No se pudo enviar el correo de notificación:", error);
  }
}
