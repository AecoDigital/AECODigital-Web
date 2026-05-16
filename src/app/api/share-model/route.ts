import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { email, link, filename } = await req.json();

  if (!email || !link) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const { error } = await resend.emails.send({
    from: "AECO Digital <info@aecodigital.com>",
    to: email,
    subject: "Modelo BIM compartido contigo",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0066cc;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#ffffff;margin:0;font-size:22px">AECO Digital</h1>
          <p style="color:#cce0ff;margin:4px 0 0;font-size:13px">Visor BIM Online</p>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="color:#111827;margin:0 0 12px;font-size:18px">Alguien ha compartido un modelo BIM contigo</h2>
          <p style="color:#6b7280;margin:0 0 24px;font-size:14px;line-height:1.6">
            ${filename ? `El archivo <strong style="color:#111827">${filename}</strong> está listo para visualizarse en el navegador, sin instalar nada.` : "Un modelo IFC está listo para visualizarse en el navegador, sin instalar nada."}
          </p>
          <a href="${link}" style="display:inline-block;background:#0066cc;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px">
            Abrir modelo 3D
          </a>
          <p style="color:#9ca3af;font-size:12px;margin:24px 0 0;line-height:1.6">
            Si el botón no funciona, copia este enlace en tu navegador:<br/>
            <a href="${link}" style="color:#0066cc;word-break:break-all">${link}</a>
          </p>
          <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0"/>
          <p style="color:#9ca3af;font-size:11px;margin:0">
            Compartido desde <a href="https://aecodigital.com/bim-viewer" style="color:#0066cc">aecodigital.com/bim-viewer</a>
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
