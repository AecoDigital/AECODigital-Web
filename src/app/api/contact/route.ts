import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { nombre, email, asunto, mensaje } = await req.json();

  if (!nombre || !email || !mensaje) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const { error } = await resend.emails.send({
    from: "AECO Digital <contacto@aecodigital.com>",
    to: "info@aecodigital.com",
    replyTo: email,
    subject: asunto ? `[Web] ${asunto}` : `[Web] Nuevo mensaje de ${nombre}`,
    text: `Nombre: ${nombre}\nEmail: ${email}\n\n${mensaje}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#0066cc;border-bottom:1px solid #e5e7eb;padding-bottom:12px">
          Nuevo mensaje desde aecodigital.com
        </h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#6b7280;width:100px">Nombre</td><td style="padding:8px 0;font-weight:600">${nombre}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Email</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#0066cc">${email}</a></td></tr>
          ${asunto ? `<tr><td style="padding:8px 0;color:#6b7280">Asunto</td><td style="padding:8px 0">${asunto}</td></tr>` : ""}
        </table>
        <div style="margin-top:20px;background:#f9fafb;border-radius:8px;padding:16px;white-space:pre-wrap;color:#111827">${mensaje}</div>
        <p style="margin-top:24px;font-size:12px;color:#9ca3af">Mensaje enviado desde el formulario de contacto de aecodigital.com</p>
      </div>
    `,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
