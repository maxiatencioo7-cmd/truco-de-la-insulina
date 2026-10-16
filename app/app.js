/* =====================================================================
   Club del Truco — app.js
   Réplica en JavaScript plano (sin React, sin compilar) de la app brasileña
   "Clube do Segredo". Rutas por hash: #/ (inicio), #/jornada, #/regalos,
   #/club, #/perfil. Acceso por correo de compra (sin contraseña), igual que
   la app de Ayuno Reset: la app consulta una planilla de Google vía Apps Script.
   ===================================================================== */

/* ---------- CONFIG: lo que podés tocar sin leer el resto ---------- */
const CONFIG = {
  MARCA: "Club del Truco",
  PROGRAMA: "El Truco de la Insulina",
  DRA: "Dra. del Truco",                 // cómo se llama la guía del Club (el original: "Dra. do Segredo")
  VERSION: "versión 1.2",

  // --- Acceso por correo de compra (ver integracion/LEEME-integracion.md) ---
  ACCESS_URL: "",   // Web App de Apps Script (planilla "Compras Truco Insulina"). Vacío = modo de prueba: cualquier correo entra.
  PRODUCTO_BASE: "secreto_insulina",       // clave del producto principal en la planilla
  PRODUCTO_CLUB: "club_secreto",           // clave del upsell (Club Premium) en la planilla
  PRODUCTO_DIETA: "dieta_anti_insulina",   // clave del OTO 1 La Dieta Anti-Insulina (OTO y downsell desbloquean lo mismo)
  PRODUCTO_NOCHE: "secreto_noche",         // clave del OTO 2 El Secreto de la Noche (OTO y downsell desbloquean lo mismo)
  NOCHE_URL: "https://el-truco-de-la-insulina.impultienda.ar/checkout?p=701f6829-7fe2-458d-bd0e-0ff273fed398",   // checkout de El Secreto de la Noche dentro de la app (2026-10-01)
  NOCHE_PRECIO: "$ 17.997",
  NOCHE_ANCLA: "$ 29.990",
  DIAS_PLAN: 21,

  // --- Club Premium (upsell dentro de la app; página #/club) ---
  CLUB_URL: "https://el-truco-de-la-insulina.impultienda.ar/checkout?p=1d608b15-6b5b-486e-9218-b813743a5428",   // checkout de la Doctora en la tienda del Truco (cambiado 2026-10-03; antes tereset). Vacío = el botón avisa que todavía no está disponible
  CLUB_PRECIO: "$ 27.997",                 // precio del Club (OTO 2 "La Doctora del Truco en tu WhatsApp") decidido el 2026-09-17; antes $ 11.299
  CLUB_VSL_URL: "vsl-club.html?v=1",       // VSL del Club: reproductor VTurb, vive en vsl-club.html (cargado el 2026-09-29). También acepta embed de Panda/YouTube o .mp4. Vacío = recuadro "video pendiente"
  CLUB_VSL_VERTICAL: true,                 // el VSL del OTO 2 se graba en 9:16 (decidido 2026-09-17)
  WHATSAPP: "",                            // número de la Dra. para miembros del Club, ej. "5491122334455" (sin +). Vacío = el botón avisa
  WHATSAPP_TEXTO: "Hola Doctora, soy del Club. Te escribo por mi rutina.",
  WHATSAPP_REAL: false,                    // false = el botón de la Doctora abre el chat dentro de la app (sin Meta). true = abre WhatsApp con el número de arriba

  // --- Oferta interna que aparece en la Jornada (como "Salada de pote" en la app brasileña): La Dieta Anti-Insulina ---
  // Se muestra solo a quien NO compró la Dieta (ni en el OTO ni en el downsell). Sin VSL: tarjeta dorada → hoja con ítems, precio y botón al checkout.
  BUMP: {
    activo: true,
    producto: "dieta_anti_insulina",       // si la planilla devuelve esta clave, la tarjeta y la hoja desaparecen
    icono: "Utensils",
    titulo: "La Dieta Anti-Insulina",
    nombre: "La Dieta Anti-Insulina",
    sub: "Comé de todo, sin picos",
    lead: "21 días de almuerzos y cenas que no despiertan la insulina. Sin dejar la milanesa ni las pastas.",
    incluye: ["Los 21 días de almuerzos y cenas (42 comidas argentinas)", "La regla del orden del plato", "La lista de compras semanal + 15 intercambios", "La carta de emergencia + 7 platos en 10 minutos"],
    precio: "$ 26.997",                    // precio dentro de la app (decidido 2026-09-16)
    cta: "Quiero la Dieta por $ 26.997",
    url: "https://el-truco-de-la-insulina.impultienda.ar/checkout?p=ce54af34-fed6-408f-9e1a-c95c6a931a6f",
    aparece_desde_apertura: 3,             // se abre sola a partir de la 3ª vez que entra a la Jornada
    veces_max: 3,                          // como máximo 3 veces
    cada_horas: 48                         // y no más de una vez cada 48 h
  }
};

/* ---------- Store (localStorage) ---------- */
const KEY = "club_truco_v1";
let state = load();
function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* modo privado */ } }

/* ---------- Utilidades ---------- */
const $ = (sel, el = document) => el.querySelector(sel);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pad2 = n => String(n).padStart(2, "0");
function go(hash) { if (location.hash === hash) { router(); return; } location.hash = hash; }   // mismo hash = no hay evento "hashchange": se dibuja a mano
function render(html) { const app = $("#app"); app.innerHTML = html; window.scrollTo(0, 0); }

/* Íconos (Lucide, mismos que usa la app original) */
const ICON = {
  ArrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  Check: '<path d="M20 6 9 17l-5-5"/>',
  ChevronDown: '<path d="m6 9 6 6 6-6"/>',
  ChevronLeft: '<path d="m15 18-6-6 6-6"/>',
  ChevronRight: '<path d="m9 18 6-6-6-6"/>',
  CircleCheck: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  Crown: '<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>',
  Download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  FileText: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  FlaskConical: '<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
  Flower2: '<path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1"/><circle cx="12" cy="8" r="2"/><path d="M12 10v12"/><path d="M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z"/><path d="M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z"/>',
  FolderOpen: '<path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>',
  Gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  Gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
  GlassWater: '<path d="M15.2 22H8.8a2 2 0 0 1-2-1.79L5 3h14l-1.81 17.21A2 2 0 0 1 15.2 22Z"/><path d="M6 12a5 5 0 0 1 6 0 5 5 0 0 0 6 0"/>',
  Info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  KeyRound: '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
  LoaderCircle: '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
  Lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  LogOut: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  Mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  Play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  Printer: '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
  RefreshCw: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  Clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  Coffee: '<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>',
  Headphones: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
  CalendarDays: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
  Utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  Salad: '<path d="M7 21h10"/><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"/><path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1"/><path d="m13 12 4-4"/><path d="M10.9 7.25A3.99 3.99 0 0 0 4 10c0 .73.2 1.41.54 2"/>',
  Scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
  Settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  ShieldCheck: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  Sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
  TriangleAlert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  Umbrella: '<path d="M22 12a10.06 10.06 1 0 0-20 0Z"/><path d="M12 12v8a2 2 0 0 0 4 0"/><path d="M12 2v1"/>',
  X: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  Camera: '<path d="M4 8h2.5L8 5.8h8L17.5 8H20a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.3"/>'
};
const ic = (name, cls = "", sw) => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true"${sw ? ` style="stroke-width:${sw}"` : ""}>${ICON[name] || ""}</svg>`;
const WA = cls => `<svg class="i fill ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>`;
const LEAF = `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><defs><linearGradient id="leafHome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8CC81"/><stop offset="1" stop-color="#C7A24C"/></linearGradient></defs><path d="M24 40 L24 16" stroke="url(#leafHome)" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="24" cy="14" rx="4.6" ry="8" fill="url(#leafHome)"/><ellipse cx="17" cy="23" rx="4" ry="7" fill="url(#leafHome)" transform="rotate(-34 17 23)"/><ellipse cx="31" cy="23" rx="4" ry="7" fill="url(#leafHome)" transform="rotate(34 31 23)"/><ellipse cx="18" cy="32" rx="3.6" ry="6" fill="url(#leafHome)" transform="rotate(-34 18 32)"/><ellipse cx="30" cy="32" rx="3.6" ry="6" fill="url(#leafHome)" transform="rotate(34 30 32)"/></svg>`;
const wb = (size = 44) => `<span class="wb" style="width:${size}px;height:${size}px"><span style="font-size:${size * .4}px">CS</span></span>`;

/* ---------- Toasts ---------- */
function toast(msg, type = "success") {
  let box = $(".toasts"); if (!box) { box = document.createElement("div"); box.className = "toasts"; document.body.appendChild(box); }
  const t = document.createElement("div"); t.className = `toast ${type}`;
  const icon = type === "success" ? "CircleCheck" : type === "gold" ? "Sparkles" : "Info";
  t.innerHTML = `${ic(icon, "lead")}<span class="msg">${esc(msg)}</span>${ic("X", "x")}`;
  const quitar = () => { t.classList.add("out"); setTimeout(() => t.remove(), 250); };
  t.onclick = quitar; box.appendChild(t); setTimeout(quitar, 3200);
}

/* ---------- Cuenta / acceso por correo de compra ---------- */
const accesoActivo = () => !!CONFIG.ACCESS_URL;
function tiene(producto) {
  if (!accesoActivo()) {   // modo de prueba: se simula desde Mi cuenta
    if (producto === CONFIG.PRODUCTO_BASE) return true;
    if (producto === CONFIG.PRODUCTO_DIETA) return state.pruebaDieta === true;
    if (producto === CONFIG.PRODUCTO_NOCHE) return state.pruebaNoche === true;
    return state.pruebaPremium === true;
  }
  return !!(state.cuenta && (state.cuenta.productos || []).includes(producto));
}
const esPremium = () => tiene(CONFIG.PRODUCTO_CLUB);
async function consultarAcceso(email) {
  // Apps Script tarda entre 3 y 6 s y a veces un pedido se cuelga o devuelve una página de error.
  // En vez de esperar a que falle para reintentar, lanzamos hasta 3 pedidos escalonados (0 s, 3 s, 6 s)
  // y nos quedamos con el primero que responde bien. Tope total: 20 s.
  const base = CONFIG.ACCESS_URL + (CONFIG.ACCESS_URL.includes("?") ? "&" : "?") + "e=" + encodeURIComponent(email);
  const ctls = []; const timers = [];
  const pedir = (n) => new Promise((ok, mal) => {
    timers.push(setTimeout(async () => {
      const ctl = new AbortController(); ctls.push(ctl);
      try {
        const r = await fetch(base + "&t=" + Date.now() + "-" + n, { redirect: "follow", cache: "no-store", signal: ctl.signal });
        const j = JSON.parse(await r.text());
        if (j && typeof j.ok !== "undefined") ok(j); else mal(new Error("respuesta inesperada"));
      } catch (e) { mal(e); }
    }, n * 3000));
  });
  const tope = new Promise((_, mal) => timers.push(setTimeout(() => mal(new Error("tiempo agotado")), 20000)));
  try { return await Promise.race([Promise.any([pedir(0), pedir(1), pedir(2)]), tope]); }
  finally { timers.forEach(clearTimeout); ctls.forEach(c => { try { c.abort(); } catch (e) {} }); }
}
// Despierta a Apps Script mientras la persona escribe su correo (así el pedido real sale más rápido)
let precalentado = false;
function precalentarAcceso() {
  if (precalentado || !accesoActivo()) return; precalentado = true;
  try { fetch(CONFIG.ACCESS_URL + (CONFIG.ACCESS_URL.includes("?") ? "&" : "?") + "e=ping&t=" + Date.now(), { cache: "no-store" }).catch(() => {}); } catch (e) {}
}
function guardarCuenta(email, productos, verificado, fechaCompra) {
  const previa = state.cuenta || {};
  state.cuenta = { email, productos: productos || [], verificado: !!verificado, fecha: new Date().toISOString(),
                   inicio: fechaCompra || previa.inicio || new Date().toISOString() };
  save();
}
async function reverificarSilencioso() {
  const c = state.cuenta; if (!accesoActivo() || !c || !c.email) return;
  const hace = (Date.now() - new Date(c.fecha || 0).getTime()) / 60000;
  if (c.verificado && hace < 60 * 12) return;                      // verificada hace menos de 12 h
  try { const r = await consultarAcceso(c.email); if (r.ok && r.encontrado) { const antes = (c.productos || []).join(); guardarCuenta(c.email, r.productos, true, r.fecha); if (antes !== r.productos.join()) router(); } } catch (e) { /* sin red */ }
}
let acc = { email: "", estado: "form", msg: "", cargando: false };
const SPARKS = [{ top: "10%", left: "16%", s: 6, d: 0 }, { top: "16%", left: "82%", s: 4, d: .8 }, { top: "30%", left: "70%", s: 5, d: 1.6 }, { top: "26%", left: "30%", s: 3, d: .4 }, { top: "44%", left: "88%", s: 4, d: 2.2 }, { top: "52%", left: "10%", s: 5, d: 1.2 }, { top: "64%", left: "78%", s: 3, d: .6 }, { top: "8%", left: "50%", s: 4, d: 2.6 }];
function viewAcceso() {
  document.title = CONFIG.MARCA;
  render(`<div class="login">
    <div class="blob blob-a"></div><div class="blob blob-b"></div><div class="blob blob-c"></div>
    ${SPARKS.map(p => `<span class="spark" style="top:${p.top};left:${p.left};width:${p.s}px;height:${p.s}px;animation-delay:${p.d}s"></span>`).join("")}
    <div class="vignette"></div>
    <div class="login-inner">
      <div class="login-hero">
        <div class="logo-card-wrap"><div class="logo-card"><img src="assets/logo.jpg" alt="${esc(CONFIG.MARCA)}" draggable="false"></div></div>
        <p class="login-quote">No estás sola.<br>Sin presión, solo dirección.</p>
      </div>
      <div class="login-card">
        <h2>Bienvenida 💛</h2>
        <p class="lead">Entrá con el correo que usaste al comprar. Sin contraseñas: tu correo es tu acceso.</p>
        <form id="f-acceso" style="margin-top:1.25rem" onsubmit="accBuscar(event)">
          <div class="field-row">${ic("Mail")}<input class="input-bare" id="f-email" type="email" inputmode="email" autocomplete="email" placeholder="Tu correo de compra" value="${esc(acc.email)}" required></div>
          ${acc.estado === "error" ? `<div class="notice">${esc(acc.msg)}</div>` : ""}
          ${acc.estado === "ok" ? `<div class="notice ok">${esc(acc.msg)}</div>` : ""}
          <button class="btn gold lg full" type="submit" style="margin-top:1.25rem" ${acc.cargando ? "disabled" : ""}>${acc.cargando ? ic("LoaderCircle", "spin") + "Buscando tu compra…" : "Entrar " + ic("ArrowRight")}</button>
          ${acc.cargando ? `<p id="acc-espera" class="login-help" style="margin-top:.75rem">Esto tarda unos segundos. No cierres ni actualices la página.</p>` : ""}
        </form>
        <p class="login-help">${acc.estado === "error" ? `¿Compraste con otro correo? Probá con ese. Si no lo encontrás, escribinos y te lo activamos.` : `¿Recién compraste? Puede tardar unos minutos en activarse.`}</p>
      </div>
    </div>
  </div>`);
  if (!acc.cargando) setTimeout(() => $("#f-email")?.focus(), 400);
  precalentarAcceso();
}
window.accBuscar = async (ev) => {
  ev?.preventDefault();
  if (acc.cargando) return;                                       // ya hay una búsqueda en curso
  const email = ($("#f-email")?.value || "").trim().toLowerCase();
  if (!email.includes("@")) { toast("Escribí tu correo primero.", "info"); return; }
  acc.email = email;
  const entrar = (msg, tipo) => { acc = { email: "", estado: "form", msg: "", cargando: false }; toast(msg, tipo); if (location.hash === "#/") router(); else location.hash = "#/"; };
  if (!accesoActivo()) { guardarCuenta(email, [CONFIG.PRODUCTO_BASE], false); entrar("Modo de prueba: acceso abierto 💛", "gold"); return; }
  acc.cargando = true; acc.estado = "form"; viewAcceso();
  const aviso = setTimeout(() => { const el = $("#acc-espera"); if (el) el.textContent = "Ya casi: seguimos buscando tu compra. No cierres la página."; }, 7000);
  try {
    const r = await consultarAcceso(email);
    clearTimeout(aviso); acc.cargando = false;
    if (r.ok && r.encontrado && r.productos.includes(CONFIG.PRODUCTO_BASE)) {
      guardarCuenta(email, r.productos, true, r.fecha);
      entrar("¡Encontramos tu compra! Bienvenida 💛"); return;
    }
    acc.estado = "error"; acc.msg = "No encontramos una compra con ese correo. Revisá que sea el mismo que usaste al pagar.";
  } catch (e) { clearTimeout(aviso); acc.cargando = false; acc.estado = "error"; acc.msg = "Está tardando más de lo normal. Tocá “Entrar” de nuevo: tu correo ya quedó escrito."; }
  viewAcceso();
};
window.accActualizar = async () => {
  const c = state.cuenta; if (!c?.email) { accSalir(); return; }
  if (!accesoActivo()) { toast("Modo de prueba: no hay planilla conectada.", "info"); return; }
  toast("Consultando tus compras…", "info");
  try {
    const r = await consultarAcceso(c.email);
    if (r.ok && r.encontrado) { const antes = (c.productos || []).join(); guardarCuenta(c.email, r.productos, true, r.fecha); toast(antes !== r.productos.join() ? "¡Listo! Se actualizaron tus accesos 💛" : "Tus compras están al día."); router(); }
    else toast("Todavía no aparece ninguna compra con ese correo.", "info");
  } catch (e) { toast("No pudimos conectarnos. Intentá de nuevo.", "info"); }
};
window.accSalir = () => { delete state.cuenta; delete state.pruebaPremium; delete state.pruebaDieta; delete state.pruebaNoche; save(); acc = { email: "", estado: "form", msg: "", cargando: false }; go("#/"); };

/* ---------- Día actual del recorrido ---------- */
function diaActual() {
  const inicio = state.cuenta?.inicio ? new Date(state.cuenta.inicio) : new Date();
  const d = Math.floor((Date.now() - inicio.getTime()) / 86400000) + 1;
  return Math.max(1, Math.min(CONFIG.DIAS_PLAN, d));
}

/* ---------- Materiales ---------- */
const REGALOS = [
  { titulo: "Suero de la Delgadez — Tés", desc: "La receta completa de los tés", archivo: "regalos/suero-de-la-delgadez-tes.pdf" },
  { titulo: "20 Licuados Adelgazantes", desc: "Licuados prácticos para el día a día", archivo: "regalos/20-licuados-adelgazantes.pdf" },
  { titulo: "20 Recetas Detox", desc: "Para deshinchar y limpiar", archivo: "regalos/20-recetas-detox.pdf" },
  { titulo: "40 Postres", desc: "Que aceleran el metabolismo", archivo: "regalos/40-postres-metabolismo.pdf" },
  { titulo: "Tips para Acelerar", desc: "Acelerá tu resultado", archivo: "regalos/tips-para-acelerar.pdf" }
];
const PROTOCOLOS = ["Mañana", "Noche", "Fiesta", "Viaje", "Visitas", "Fiaca y cansancio", "Vianda", "Fin de semana", "Síndrome premenstrual y ciclo", "Estrés y ansiedad"]
  .map((t, i) => ({ titulo: t, archivo: `materiales/protocolos/protocolo-${pad2(i + 1)}.html` }));
const RECETAS = ["Agua de Berenjena con Limón", "Smoothie de Zanahoria y Jengibre", "Smoothie de Banana Verde y Canela", "Jugo de Remolacha y Naranja", "Jugo de Sandía y Menta", "Agua de Pepino y Menta", "Jugo de Ananá y Cúrcuma", "Jugo de Uva Negra y Canela", "Jugo de Frutilla y Chía", "Limonada de Jengibre y Menta", "Licuado de Papaya y Lino", "Licuado de Remolacha y Manzana", "Smoothie de Maracuyá y Avena", "Jugo de Zanahoria y Naranja"]
  .map((t, i) => ({ titulo: t, archivo: `materiales/recetas/receta-${pad2(i + 1)}.html` }));
const RITUALES = ["Activar la circulación", "Deshinchar", "Aliviar dolores", "Estimular el intestino", "Bajar de peso"]
  .map((t, i) => ({ titulo: t, archivo: `materiales/rituales/ritual-${pad2(i + 1)}.html` }));

/* ---------- La Dieta Anti-Insulina (OTO 1): módulo para quien la compró ---------- */
const DIETA = {
  nombre: "La Dieta Anti-Insulina", sub: "21 días de almuerzos y cenas",
  semanas: { 1: "Semana 1 · Reset", 2: "Semana 2 · Activación", 3: "Semana 3 · Consolidación" },
  materiales: [
    { titulo: "La regla del orden del plato", sub: "El truco de 10 segundos", icono: "Utensils", archivo: "dieta/regla.html" },
    { titulo: "Lista de compras semanal", sub: "3 semanas + 15 intercambios", icono: "FileText", archivo: "dieta/compras.html" },
    { titulo: "Carta de emergencia", sub: "Pizzería, parrilla, rotisería, delivery", icono: "Umbrella", archivo: "dieta/emergencia.html" },
    { titulo: "7 platos en 10 minutos", sub: "Para los días que llegás muerta", icono: "Sparkles", archivo: "dieta/rapidos.html" }
  ]
};
const tieneDieta = () => tiene(CONFIG.PRODUCTO_DIETA);
window.abrirDietaDia = d => abrirHtml(`dieta/dia-${pad2(d)}.html`, `Día ${d} · Mi plato`);
window.abrirDietaMat = i => { const m = DIETA.materiales[i]; abrirHtml(m.archivo, m.titulo); };

/* ---------- Visor de páginas HTML (días, protocolos, recetas, rituales, evolución) ---------- */
let visor = null;
window.abrirHtml = (src, titulo) => {
  cerrarHtml(true);
  const el = document.createElement("div"); el.className = "viewer";
  el.innerHTML = `<header><button class="vback" onclick="cerrarHtml()" aria-label="Volver">${ic("ChevronLeft")}</button><p class="vtitle truncate">${esc(titulo)}</p><button class="vprint" onclick="imprimirHtml()" aria-label="Imprimir o guardar PDF">${ic("Printer")} Imprimir</button></header><iframe src="${esc(src)}" title="${esc(titulo)}"></iframe>`;
  document.body.appendChild(el); document.body.style.overflow = "hidden"; visor = el;
  history.pushState({ overlay: true }, "");
  const fr = el.querySelector("iframe");
  fr.onload = () => {
    try {
      const w = fr.contentWindow, d = fr.contentDocument; if (!w || !d) return;
      // Las páginas llaman a sendPrompt('Volver' | 'Regalos' | 'Club' | 'Evolución' | 'Dra.')
      w.sendPrompt = (txt) => {
        const c = (txt || "").toLowerCase();
        if (c.includes("volver") || c.includes("voltar")) return cerrarHtml();
        if (c.includes("regalo") || c.includes("presente")) { cerrarHtml(); go("#/regalos"); return; }
        if (c.includes("club") || c.includes("premium")) { cerrarHtml(); go("#/club"); return; }
        if (c.includes("evoluci")) { cerrarHtml(); setTimeout(abrirEvolucion, 50); return; }
        if (c.includes("dra") || c.includes("whatsapp")) { cerrarHtml(); abrirWhatsApp(); return; }
        if (c.includes("regla")) { cerrarHtml(true); setTimeout(() => abrirDietaMat(0), 30); return; }
        if (c.includes("compra")) { cerrarHtml(true); setTimeout(() => abrirDietaMat(1), 30); return; }
        if (c.includes("emergencia")) { cerrarHtml(true); setTimeout(() => abrirDietaMat(2), 30); return; }
        if (c.includes("rápido") || c.includes("rapido")) { cerrarHtml(true); setTimeout(() => abrirDietaMat(3), 30); return; }
        if (c.includes("dieta")) { cerrarHtml(); go("#/dieta"); return; }
      };
      const st = d.createElement("style");
      st.textContent = `.topbar,.backlink{display:none!important}.screen{min-height:auto!important}.body{padding-top:14px!important}
        @media print{html,body{height:auto!important;background:#fff!important}body{display:block!important}.screen{min-height:auto!important;box-shadow:none!important;background:#fff!important;max-width:none!important}
        .topbar,.backlink,.share-btn,.tag-reg{display:none!important}*{animation:none!important;transition:none!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
        .acc,.day,.gift-card,.summary,.day-row,.seg,.acc-head{opacity:1!important;transform:none!important}.acc-body{max-height:none!important;overflow:visible!important}.acc .chev{display:none!important}}`;
      d.head.appendChild(st);
    } catch (e) { /* distinto origen */ }
  };
};
window.cerrarHtml = (silencioso) => {
  if (!visor) return; visor.remove(); visor = null; document.body.style.overflow = "";
  if (!silencioso && history.state && history.state.overlay) history.back();
};
window.imprimirHtml = () => {
  const fr = visor?.querySelector("iframe"); const w = fr?.contentWindow;
  if (!w) return window.print();
  try { fr.contentDocument?.querySelectorAll(".acc").forEach(a => a.classList.add("open")); w.focus(); w.print(); } catch (e) { window.print(); }
};
window.addEventListener("popstate", () => { if (visor) cerrarHtml(true); if (hoja) cerrarHoja(true); });
window.abrirEvolucion = () => abrirHtml("evolucion.html", "Mi evolución");
// El botón de la Doctora abre el chat de la app (#/doctora). Si algún día se conecta el número de Meta,
// poner CONFIG.WHATSAPP_REAL = true y el botón vuelve a abrir WhatsApp de verdad.
window.abrirWhatsApp = () => {
  if (!esPremium()) { go("#/club"); return; }
  if (CONFIG.WHATSAPP_REAL && CONFIG.WHATSAPP) { window.open(`https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(CONFIG.WHATSAPP_TEXTO)}`, "_blank", "noopener"); return; }
  go("#/doctora");
};


/* Respuestas armadas de la Doctora (sin IA ni costo por uso) */
function respuestaDoctora(txt) {
  const t = (txt || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const dia = diaActual();
  const R = [
    [/dulce|antojo|chocolate|postre|azucar|golosina/, "Los antojos de dulce son la insulina pidiendo azúcar rápida 🍫 Probá esto: tomá tu mezcla del Truco, esperá 15 minutos y comé algo con proteína (un huevo, queso o un puñado de frutos secos). Si igual querés dulce, elegí uno de los 40 postres de Mis regalos: están pensados para no disparar el pico. ¡Vos podés! 💛"],
    [/hinchad|inflamad|panza dura|gases|digest|retencion|retengo/, "La hinchazón suele bajar en los primeros días si sos constante 💧 Hoy: tomá la mezcla en ayunas, sumá 2 litros de agua, evitá harinas blancas y gaseosas, y probá el ritual de \"Deshinchar\" que está en Materiales. Si a la noche te sentís pesada, la infusión de la noche ayuda mucho."],
    [/cumple|fiesta|asado|salida|restaurant|evento|casamiento|reunion/, "¡A disfrutar sin culpa! 🎉 Tres claves: 1) tomá la mezcla antes de salir, 2) empezá siempre por la ensalada o la carne, y dejá el pan y el postre para el final, 3) al otro día volvé a la rutina normal sin compensar. En Materiales tenés el protocolo \"Fiesta\" con todo el paso a paso."],
    [/no baje|no bajo|estancad|no adelgaz|igual peso|mismo peso|no funciona/, "Es muy común estancarse unos días, el cuerpo se acomoda antes de volver a soltar 💪 Revisemos: ¿estás tomando la mezcla todos los días a la misma hora? ¿Dormís al menos 7 horas? ¿Estás respetando el orden del plato (verdura → proteína → hidratos)? Medí tu cintura además del peso: muchas veces baja la medida antes que la balanza."],
    [/que (truco|mezcla|tomo)|cual tomo|receta|preparo|licuado|ingrediente/, "Para hoy (día " + dia + ") te recomiendo la mezcla base del Truco en ayunas y una de las recetas de Materiales → Recetas a media tarde 🥤 Si te aburriste de la misma, rotá entre el agua de pepino y menta, el jugo de ananá y cúrcuma o el licuado de papaya y lino."],
    [/hambre|ansiedad|ansiosa|picoteo|como mucho/, "Cuando hay mucha hambre casi siempre falta proteína o sueño 😊 Sumá proteína en cada comida, tomá agua antes de comer y no te saltees el almuerzo. Si la ansiedad aparece a la noche, el protocolo \"Estrés y ansiedad\" de Materiales te va a ayudar."],
    [/dormir|sueno|insomnio|cansad|energia|fiaca/, "El descanso es clave para que la insulina baje 🌙 Intentá cenar 2 horas antes de acostarte, apagar pantallas 20 minutos antes y tomar una infusión tranquila. Si te sentís sin energía de día, mirá el protocolo \"Fiaca y cansancio\" en Materiales."],
    [/medic|pastilla|diabet|presion|embaraz|lactanc|tiroides|enfermedad/, "Eso lo tenés que consultar sí o sí con tu médico de cabecera 🩺 Yo te acompaño con la rutina y los hábitos, pero no reemplazo una consulta médica, y nunca dejes ni cambies una medicación sin que te lo indique tu médico."],
    [/hola|buen dia|buenas|como estas/, "¡Hola! 💛 Qué lindo leerte. Hoy estás en el día " + dia + " de 21. Contame cómo venís: ¿cómo te sentiste con la mezcla y con las comidas de ayer?"],
    [/gracias|genial|buenisimo|perfecto|joya/, "¡De nada! 💛 Seguí así, que vas muy bien. Acá estoy cuando me necesites."]
  ];
  for (const [re, r] of R) if (re.test(t)) return r;
  return "Te leo 💛 Para ayudarte mejor contame un poquito más: ¿en qué día de la rutina estás y qué te está costando más (antojos, hambre, hinchazón, organizarte con las comidas)? Mientras tanto, recordá: mezcla en ayunas, orden del plato y 2 litros de agua. ¡Un día a la vez!";
}
/* ---------- Chat con la Doctora del Truco (aspecto de WhatsApp, responde con IA) ---------- */
const CHAT_MAX = 120;                       // mensajes que se guardan en el teléfono
let chatEnviando = false;
const horaCorta = t => new Date(t).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
const textoChat = s => esc(s).replace(/\n/g, "<br>");
function chatMensajes() {
  if (!Array.isArray(state.chatDoctora) || !state.chatDoctora.length) {
    const nombre = ((state.cuenta && state.cuenta.email) || "").split("@")[0].split(/[._\-+\d]/)[0];
    const n = nombre ? nombre.charAt(0).toUpperCase() + nombre.slice(1) : "";
    state.chatDoctora = [{ rol: "doctora", texto: `Hola${n ? " " + n : ""} 💛 Soy la Doctora del Truco, la asistente de Claudia. Estoy acá las 24 horas para acompañarte en tus 21 días.\n\nContame, ¿en qué día de la rutina estás y en qué te ayudo hoy?`, t: Date.now(), bienvenida: true }];
    save();
  }
  return state.chatDoctora;
}
const SUGERENCIAS = ["Tengo antojo de dulce 🍫", "¿Qué Truco tomo hoy?", "Me siento hinchada", "Tengo un cumpleaños", "No bajé nada esta semana"];
function burbuja(m) {
  const yo = m.rol === "usuaria";
  return `<div class="wa-row ${yo ? "yo" : "ella"}"><div class="wa-msg ${m.error ? "err" : ""}"><span class="txt">${textoChat(m.texto)}</span><span class="meta">${horaCorta(m.t)}${yo ? ` <svg class="ticks" viewBox="0 0 16 11"><path d="M11.07.65 4.6 7.12 1.93 4.45.5 5.88l4.1 4.1L12.5 2.07zM15.5 2.07 14.07.65 7.6 7.12l-.9-.9-1.43 1.43 2.33 2.33z" fill="currentColor"/></svg>` : ""}</span></div></div>`;
}
function viewDoctora() {
  if (!esPremium()) { location.replace("#/club"); return; }
  document.title = CONFIG.DRA;
  const msgs = chatMensajes();
  const soloBienvenida = msgs.length === 1;
  render(`<div class="wa-screen">
    <header class="wa-top">
      <button class="wa-back" onclick="go('#/')" aria-label="Volver">${ic("ChevronLeft")}</button>
      <img class="wa-av" src="assets/doctora.jpg" alt="">
      <div class="wa-who"><p class="n">${esc(CONFIG.DRA)}</p><p class="s" id="wa-estado">en línea</p></div>
    </header>
    <div class="wa-body" id="wa-body">
      <div class="wa-day"><span>HOY</span></div>
      <div class="wa-cifrado">🔒 Los mensajes son privados. La Doctora es la asistente de Claudia, entrenada con su método. No reemplaza a tu médico.</div>
      ${msgs.map(burbuja).join("")}
      <div class="wa-row ella" id="wa-typing" hidden><div class="wa-msg typing"><i></i><i></i><i></i></div></div>
    </div>
    ${soloBienvenida ? `<div class="wa-sug" id="wa-sug">${SUGERENCIAS.map(x => `<button onclick="chatSugerencia(this)">${esc(x)}</button>`).join("")}</div>` : ""}
    <form class="wa-bar" onsubmit="chatEnviar(event)">
      <textarea id="wa-input" rows="1" placeholder="Mensaje" oninput="chatAutoAlto(this)" onkeydown="if(event.key==='Enter'&&!event.shiftKey&&window.innerWidth>700){event.preventDefault();chatEnviar(event)}"></textarea>
      <button class="wa-send" type="submit" aria-label="Enviar"><svg viewBox="0 0 24 24"><path d="M1.1 21.8 23 12 1.1 2.2 1 9.8l15.7 2.2L1 14.2z" fill="currentColor"/></svg></button>
    </form>
  </div>`);
  chatAbajo();
}
function chatAbajo() { const b = $("#wa-body"); if (b) b.scrollTop = b.scrollHeight; }
window.chatAutoAlto = el => { el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 120) + "px"; };
window.chatSugerencia = btn => { const i = $("#wa-input"); i.value = btn.textContent.replace(/\s*[🍫]\s*$/u, "").trim(); chatEnviar(); };
window.chatEnviar = async (ev) => {
  ev?.preventDefault();
  const input = $("#wa-input"); const texto = (input?.value || "").trim();
  if (!texto || chatEnviando) return;
  chatEnviando = true; input.value = ""; chatAutoAlto(input); $("#wa-sug")?.remove();
  const msgs = chatMensajes();
  const historial = msgs.filter(m => !m.error && !m.bienvenida).slice(-14).map(m => ({ rol: m.rol, texto: m.texto }));
  const mio = { rol: "usuaria", texto, t: Date.now() };
  msgs.push(mio); save();
  const typing = $("#wa-typing"); typing.insertAdjacentHTML("beforebegin", burbuja(mio));
  setTimeout(() => { typing.hidden = false; const e = $("#wa-estado"); if (e) e.textContent = "escribiendo…"; chatAbajo(); }, 600);
  chatAbajo();
  let resp;
  await new Promise(r => setTimeout(r, 1400 + Math.random() * 1200));
  resp = { rol: "doctora", texto: respuestaDoctora(texto, historial), t: Date.now() };
  if (!resp) { resp = { rol: "doctora", texto: "Se me cortó la conexión 😕 Volvé a mandarme tu mensaje en un minuto.", t: Date.now(), error: true }; if (input && !input.value) input.value = texto; }
  msgs.push(resp); state.chatDoctora = msgs.slice(-CHAT_MAX); save();
  typing.hidden = true; const e = $("#wa-estado"); if (e) e.textContent = "en línea";
  typing.insertAdjacentHTML("beforebegin", burbuja(resp)); chatAbajo();
  chatEnviando = false;
};

/* ---------- Hoja inferior (bottom sheet) ---------- */
let hoja = null;
function abrirHoja(html, titulo) {
  cerrarHoja(true);
  const el = document.createElement("div"); el.className = "sheet-wrap";
  el.innerHTML = `<div class="sheet-bg" onclick="cerrarHoja()"></div><div class="sheet"><div class="handle"></div><div class="head">${titulo ? `<h2 class="truncate">${esc(titulo)}</h2>` : "<span></span>"}<button class="close" onclick="cerrarHoja()" aria-label="Cerrar">${ic("X")}</button></div><div class="content">${html}</div></div>`;
  document.body.appendChild(el); document.body.style.overflow = "hidden"; hoja = el; history.pushState({ overlay: true }, "");
}
window.cerrarHoja = (silencioso) => { if (!hoja) return; hoja.remove(); hoja = null; document.body.style.overflow = ""; if (!silencioso && history.state && history.state.overlay) history.back(); };

/* ---------- Cabeceras ---------- */
function topbarJornada() {
  const premium = esPremium();
  const derecha = premium
    ? `<button class="action" onclick="abrirWhatsApp()"><span class="ic">${WA("")}</span><span>${esc(CONFIG.DRA)}</span></button>
       <button class="action" onclick="abrirEvolucion()"><span class="ic">${ic("Camera", "", 1.8)}</span><span>Mi evolución</span></button>
       <button class="action" onclick="go('#/regalos')"><span class="ic">${ic("Gift", "", 1.8)}</span><span>Regalos</span></button>`
    : `<button class="chip-gift" onclick="go('#/regalos')">${ic("Gift")}<span>Regalos</span></button>
       <button class="chip-banner" onclick="go('#/club')">${WA("wa")}<span class="t truncate">${esc(CONFIG.DRA)} en WhatsApp</span><span class="go">${ic("ChevronRight")}</span></button>`;
  return `<header class="topbar"><div class="row"><button class="logo-btn" onclick="go('#/')" aria-label="Volver al inicio">${wb(44)}</button>${derecha}</div></header>`;
}
const topbarSimple = (titulo, back = "history.back()") => `<header class="topbar simple"><div class="row"><button class="back-btn" onclick="${back}" aria-label="Volver">${ic("ChevronLeft")}</button><h1 class="truncate">${esc(titulo)}</h1></div></header>`;
const brand = compact => `<div class="brand ${compact ? "compact" : ""}">${wb(compact ? 52 : 74)}<p class="word">CLUB <em>DEL</em> TRUCO</p><div class="divider"><i></i><span>✦</span><i></i></div></div>`;

/* ---------- INICIO ---------- */
function viewHome() {
  const premium = esPremium();
  const cuerpo = premium
    ? `<div class="premium-home">
        <div class="crown">${ic("Crown")}</div>
        <p class="pre">Formás parte del</p>
        <h1>Club Premium</h1>
        <p>Y tenés acceso a la <b>${esc(CONFIG.DRA)} en tu WhatsApp</b>.</p>
        <button class="btn-club" onclick="go('#/jornada')">${ic("Crown", "", 1.8)}<span>Acceder a mi club</span>${ic("ChevronRight", "", 2.2)}</button>
      </div>
      <div style="margin-top:1.25rem">${dietaCard()}${nocheCard()}</div>`
    : `<p class="eyebrow">Mis accesos</p>
      <button class="access-card" onclick="go('#/jornada')"><span class="ic">${LEAF}</span><span class="mid"><span class="t">${esc(CONFIG.PROGRAMA)}</span><span class="s">Mi rutina</span></span>${ic("ChevronRight", "chev")}</button>
      ${dietaCard()}${nocheCard()}
      <button class="gold-card" onclick="go('#/club')">
        <span class="wa">${WA("")}</span>
        <span class="pre">Tené a la</span>
        <span class="big">${esc(CONFIG.DRA)} en tu WhatsApp</span>
        <span class="divider"><i></i><span>✦</span><i></i></span>
        <span class="txt">${esc(CONFIG.PROGRAMA)} te muestra el camino; la ${esc(CONFIG.DRA)} lo recorre con vos por WhatsApp.</span>
        <span class="go">${ic("ChevronRight")}</span>
      </button>`;
  render(`<div class="screen home">
    <button class="settings" onclick="go('#/perfil')" aria-label="Mi cuenta">${ic("Settings")}</button>
    ${brand(premium)}
    ${cardInstalar()}
    ${cuerpo}
  </div>`);
}

const dietaCard = () => tieneDieta()
  ? `<button class="access-card dieta" onclick="go('#/dieta')"><span class="ic">${ic("Utensils")}</span><span class="mid"><span class="t">${esc(DIETA.nombre)}</span><span class="s">${esc(DIETA.sub)} · Día ${diaActual()}</span></span>${ic("ChevronRight", "chev")}</button>`
  : bumpVisible() ? `<button class="access-card locked" onclick="abrirBump()"><span class="ic">${ic("Lock")}</span><span class="mid"><span class="t">${esc(DIETA.nombre)}</span><span class="s">${esc(DIETA.sub)} · ${esc(CONFIG.BUMP.precio)}</span></span>${ic("ChevronRight", "chev")}</button>` : "";

/* ---------- JORNADA (21 días) ---------- */
function viewJornada() {
  const premium = esPremium(); const hoy = diaActual(); const hechos = hoy - 1; const pct = Math.round(hechos / CONFIG.DIAS_PLAN * 100);
  const dias = Array.from({ length: CONFIG.DIAS_PLAN }, (_, i) => i + 1).map(d => {
    const done = d < hoy, today = d === hoy;
    return `<button class="day ${done ? "done" : ""} ${today ? "today" : ""}" onclick="abrirDia(${d})">${today ? `<span class="hoy">Hoy</span>` : ""}<span class="l">Día</span><span class="n">${d}</span>${done ? `<span class="chk">${ic("Check")}</span>` : ""}</button>`;
  }).join("");
  const B = CONFIG.BUMP; const bump = bumpVisible() ? `<div style="margin-bottom:1.5rem"><button class="bump-card" onclick="abrirBump()"><span class="ic">${ic(B.icono || "Salad")}</span><span class="mid"><p class="t">${esc(B.titulo)}</p><p class="s">${esc(B.sub)} · ${esc(B.precio)}</p></span>${ic("ChevronRight", "chev")}</button></div>` : "";
  render(`<div class="screen">
    ${topbarJornada()}
    <div class="jornada-body">
      <div class="jornada-head">
        <p class="pre">Tu recorrido</p>
        <h1>21 días para tu resultado</h1>
        <div class="progress"><div class="track"><i class="fill" style="width:${pct}%"></i></div><span class="n">${hechos} de ${CONFIG.DIAS_PLAN}</span></div>
      </div>
      ${bump}
      ${tieneDieta() ? `<button class="plato-hoy" onclick="abrirDietaDia(${hoy})"><span class="ic">${ic("Utensils")}</span><span class="mid"><p class="t">Mi plato de hoy · Día ${hoy}</p><p class="s">${esc(platoDe(hoy))}</p></span>${ic("ChevronRight", "chev")}</button>` : ""}
      <div class="days">${dias}</div>
    </div>
  </div>`);
  bumpAutomatico();
}
window.abrirDia = d => abrirHtml(`dias/dia-${pad2(d)}${esPremium() ? "-premium" : ""}.html`, `Día ${d}`);

/* Oferta interna (aparece sola algunas veces, como en la app original) */
const bumpVisible = () => { const B = CONFIG.BUMP; return !!(B.activo && B.url && !(B.producto && tiene(B.producto))); };
function bumpAutomatico() {
  if (!bumpVisible()) return; const B = CONFIG.BUMP;
  const s = state.bump || { aperturas: 0, veces: 0, ultima: 0, cerrada: false };
  s.aperturas += 1;
  const puede = !s.cerrada && s.veces < B.veces_max && (Date.now() - s.ultima) > B.cada_horas * 3600000 && s.aperturas >= B.aparece_desde_apertura;
  if (puede) { s.veces += 1; s.ultima = Date.now(); setTimeout(abrirBump, 600); }
  state.bump = s; save();
}
window.abrirBump = () => {
  const B = CONFIG.BUMP;
  abrirHoja(`<div class="bump-hero"><span class="ic">${ic(B.icono || "Salad")}</span><p class="pre">Oferta exclusiva para vos</p><h2>${esc(B.nombre)}</h2><p>${esc(B.lead)}</p></div>
    <div class="bump-list">${B.incluye.map(i => `<div class="row">${ic("Check")}<p>${esc(i)}</p></div>`).join("")}</div>
    <div class="bump-price"><p class="l">Pago único</p><p class="p">${esc(B.precio)}</p></div>
    <button class="btn gold lg full" style="margin-top:1rem" onclick="irBump()">${esc(B.cta || ("Quiero " + B.nombre + " por " + B.precio))}</button>
    <button class="bump-no" onclick="cerrarHoja()">Ahora no</button><div style="height:.5rem"></div>`);
};
window.irBump = () => {
  state.bump = { ...(state.bump || {}), cerrada: true }; save();
  const u = CONFIG.BUMP.url; const email = state.cuenta?.email ? (u.includes("?") ? "&" : "?") + "e=" + encodeURIComponent(state.cuenta.email) : "";
  window.open(u + email, "_blank", "noopener,noreferrer"); cerrarHoja();
};

/* ---------- DIETA (#/dieta) ---------- */
const PLATOS = window.DIETA_PLATOS || {};   // {n: "Almuerzo · Cena"} lo llena dieta-platos.js
const platoDe = d => PLATOS[d] || "Almuerzo y cena con el orden del plato";
function viewDieta() {
  if (!tieneDieta()) { go("#/"); return; }
  const hoy = diaActual(); const hechos = hoy - 1; const pct = Math.round(hechos / CONFIG.DIAS_PLAN * 100);
  const dias = Array.from({ length: CONFIG.DIAS_PLAN }, (_, i) => i + 1).map(d => {
    const done = d < hoy, today = d === hoy;
    return `<button class="day ${done ? "done" : ""} ${today ? "today" : ""}" onclick="abrirDietaDia(${d})">${today ? `<span class="hoy">Hoy</span>` : ""}<span class="l">Día</span><span class="n">${d}</span>${done ? `<span class="chk">${ic("Check")}</span>` : ""}</button>`;
  }).join("");
  const mats = DIETA.materiales.map((m, i) => `<button class="list-row" onclick="abrirDietaMat(${i})">${ic(m.icono, "lead")}<span class="t">${esc(m.titulo)}<small>${esc(m.sub)}</small></span>${ic("ChevronRight", "chev")}</button>`).join("");
  render(`<div class="screen">
    ${topbarSimple(DIETA.nombre, "go('#/')")}
    <div class="jornada-body">
      <div class="jornada-head">
        <p class="pre">${esc(DIETA.semanas[hoy <= 7 ? 1 : hoy <= 14 ? 2 : 3])}</p>
        <h1>Tus 21 días de almuerzos y cenas</h1>
        <div class="progress"><div class="track"><i class="fill" style="width:${pct}%"></i></div><span class="n">${hechos} de ${CONFIG.DIAS_PLAN}</span></div>
      </div>
      <div class="regla-box"><p class="t">El orden del plato</p><div class="r"><span><b>1</b>Verdura</span><i>›</i><span><b>2</b>Proteína</span><i>›</i><span><b>3</b>Carbohidrato</span></div></div>
      <button class="plato-hoy" onclick="abrirDietaDia(${hoy})"><span class="ic">${ic("Utensils")}</span><span class="mid"><p class="t">Mi plato de hoy · Día ${hoy}</p><p class="s">${esc(platoDe(hoy))}</p></span>${ic("ChevronRight", "chev")}</button>
      <div class="days">${dias}</div>
      <p class="sec-eyebrow" style="margin-top:1.5rem">Materiales</p>
      <div class="list-card">${mats}</div>
    </div>
  </div>`);
}

/* ---------- EL SECRETO DE LA NOCHE (#/noche) ---------- */
const NOCHE = window.NOCHE || { audios: [], infusiones: [], focos: [], semanas: [] };
const tieneNoche = () => tiene(CONFIG.PRODUCTO_NOCHE);
const nocheCard = () => tieneNoche()
  ? `<button class="access-card noche" onclick="go('#/noche')"><span class="ic">${LUNA}</span><span class="mid"><span class="t">${esc(NOCHE.nombre)}</span><span class="s">Esta noche · Noche ${diaActual()} de 21</span></span>${ic("ChevronRight", "chev")}</button>`
  : CONFIG.NOCHE_URL ? `<button class="access-card locked noche-lock" onclick="go('#/noche')"><span class="ic">${ic("Lock")}</span><span class="mid"><span class="t">${esc(NOCHE.nombre)}</span><span class="s">Dormí mejor y desinflamate · ${esc(CONFIG.NOCHE_PRECIO)}</span></span>${ic("ChevronRight", "chev")}</button>` : "";
const LUNA = `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/></svg>`;
const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
function fechaNoche(n) { const ini = state.cuenta?.inicio ? new Date(state.cuenta.inicio) : new Date(); const d = new Date(ini.getTime()); d.setDate(d.getDate() + n - 1); return d; }
const infusionDe = n => NOCHE.infusiones.find(x => x.dia === DIAS_SEMANA[fechaNoche(n).getDay()]) || NOCHE.infusiones[0];
const audioDe = n => NOCHE.audios[(n - 1) % NOCHE.audios.length];
const nochesHechas = () => (state.noche && state.noche.hechas) || {};
window.marcarNoche = n => { state.noche = state.noche || { hechas: {} }; state.noche.hechas = state.noche.hechas || {}; if (state.noche.hechas[n]) delete state.noche.hechas[n]; else state.noche.hechas[n] = true; save(); viewNoche(location.hash.slice(8)); };
function nocheTop(titulo, atras) {
  return `<header class="noche-top"><button class="wa-back" onclick="${atras || "go('#/noche')"}" aria-label="Volver">${ic("ChevronLeft")}</button><p class="t truncate">${esc(titulo)}</p></header>`;
}
function viewNoche(sub) {
  if (!tieneNoche()) { if (CONFIG.NOCHE_URL) nocheLanding(); else go("#/"); return; }
  document.title = NOCHE.nombre;
  const parte = (sub || "").split("/")[0];
  if (parte === "ritual") return nocheRitual();
  if (parte === "infusiones") return nocheInfusiones();
  if (parte === "audios") return nocheAudios();
  if (parte === "cena") return nocheCena();
  if (parte === "plan") return noche21();
  const n = diaActual(); const inf = infusionDe(n); const au = audioDe(n); const hecha = !!nochesHechas()[n];
  const mods = [
    ["ritual", "Clock", "El Ritual de los 20 Minutos", "Los 5 pasos antes de acostarte"],
    ["infusiones", "Coffee", "Las 7 Infusiones de la Noche", "Una para cada día de la semana"],
    ["audios", "Headphones", "Los 7 Audios para Dormir", "Poné play, cerrá los ojos"],
    ["cena", "Utensils", "La Cena que te Deja Dormir", "Qué cenar y a qué hora"],
    ["plan", "CalendarDays", "El Plan de 21 Noches", "Una noche por cada día de tu jornada"]
  ];
  render(`<div class="screen noche-screen">
    ${nocheTop(NOCHE.nombre, "go('#/')")}
    <div class="noche-body">
      <div class="noche-hero"><span class="moon">${LUNA}</span><p class="pre">${esc(NOCHE.semanas[n <= 7 ? 0 : n <= 14 ? 1 : 2] || "")}</p><h1>Esta noche · Noche ${n}</h1><p class="foco">${esc(NOCHE.focos[n - 1] || "")}</p></div>
      <div class="tonight">
        <button class="tn-row" onclick="go('#/noche/infusiones')"><span class="emo">${inf.emoji}</span><span class="mid"><span class="l">Infusión de hoy · ${esc(inf.dia)}</span><span class="v">${esc(inf.nombre)}</span></span>${ic("ChevronRight", "chev")}</button>
        <button class="tn-row" onclick="abrirAudio(${au.n})"><span class="emo">🎧</span><span class="mid"><span class="l">Audio de esta noche</span><span class="v">${au.n} · ${esc(au.titulo)}</span></span>${ic("ChevronRight", "chev")}</button>
        <button class="tn-check ${hecha ? "on" : ""}" onclick="marcarNoche(${n})">${hecha ? ic("CircleCheck") + " Hice el ritual esta noche" : "Marcar: hice el ritual esta noche"}</button>
      </div>
      <p class="intro-noche">${esc(NOCHE.intro)}</p>
      <div class="list-card">${mods.map(m => `<button class="list-row" onclick="go('#/noche/${m[0]}')">${ic(m[1], "lead")}<span class="t">${esc(m[2])}<small>${esc(m[3])}</small></span>${ic("ChevronRight", "chev")}</button>`).join("")}</div>
    </div>
  </div>`);
}
/* ---------- Mini landing de venta de El Secreto de la Noche (para quien no lo compró) ---------- */
function nocheLanding() {
  document.title = NOCHE.nombre;
  const mods = [
    ["ritual", "El Ritual de los 20 Minutos", "Lo que hacés antes de acostarte, paso a paso, para apagar el cortisol. Sin aparatos, sin gastar nada. Y una versión de 10 minutos para las noches en que llegás muerta."],
    ["infusiones", "Las 7 Infusiones de la Noche", "Una para cada día de la semana: tilo, manzanilla con cedrón, melisa, pasionaria… Todo de dietética, nada caro."],
    ["audios", "Los Audios para Dormir", "Audios cortos con la voz de Claudia para escuchar en la cama y cortar la cabeza a mil."],
    ["cena", "La Cena que te Deja Dormir", "Qué cenar y a qué hora para que la digestión no te despierte a las 3 de la mañana. Y qué hacer si igual te despertás."],
    ["plan", "El Plan de 21 Noches", "Una noche por cada día de tu jornada, para que el sueño acompañe al licuado de principio a fin."]
  ];
  render(`<div class="screen noche-screen">
    ${nocheTop(NOCHE.nombre, "go('#/')")}
    <div class="noche-body nl">
      <p class="nl-kicker">Solo para quienes ya empezaron El Truco de la Insulina</p>
      <h1 class="nl-h1">Hacés todo bien de día… <span>y lo perdés de noche</span></h1>
      <p class="nl-lead">Si te levantás hinchada aunque hayas comido bien, si te despertás a las 3 de la mañana con la cabeza a mil o si a la tarde te comerías todo lo que encontrás, el problema no es lo que comés. <b>Es cómo dormís.</b></p>
      <div class="nl-img"><img src="assets/noche/portada.jpg" alt="El Secreto de la Noche en la app"></div>

      <h2 class="nl-h2">Lo que pasa mientras dormís</h2>
      <p class="nl-p">Durante el día el licuado le baja la insulina a tu cuerpo. Pero cuando dormís mal, tu cuerpo larga <b>cortisol</b>. Y el cortisol le ordena al hígado que tire azúcar a la sangre.</p>
      <p class="nl-p">Resultado: te levantás con <b>la insulina alta antes de comer un solo bocado</b>. Es como destapar el desagüe de día y volver a taparlo de noche. Todos los días.</p>
      <div class="nl-dato"><b>Cerca de un 20 %</b><span>es lo que puede bajar tu sensibilidad a la insulina después de <b>una sola noche</b> de sueño corto. Imaginate años de dormir mal.</span></div>
      <div class="nl-msgs">
        <div class="nl-msg">“Clau, hago todo bien y me levanto hinchada igual.”</div>
        <div class="nl-msg">“Duermo seis horas y me despierto más cansada que cuando me acosté.”</div>
      </div>
      <p class="nl-big">No es la edad. No es falta de voluntad. <span>Es cortisol.</span></p>
      <p class="nl-p">Y se arregla sin pastillas y sin dormir diez horas: apagando el cortisol en los <b>últimos 20 minutos del día</b>. Cuando el cortisol baja, tu cuerpo entra en modo reparación: la insulina baja, usa la grasa guardada como energía y te despertás <b>más liviana</b>.</p>

      <h2 class="nl-h2">Qué tenés adentro</h2>
      ${mods.map((m, i) => `<div class="nl-mod"><img src="assets/noche/${m[0]}.jpg" alt=""><div class="mid"><p class="n">${i + 1}</p><p class="t">${esc(m[1])}</p><p class="d">${esc(m[2])}</p></div></div>`).join("")}
      <p class="nl-p" style="text-align:center">Todo adentro de esta app, <b>al lado de tu jornada</b>. Lo activás hoy y esta misma noche hacés el primer ritual.</p>

      <div class="nl-precio">
        <p class="pre">¿Cuánto vale despertarte deshinchada y con la insulina baja antes del desayuno?</p>
        <p class="ancla">Valor: <s>${esc(CONFIG.NOCHE_ANCLA)}</s></p>
        <p class="hoy">Hoy, dentro de la app</p>
        <p class="precio">${esc(CONFIG.NOCHE_PRECIO)}</p>
        <p class="once">Pago único · sin cuotas ni suscripción · tuyo para siempre</p>
      </div>
      <div class="nl-gar">${ic("ShieldCheck")}<div><p class="t">Garantía de 30 días</p><p class="d">Si no dormís mejor y no te despertás más liviana, nos escribís y te devolvemos cada peso. Sin preguntas.</p></div></div>
      <ul class="nl-bullets">${["Acceso al instante, en esta misma app", "Entrás con el mismo correo de siempre", "Sin aparatos, sin pastillas, ingredientes de dietética"].map(b => `<li>${ic("Check")} ${esc(b)}</li>`).join("")}</ul>
      <p class="nl-final">Podés seguir haciendo todo bien de día y perdiéndolo de noche… o hacer que <b>tu cuerpo trabaje para vos también mientras dormís</b>.</p>
      <p class="nl-ya">¿Ya lo compraste? <button onclick="accActualizar()">Actualizar mis compras</button></p>
    </div>
    <div class="cta-bar"><button class="cta-gold" onclick="comprarNoche()">${LUNA}<span>AGREGAR EL SECRETO DE LA NOCHE A MI PLAN · ${esc(CONFIG.NOCHE_PRECIO)}</span></button></div>
  </div>`);
}
window.comprarNoche = () => {
  const u = CONFIG.NOCHE_URL; if (!u) return;
  const email = state.cuenta?.email ? (u.includes("?") ? "&" : "?") + "e=" + encodeURIComponent(state.cuenta.email) : "";
  window.open(u + email, "_blank", "noopener");
};
function nocheRitual() {
  const R = NOCHE.ritual;
  render(`<div class="screen noche-screen">${nocheTop(R.titulo)}
    <div class="noche-body">
      <p class="lead-noche">${esc(R.bajada)}</p>
      <div class="cuando">${ic("Clock")} ${esc(R.cuando)}</div>
      ${R.pasos.map(p => `<div class="paso"><span class="num">${p.n}</span><div class="mid"><p class="t">${esc(p.titulo)} <small>${p.min} min</small></p><p class="d">${esc(p.texto)}</p><p class="tip">💡 ${esc(p.tip)}</p></div></div>`).join("")}
      <div class="corto"><p class="t">${esc(R.corto.titulo)}</p><p class="d">${esc(R.corto.texto)}</p><ol>${R.corto.pasos.map(x => `<li>${esc(x)}</li>`).join("")}</ol></div>
    </div></div>`);
}
function nocheInfusiones() {
  const hoy = DIAS_SEMANA[new Date().getDay()];
  render(`<div class="screen noche-screen">${nocheTop("Las 7 Infusiones de la Noche")}
    <div class="noche-body">
      <p class="lead-noche">Una para cada día de la semana. Todo se consigue en dietética o en el súper. Tomala tibia, sin azúcar, 30 minutos antes de acostarte.</p>
      ${NOCHE.infusiones.map(x => `<div class="infu ${x.dia === hoy ? "hoy" : ""}">
        <div class="head"><span class="emo">${x.emoji}</span><div><p class="dia">${esc(x.dia)}${x.dia === hoy ? ` <b>HOY</b>` : ""}</p><p class="n">${esc(x.nombre)}</p></div></div>
        <p class="para">${esc(x.para)}</p>
        <p class="lbl">Ingredientes</p><ul>${x.ingredientes.map(i => `<li>${esc(i)}</li>`).join("")}</ul>
        <p class="lbl">Cómo se prepara</p><p class="d">${esc(x.prep)}</p>
        <p class="warn">⚠️ ${esc(x.cuidado)}</p><p class="donde">🛒 ${esc(x.donde)}</p>
      </div>`).join("")}
    </div></div>`);
  setTimeout(() => document.querySelector(".infu.hoy")?.scrollIntoView({ block: "start", behavior: "smooth" }), 250);
}
let audioAbierto = null;
window.abrirAudio = n => { audioAbierto = n; go("#/noche/audios"); setTimeout(() => document.getElementById("au-" + n)?.scrollIntoView({ block: "start", behavior: "smooth" }), 250); };
window.verGuion = n => { const el = document.getElementById("gu-" + n); if (el) el.hidden = !el.hidden; };
function nocheAudios() {
  const src = n => `audios/noche/audio-${pad2(n)}.mp3`;
  render(`<div class="screen noche-screen">${nocheTop("Los 7 Audios para Dormir")}
    <div class="noche-body">
      <p class="lead-noche">Audios cortos con la voz de Claudia para cortar la cabeza a mil. Acostate, apagá la luz, poné play y cerrá los ojos. Si te dormís en el medio, funcionó.</p>
      ${NOCHE.audios.map(a => `<div class="audio-card ${audioAbierto === a.n ? "on" : ""}" id="au-${a.n}">
        <div class="head"><span class="num">${a.n}</span><div class="mid"><p class="t">${esc(a.titulo)}</p><p class="s">${esc(a.para)}</p></div></div>
        <audio controls preload="none" src="${src(a.n)}" data-n="${a.n}"></audio>
        <p class="sin-audio" hidden>El audio estará disponible muy pronto. Mientras tanto, podés leer el texto despacio.</p>
        <button class="ver-guion" onclick="verGuion(${a.n})">Ver el texto del audio</button>
        <div class="guion" id="gu-${a.n}" hidden>${esc(a.guion).replace(/\n/g, "<br>")}</div>
      </div>`).join("")}
    </div></div>`);
  // Si el mp3 de un audio todavía no está subido, se oculta el reproductor y se muestra el texto para leer
  document.querySelectorAll(".audio-card audio").forEach(el => {
    fetch(el.getAttribute("src"), { method: "HEAD" }).then(r => { if (!r.ok) throw 0; }).catch(() => {
      el.hidden = true; el.nextElementSibling.hidden = false; const g = document.getElementById("gu-" + el.dataset.n); if (g) g.hidden = false;
      const b = el.parentElement.querySelector(".ver-guion"); if (b) b.hidden = true;
    });
  });
}
function nocheCena() {
  const C = NOCHE.cena;
  render(`<div class="screen noche-screen">${nocheTop(C.titulo)}
    <div class="noche-body">
      <p class="lead-noche">${esc(C.bajada)}</p>
      <div class="cuando">${ic("Clock")} ${esc(C.horario)}</div>
      <p class="sec-eyebrow">Los 3 errores de la cena</p>
      ${C.errores.map((e, i) => `<div class="paso"><span class="num rojo">${i + 1}</span><div class="mid"><p class="t">${esc(e.t)}</p><p class="d">${esc(e.d)}</p></div></div>`).join("")}
      <div class="regla-box" style="margin:1rem 0"><p class="t">El orden del plato, también de noche</p><p class="d" style="font-size:14px;line-height:1.5;margin-top:.4rem">${esc(C.plato)}</p></div>
      <p class="sec-eyebrow">10 cenas que ayudan a dormir</p>
      <div class="cenas">${C.platos.map((x, i) => `<div class="cena"><span class="n">${i + 1}</span><div><p class="t">${esc(x.n)}</p><p class="d">${esc(x.p)}</p></div></div>`).join("")}</div>
      <div class="corto"><p class="t">${esc(C.despertar.titulo)}</p><ol>${C.despertar.pasos.map(x => `<li>${esc(x)}</li>`).join("")}</ol></div>
    </div></div>`);
}
function noche21() {
  const hoy = diaActual(); const h = nochesHechas(); const cuantas = Object.keys(h).length;
  const fila = (s) => Array.from({ length: 7 }, (_, i) => s * 7 + i + 1).map(n => `<button class="moon-day ${h[n] ? "done" : ""} ${n === hoy ? "today" : ""} ${n > hoy ? "futura" : ""}" onclick="detalleNoche(${n})"><span>${n}</span>${n === hoy ? "<i>HOY</i>" : ""}</button>`).join("");
  render(`<div class="screen noche-screen">${nocheTop("El Plan de 21 Noches")}
    <div class="noche-body">
      <p class="lead-noche">Una noche por cada día de tu jornada, para que el sueño acompañe al licuado de principio a fin. Tocá una noche para ver qué te toca.</p>
      <div class="progress" style="margin:.5rem 0 1.25rem"><div class="track"><i class="fill" style="width:${Math.round(cuantas / 21 * 100)}%"></i></div><span class="n">${cuantas} de 21</span></div>
      ${[0, 1, 2].map(s => `<p class="sec-eyebrow">${esc(NOCHE.semanas[s])}</p><div class="moon-row">${fila(s)}</div>`).join("")}
      <div id="det-noche"></div>
    </div></div>`);
  detalleNoche(hoy);
}
window.detalleNoche = n => {
  const el = document.getElementById("det-noche"); if (!el) return;
  const inf = infusionDe(n), au = audioDe(n), hecha = !!nochesHechas()[n];
  el.innerHTML = `<div class="det"><p class="t">Noche ${n}${n === diaActual() ? " · Hoy" : ""}</p><p class="d">${esc(NOCHE.focos[n - 1] || "")}</p>
    <p class="d">${inf.emoji} ${esc(inf.nombre)} &nbsp;·&nbsp; 🎧 Audio ${au.n}: ${esc(au.titulo)}</p>
    ${n <= diaActual() ? `<button class="tn-check ${hecha ? "on" : ""}" onclick="marcarNoche(${n})">${hecha ? ic("CircleCheck") + " Hecha" : "Marcar como hecha"}</button>` : ""}</div>`;
};

/* ---------- REGALOS ---------- */
let ui = { matAbierto: false, grupos: {} };
function viewRegalos() {
  const premium = esPremium();
  const grupo = (id, label, icono, lista) => `<div class="group ${ui.grupos[id] ? "open" : ""}">
      <button class="group-head" onclick="toggleGrupo('${id}')"><span class="ic">${ic(icono)}</span><span class="mid"><span class="t">${esc(label)}</span><span class="s">${lista.length} materiales · tocá para ver</span></span>${ic("ChevronDown", "chev")}</button>
      ${ui.grupos[id] ? `<div class="group-body">${lista.map(m => `<button class="mat-item" onclick="abrirHtml('${m.archivo}', '${esc(m.titulo).replace(/'/g, "\\'")}')"><span class="dot">${ic("ChevronRight")}</span><span class="t truncate">${esc(m.titulo)}</span>${ic("Download", "end")}</button>`).join("")}</div>` : ""}
    </div>`;
  render(`<div class="screen">
    ${topbarSimple("Regalos")}
    <div class="regalos-body">
      <p class="intro">Tus bonus para descargar y usar cuando quieras.</p>
      <p class="sec-eyebrow">Para descargar</p>
      <div class="stack">${REGALOS.map(r => `<a class="gift-card" href="${r.archivo}" target="_blank" rel="noopener"><span class="ic">${ic("FileText")}</span><span class="mid"><span class="t">${esc(r.titulo)}</span><span class="s">${esc(r.desc)}</span></span><span class="end">${ic("Download")}</span></a>`).join("")}</div>
      ${premium ? `
      <button class="club-mat ${ui.matAbierto ? "open" : ""}" onclick="toggleMat()"><span class="ic">${ic("FolderOpen")}</span><span class="mid"><span class="t">${ic("Sparkles")} Materiales exclusivos del Club</span><span class="s">${ui.matAbierto ? "Tocá para cerrar" : "Tocá acá para ver"}</span></span>${ic("ChevronDown", "chev")}</button>
      ${ui.matAbierto ? `<div class="stack" style="margin-top:.75rem">
        ${grupo("prot", "Protocolos para imprevistos", "Umbrella", PROTOCOLOS)}
        ${grupo("rec", "Recetas exclusivas Poderosas", "GlassWater", RECETAS)}
        ${grupo("rit", "Rituales de 7 minutos", "Flower2", RITUALES)}
      </div>` : ""}` : ""}
    </div>
  </div>`);
}
window.toggleMat = () => { ui.matAbierto = !ui.matAbierto; viewRegalos(); };
window.toggleGrupo = id => { ui.grupos[id] = !ui.grupos[id]; viewRegalos(); };

/* ---------- CLUB (página de oferta del upsell) ---------- */
function viewClub() {
  const v = CONFIG.CLUB_VSL_URL; const esMp4 = /\.(mp4|webm|m4v)(\?|$)/i.test(v);
  const video = !v ? `<div class="placeholder">${ic("Play")}<span>Video de presentación<br>(pendiente de cargar)</span></div>`
    : esMp4 ? `<video src="${esc(v)}" playsinline controls></video>` : `<iframe src="${esc(v)}" title="Video" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  const feats = [
    { icon: ic("Gauge"), t: "Protocolos para imprevistos", s: "Fiesta, viaje, esos días del mes, fiaca: listos para usar." },
    { icon: WA(""), t: `${CONFIG.DRA} personal en WhatsApp`, s: "Acompañamiento cercano, nunca sola." },
    { icon: ic("Scale"), t: "Mi evolución", s: "Foto, peso y cómo te sentís, día a día." }
  ];
  render(`<div class="screen">
    ${topbarSimple(CONFIG.DRA)}
    <div class="club-body">
      <div class="club-hero"><div class="wa">${WA("")}</div><h1>${esc(CONFIG.DRA)} en WhatsApp</h1><p>${esc(CONFIG.PROGRAMA)} te muestra el camino; la ${esc(CONFIG.DRA)} lo recorre con vos por WhatsApp.</p></div>
      <div class="video-card"><div class="ratio ${CONFIG.CLUB_VSL_VERTICAL ? "vertical" : ""}">${video}</div></div>
      <p class="video-note">${ic("Play")} Mirá el video antes de decidir</p>
      <div class="features">${feats.map(f => `<div class="feature"><span class="ic">${f.icon}</span><div><p class="t">${esc(f.t)}</p><p class="s">${esc(f.s)}</p></div></div>`).join("")}</div>
      <div class="price-card"><p class="pre">Acceso completo</p><p class="price">${esc(CONFIG.CLUB_PRECIO)}</p><p class="once">pago único</p><p class="desc">${esc(CONFIG.DRA)} durante los 21 días + protocolos y materiales para siempre.</p><p class="gar">${ic("ShieldCheck")} Garantía incondicional de 7 días</p></div>
      <ul class="bullets">${["Acceso inmediato después del pago", "Sin mensualidad, sin sorpresas", "Entrás con el mismo correo"].map(b => `<li>${ic("Check")} ${esc(b)}</li>`).join("")}</ul>
    </div>
    <div class="cta-bar"><button class="cta-gold" onclick="irClub()">${WA("wa")}<span>Quiero tener a la ${esc(CONFIG.DRA)} en mi WhatsApp</span></button></div>
  </div>`);
}
window.irClub = () => {
  if (!CONFIG.CLUB_URL) { toast("El checkout del Club todavía no está configurado.", "info"); return; }
  const email = state.cuenta?.email ? (CONFIG.CLUB_URL.includes("?") ? "&" : "?") + "e=" + encodeURIComponent(state.cuenta.email) : "";
  window.open(CONFIG.CLUB_URL + email, "_blank", "noopener");
};

/* ---------- MI CUENTA ---------- */
function viewPerfil() {
  const c = state.cuenta || {}; const premium = esPremium();
  const nombre = (c.email || "Vos").split("@")[0];
  render(`<div class="screen">
    ${topbarSimple("Mi cuenta")}
    <div class="perfil-body">
      <div class="me-card">${wb(56)}<div class="mid"><p class="name truncate">${esc(nombre)}</p><p class="mail truncate">${esc(c.email || "")}</p><span class="badge ${premium ? "gold" : "verde"}">${premium ? ic("Crown") : ""}${premium ? "Miembro del Club" : "Acceso estándar"}</span></div></div>
      <div class="list-card">
        ${tieneDieta() ? `<button class="list-row" onclick="go('#/dieta')">${ic("Utensils", "lead")}<span class="t">${esc(DIETA.nombre)}<small>Tus 21 días de almuerzos y cenas</small></span>${ic("ChevronRight", "chev")}</button>` : ""}
        ${mostrarInstalar() ? `<button class="list-row" onclick="instalarApp()">${ic("Download", "lead")}<span class="t">Descargar la app en mi celular<small>Te queda el ícono junto a tus apps</small></span>${ic("ChevronRight", "chev")}</button>` : ""}
        <button class="list-row" onclick="accActualizar()">${ic("RefreshCw", "lead")}<span class="t">Actualizar mis compras<small>Si compraste el Club o la Dieta Anti-Insulina, tocá acá</small></span>${ic("ChevronRight", "chev")}</button>
        ${!premium ? `<button class="list-row" onclick="go('#/club')">${ic("Crown", "lead")}<span class="t">Conocer el Club Premium</span>${ic("ChevronRight", "chev")}</button>` : ""}
      </div>
      ${c.verificado === false && accesoActivo() ? `<div class="notice">Tu correo todavía no está verificado. Si ya compraste, tocá “Actualizar mis compras”.</div>` : ""}
      ${!accesoActivo() ? `<div class="test-box"><p class="t">${ic("FlaskConical")} Modo de prueba — ver como…</p><div class="grid">
        <button class="opt ${!premium ? "on-verde" : ""}" onclick="pruebaPlan(false)">Acceso estándar</button>
        <button class="opt ${premium ? "on-gold" : ""}" onclick="pruebaPlan(true)">Premium</button>
        <button class="opt ${state.pruebaDieta ? "on-gold" : ""}" onclick="pruebaDieta()">${state.pruebaDieta ? "Con la Dieta ✓" : "Sin la Dieta"}</button><button class="opt ${state.pruebaNoche ? "on-gold" : ""}" onclick="pruebaNoche()">${state.pruebaNoche ? "Con la Noche ✓" : "Sin la Noche"}</button></div></div>` : ""}
      <div style="margin-top:1.5rem"><button class="btn outline lg full" onclick="accSalir()">${ic("LogOut")} Salir</button></div>
      <p class="version">${esc(CONFIG.MARCA)} · ${esc(CONFIG.VERSION)}</p>
    </div>
  </div>`);
}
window.pruebaNoche = () => { state.pruebaNoche = !state.pruebaNoche; save(); toast(state.pruebaNoche ? "Ahora tenés El Secreto de la Noche 🌙" : "Ahora no tenés El Secreto de la Noche"); viewPerfil(); };
window.pruebaDieta = () => { state.pruebaDieta = !state.pruebaDieta; save(); toast(state.pruebaDieta ? "Ahora tenés La Dieta Anti-Insulina 🍽️" : "Ahora no tenés la Dieta"); viewPerfil(); };
window.pruebaPlan = (premium) => { state.pruebaPremium = premium; save(); toast(premium ? "Ahora sos Miembro del Club 💛" : "Ahora estás en el acceso estándar"); viewPerfil(); };

/* ---------- Instalar la app en el celular (ícono en la pantalla de inicio) ---------- */
// Android/Chrome: botón propio con el aviso nativo (beforeinstallprompt). iPhone: Apple no lo permite, mostramos los 3 pasos de Safari.
// Dentro de Instagram/Facebook/TikTok/etc. no se puede instalar: avisamos y damos el link para abrirlo en el navegador.
let avisoInstalar = null;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); avisoInstalar = e; if (location.hash === "" || location.hash === "#/") { if (state.cuenta) viewHome(); } });
window.addEventListener("appinstalled", () => { state.instalada = true; save(); avisoInstalar = null; toast("¡Listo! Ya tenés la app en tu celular 💛"); if (state.cuenta && (location.hash === "" || location.hash === "#/")) viewHome(); });
const UA = navigator.userAgent || "";
const enApp = () => window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
const esIOS = () => !/Android/i.test(UA) && (/iPhone|iPad|iPod/i.test(UA) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
const esAndroid = () => /Android/i.test(UA);
function navegadorInterno() {
  if (/Instagram/i.test(UA)) return "Instagram";
  if (/FBAN|FBAV|FB_IAB|FBIOS/i.test(UA)) return "Facebook";
  if (/musical_ly|BytedanceWebview|TikTok/i.test(UA)) return "TikTok";
  if (/WhatsApp/i.test(UA)) return "WhatsApp";
  if (/Line\//i.test(UA)) return "Line";
  if (/GSA\//i.test(UA)) return "la app de Google";
  if (esAndroid() && /; wv\)/.test(UA)) return "esta app";
  return "";
}
const mostrarInstalar = () => !enApp() && !state.instalada;
const SVG_COMPARTIR = '<svg viewBox="0 0 24 24" class="paso-ic" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m8 7 4-4 4 4"/><path d="M8 11H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-2"/></svg>';
const SVG_AGREGAR = '<svg viewBox="0 0 24 24" class="paso-ic" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>';
const SVG_MENU = '<svg viewBox="0 0 24 24" class="paso-ic" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>';
function cardInstalar() {
  if (!mostrarInstalar()) return "";
  if (state.instalarOculto && Date.now() - state.instalarOculto < 3 * 864e5) return "";   // "Ahora no": vuelve a aparecer a los 3 días
  return `<div class="install-card">
    <div class="ic">${ic("Download", "", 2)}</div>
    <div class="mid"><p class="t">Descargá la app en tu celular</p><p class="s">Te queda el ícono junto a tus otras apps y entrás directo, sin buscar el link.</p></div>
    <div class="acciones"><button class="btn gold sm" onclick="instalarApp()">📲 Descargar</button><button class="btn ghost sm" onclick="ocultarInstalar()">Ahora no</button></div>
  </div>`;
}
window.ocultarInstalar = () => { state.instalarOculto = Date.now(); save(); viewHome(); };
const paso = (n, icono, txt) => `<div class="paso"><span class="n">${n}</span><span class="txt">${txt}</span>${icono ? `<span class="pic">${icono}</span>` : ""}</div>`;
window.instalarApp = async () => {
  if (enApp()) { toast("Ya estás usando la app 💛"); return; }
  const interno = navegadorInterno();
  const link = location.origin + location.pathname + (state.cuenta?.email ? "?e=" + encodeURIComponent(state.cuenta.email) : "");
  if (interno) {
    const chrome = esAndroid() ? `<a class="btn gold lg full" href="intent://${location.host}${location.pathname}${state.cuenta?.email ? "?e=" + encodeURIComponent(state.cuenta.email) : ""}#Intent;scheme=https;package=com.android.chrome;end">Abrir en Chrome</a>` : "";
    abrirHoja(`<div class="install-sheet">
      <p class="lead">Estás viendo la app dentro de <b>${esc(interno)}</b>, y desde ahí no se puede descargar. Abrila en ${esIOS() ? "<b>Safari</b>" : "<b>Chrome</b>"}:</p>
      ${chrome}
      ${paso(1, SVG_MENU, `Tocá los <b>tres puntitos</b> (arriba o abajo, a la derecha).`)}
      ${paso(2, "", `Elegí <b>“Abrir en el navegador”</b>${esIOS() ? " o <b>“Abrir en Safari”</b>" : " o <b>“Abrir en Chrome”</b>"}.`)}
      ${paso(3, "", `Ahí tocá de nuevo <b>📲 Descargar la app</b>.`)}
      <p class="o">¿No aparece esa opción? Copiá el link y pegalo en ${esIOS() ? "Safari" : "Chrome"}:</p>
      <button class="btn outline lg full" onclick="copiarLinkApp('${esc(link)}')">${ic("FileText")} Copiar el link de la app</button>
    </div>`, "Descargar la app");
    return;
  }
  if (avisoInstalar) {                                   // Android/Chrome: aviso nativo
    avisoInstalar.prompt();
    const r = await avisoInstalar.userChoice.catch(() => null); avisoInstalar = null;
    if (r && r.outcome === "accepted") { state.instalada = true; save(); toast("¡Listo! Buscá el ícono “Club del Truco” en tu celular 💛"); viewHome(); }
    return;
  }
  if (esIOS()) {
    // En iPhone la app instalada no comparte la memoria de Safari: guardamos el correo en el link para que entre sola la primera vez
    if (state.cuenta?.email) history.replaceState(history.state, "", location.pathname + "?e=" + encodeURIComponent(state.cuenta.email) + location.hash);
    const safari = !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(UA);
    abrirHoja(`<div class="install-sheet">
      ${safari ? "" : `<p class="lead">En iPhone conviene hacerlo desde <b>Safari</b>. Si no te aparece la opción, copiá el link y abrilo en Safari.</p>`}
      ${paso(1, SVG_COMPARTIR, `Tocá el botón <b>Compartir</b> (el cuadrado con la flecha hacia arriba), abajo en el medio de la pantalla.`)}
      ${paso(2, SVG_AGREGAR, `Deslizá hacia abajo y tocá <b>“Agregar a inicio”</b>.`)}
      ${paso(3, "", `Arriba a la derecha tocá <b>“Agregar”</b>. ¡Listo! Te aparece el ícono <b>Club del Truco</b> junto a tus apps.`)}
      <img class="install-icono" src="icons/icon-192.png" alt="Ícono Club del Truco">
      <button class="btn soft lg full" onclick="marcarInstalada()">Ya la agregué ✓</button>
      ${safari ? "" : `<button class="btn outline lg full" style="margin-top:.5rem" onclick="copiarLinkApp('${esc(link)}')">${ic("FileText")} Copiar el link</button>`}
    </div>`, "Descargá la app");
    return;
  }
  abrirHoja(`<div class="install-sheet">
    ${paso(1, SVG_MENU, `Tocá los <b>tres puntitos</b> arriba a la derecha de Chrome.`)}
    ${paso(2, SVG_AGREGAR, `Elegí <b>“Instalar app”</b> o <b>“Agregar a la pantalla principal”</b>.`)}
    ${paso(3, "", `Confirmá con <b>“Instalar”</b>. Te queda el ícono <b>Club del Truco</b> junto a tus apps.`)}
    <img class="install-icono" src="icons/icon-192.png" alt="Ícono Club del Truco">
    <button class="btn soft lg full" onclick="marcarInstalada()">Ya la instalé ✓</button>
  </div>`, "Descargá la app");
};
window.marcarInstalada = () => { state.instalada = true; save(); cerrarHoja(); toast("¡Genial! Desde ahora entrá por el ícono 💛"); viewHome(); };
window.copiarLinkApp = async (link) => {
  try { await navigator.clipboard.writeText(link); toast("Link copiado. Pegalo en el navegador 💛"); }
  catch (e) { prompt("Copiá este link y pegalo en el navegador:", link); }
};

/* ---------- Router ---------- */
function router() {
  cerrarHtml(true); cerrarHoja(true);
  if (!state.cuenta) { viewAcceso(); return; }                 // primero el correo de compra
  const h = (location.hash || "#/").replace(/^#/, "");
  if (h === "/jornada") viewJornada();
  else if (h === "/regalos") viewRegalos();
  else if (h === "/club") viewClub();
  else if (h === "/perfil") viewPerfil();
  else if (h === "/dieta") viewDieta();
  else if (h === "/doctora") viewDoctora();
  else if (h === "/noche" || h.startsWith("/noche/")) viewNoche(h.slice(7));
  else if (h !== "/") { location.replace("#/"); return; }
  else viewHome();
}
window.addEventListener("hashchange", router);
// Netlify agrega su cartel "Powered by Netlify" abajo a la derecha: si aparece, subimos la barra del chat y los botones fijos para que no queden tapados
(function vigilarBadge(n) { if (document.getElementById("nl-badge-frame")) { document.body.classList.add("con-badge"); return; } if (n < 20) setTimeout(() => vigilarBadge(n + 1), 500); })(0);
window.addEventListener("load", () => {
  render(`<div class="splash"><span class="cs-round">CS</span></div>`);
  const eLink = new URLSearchParams(location.search).get("e");   // la app instalada en iPhone arranca con ?e=correo (no comparte la memoria de Safari)
  setTimeout(() => { router(); setTimeout(reverificarSilencioso, 1500);
    if (eLink && !state.cuenta && eLink.includes("@")) { acc.email = eLink.trim().toLowerCase(); viewAcceso(); accBuscar(); }
    if (enApp() && !state.instalada) { state.instalada = true; save(); }
  }, 120);   // la app pinta enseguida; la re-verificación va después y en segundo plano
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
});
