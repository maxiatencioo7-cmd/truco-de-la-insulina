// Receptor del webhook de KashPay en Vercel (sin dependencias) — El Truco de la Insulina LatAm.
//
// KashPay avisa cada pago / reembolso / contracargo con un POST firmado (HMAC-SHA256 del body crudo,
// header X-KashPay-Signature: sha256=<hex>). Acá se verifica la firma, se TRADUCE el aviso al mismo
// formato que manda Impultienda y se reenvía a la Web App de Apps Script ("Accesos Club del Truco"),
// que anota la compra en la planilla "Compras Truco Insulina". La app ya consulta esa planilla por
// correo, así que no hubo que tocar ni el Apps Script ni la app.
//
// Variables de entorno en Vercel (Settings → Environment Variables), después Redeploy:
//   KASH_WEBHOOK_SECRET → clave secreta de la cuenta de KashPay (la misma que usa noctra-latam)
//   APPS_SCRIPT_URL     → ya existe (la usa /api/impultienda): URL de la Web App + ?token=...
//
// URL para KashPay (Integraciones → Webhooks):  https://trucodelainsulina.online/api/kash
// Eventos: order.paid, order.refunded, order.chargeback

const crypto = require("crypto");

module.exports.config = { api: { bodyParser: false } };

// id de OFERTA de KashPay (lo que llega en data.offers[].id) → product_id de Impultienda,
// que es lo que el Apps Script ya sabe traducir a la clave de la app.
const TRUCO = "736d780b-92a5-42f1-be50-4b714ffe0240";       // secreto_insulina
const DIETA = "af1685cc-5f00-4d07-b985-fa7028dba17d";       // dieta_anti_insulina
const NOCHE = "77fb649a-906e-490f-a9e1-cd99c12ce8e0";       // secreto_noche
const DIETA_APP = "ce54af34-fed6-408f-9e1a-c95c6a931a6f";   // dieta_anti_insulina
const NOCHE_APP = "701f6829-7fe2-458d-bd0e-0ff273fed398";   // secreto_noche
const DOCTORA = "1d608b15-6b5b-486e-9218-b813743a5428";     // club_secreto

const OFERTAS = {
  "2b95955a-6fe3-4a4e-8aa4-38ff915d9cdb": TRUCO,      // El Truco de la Insulina 13,90
  "4ba40996-42b6-4c26-a764-ac4c23bca90d": TRUCO,      // Oferta especial 11,90
  "4a21ba2d-3005-4dc8-a77a-c7a519411dbe": DIETA,      // UpSell 1 Dieta 54,90
  "0844f074-818c-40a2-b80c-6f670d2faf56": DIETA,      // DownSell 1 Dieta 27,45
  "4cb7a08d-8306-49d2-b64c-68b403a196c0": NOCHE,      // UpSell 2 Noche 34,90
  "f046fb28-e7cb-4f1a-912a-2aec3aaea780": NOCHE,      // DownSell 2 Noche 17,45
  "c225a379-32ad-4781-a9f5-c33cd517ce87": DOCTORA,    // (product_id por si llega) 21 días con la Doctora
  "43ef4ae4-5e54-4b04-8a67-96596f790d92": DOCTORA,    // 21 días con la Doctora (app) 64,90
  "a6035eae-658a-451b-861d-ec0e53a7fc9f": DIETA_APP,  // Dieta Antiinsulina (App) 59,90
  "4c06b785-2ddf-4851-a138-0c846c1f6c5f": NOCHE_APP,  // El Secreto de la Noche (App) 39,90
  // Atención Prioritaria (order bump 2,90) no abre nada en la app: se anota igual para soporte.
  "7c038edf-1d13-45b3-98fd-8ae3b14c5fd2": "atencion_prioritaria"
};

const EVENTOS = {
  "order.paid": "order.approved",
  "order.refunded": "order.refunded",
  "order.chargeback": "order.chargeback"
};

function leerCuerpo(req) {
  return new Promise((ok, mal) => {
    const partes = [];
    req.on("data", (c) => partes.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on("end", () => ok(Buffer.concat(partes)));
    req.on("error", mal);
  });
}

function firmaValida(raw, header) {
  const secretos = (process.env.KASH_WEBHOOK_SECRET || "").split(",").map((x) => x.trim()).filter(Boolean);
  if (!secretos.length) return "sin_secreto";
  if (!header) return "sin_firma";
  const recibida = String(header).trim().replace(/^sha256=/i, "").toLowerCase();
  const ok = secretos.some((s) => {
    const esperada = crypto.createHmac("sha256", s).update(raw).digest("hex");
    return recibida.length === esperada.length &&
      crypto.timingSafeEqual(Buffer.from(recibida), Buffer.from(esperada));
  });
  return ok ? "" : "no_coincide";
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(200).json({
      activo: true,
      secret: !!process.env.KASH_WEBHOOK_SECRET,
      apps_script: !!process.env.APPS_SCRIPT_URL
    });
    return;
  }

  const raw = await leerCuerpo(req);
  const motivo = firmaValida(raw, req.headers["x-kashpay-signature"]);
  if (motivo) return res.status(401).json({ ok: false, motivo });

  let p;
  try { p = JSON.parse(raw.toString("utf8")); } catch (e) { return res.status(200).json({ ok: false, motivo: "json_invalido" }); }

  const evento = EVENTOS[p.event];
  if (!evento) return res.status(200).json({ ok: true, ignorado: p.event || "" });

  const d = p.data || {};
  const c = d.customer || {};
  const nombre = String(c.name || "").trim();
  const espacio = nombre.indexOf(" ");
  const ofertas = Array.isArray(d.offers) ? d.offers : [];

  const items = ofertas.map((o) => ({
    product_id: OFERTAS[o.id] || OFERTAS[o.product_id] || "",
    name: o.name || "",
    kash_offer_id: o.id || "",
    price: typeof o.total === "number" ? o.total / 100 : (typeof o.price === "number" ? o.price / 100 : null)
  }));

  // Mismo formato que Impultienda → el Apps Script no cambia.
  const traducido = {
    event: evento,
    id: "kash:" + (d.id || "") + ":" + (p.event || ""),   // único por pedido y evento (evita duplicados en reintentos)
    test: false,
    origen: "kashpay",
    data: {
      order_id: "KP-" + (d.id || ""),
      customer: {
        email: c.email || "",
        name: espacio > 0 ? nombre.slice(0, espacio) : nombre,
        last_name: espacio > 0 ? nombre.slice(espacio + 1) : "",
        phone: c.phone || ""
      },
      items: items,
      total: typeof d.amount === "number" ? d.amount / 100 : "",
      currency: d.currency || "USD",
      tracking: d.tracking || null
    }
  };

  const destino = process.env.APPS_SCRIPT_URL;
  if (!destino) return res.status(200).json({ ok: false, motivo: "APPS_SCRIPT_URL no configurada" });

  try {
    const r = await fetch(destino, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(traducido),
      redirect: "follow"
    });
    const texto = await r.text();
    res.status(200).json({
      ok: true,
      evento: p.event,
      email: !!c.email,
      ofertas: items.map((i) => i.kash_offer_id + "→" + (i.product_id || "?")),
      apps_script: texto.slice(0, 300)
    });
  } catch (e) {
    // 5xx → KashPay reintenta (a los 30 s y a los 3 min). El Apps Script descarta duplicados por id.
    res.status(500).send("error reenviando: " + e.message);
  }
};
