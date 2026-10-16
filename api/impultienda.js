// Receptor del webhook de Impultienda en Vercel (sin dependencias).
// Verifica la firma HMAC de Impultienda y reenvía el aviso a la Web App de Apps Script
// (planilla "Compras Truco Insulina"), que es la que le dice a la app qué compró cada correo.
//
// Variables de entorno en Vercel (Settings → Environment Variables):
//   IMPULTIENDA_WEBHOOK_SECRET → clave de firma que muestra Impultienda al crear el endpoint
//   APPS_SCRIPT_URL            → URL de la Web App de Apps Script CON ?token=... al final
//
// URL para pegar en Impultienda (Configuraciones → Webhooks):
//   https://trucodelainsulina.online/api/impultienda

const crypto = require("crypto");

module.exports.config = { api: { bodyParser: false } };

function leerCuerpo(req) {
  return new Promise((ok, mal) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => ok(data));
    req.on("error", mal);
  });
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(200).json({ activo: true, secret: !!process.env.IMPULTIENDA_WEBHOOK_SECRET, apps_script: !!process.env.APPS_SCRIPT_URL });
    return;
  }
  const raw = await leerCuerpo(req);
  const secrets = (process.env.IMPULTIENDA_WEBHOOK_SECRET || "").split(",").map((x) => x.trim()).filter(Boolean);
  if (secrets.length) {
    const ts = req.headers["x-impultienda-timestamp"] || "";
    const sig = req.headers["x-impultienda-signature"] || "";
    if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return res.status(401).send("stale timestamp");
    const ok = secrets.some((s) => {
      const esperado = crypto.createHmac("sha256", s).update(ts + "." + raw).digest("hex");
      return sig.length === esperado.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(esperado));
    });
    if (!ok) return res.status(401).send("bad signature");
  }
  const destino = process.env.APPS_SCRIPT_URL;
  if (!destino) return res.status(200).json({ ok: false, reason: "APPS_SCRIPT_URL no configurada" });
  try {
    const r = await fetch(destino, { method: "POST", headers: { "Content-Type": "application/json" }, body: raw, redirect: "follow" });
    const texto = await r.text();
    res.status(200).send(texto || JSON.stringify({ ok: true }));
  } catch (e) {
    res.status(500).send("error reenviando: " + e.message); // 5xx → Impultienda reintenta
  }
};
