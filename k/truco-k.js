/* =============================================================
   Upsells del Truco de la Insulina en KashPay — una URL por paso.
   /k/u1 → UpSell 1 · /k/d1 → DownSell 1 · /k/u2 → UpSell 2 · /k/d2 → DownSell 2

   KashPay manda a la compradora a cada página con ?ks=<sesión>.
   Su procesador (upsell-processor.js) necesita ese ks para cobrar
   con la tarjeta guardada (one-click) y saltar al paso siguiente:
     acceptUpsell(url)  → cobra y sigue por "Aceptó"
     declineUpsell(url) → no cobra y sigue por "Rechazó"
   El recorrido lo maneja KashPay: acá no se navega a mano.
   ============================================================= */
(function () {
  var C = window.TRUCO_K || {};
  var trozos = location.pathname.replace(/\/+$/, "").split("/");
  var id = trozos[trozos.length - 1];
  if (!C.pasos || !C.pasos[id]) id = "u1";
  var P = C.pasos[id];
  var T = window.TRUCO_TOKENS || {};
  if (T[id]) P.token = T[id];

  function $(x) { return document.getElementById(x); }
  function mostrar(el) { if (el) { el.classList.remove("oculto"); el.classList.add("aparece"); } }

  /* ---------- 1. Pintar el paso ---------- */
  $("alerta").innerHTML = P.alerta || "";
  $("texto").innerHTML = P.texto || "";
  $("producto").textContent = P.producto || "";
  $("precio").textContent = P.precio || "";
  $("tachado").textContent = P.tachado || "";
  $("si").textContent = P.boton || "SÍ, LO QUIERO";
  $("si").style.background = P.color || "#0CB017";
  if (P.imagen) { $("imagen").src = P.imagen; $("imagen").alt = P.producto || ""; }
  else $("imagen").classList.add("oculto");
  if (P.etiqueta) { $("etiqueta").textContent = P.etiqueta; $("etiqueta").classList.remove("oculto"); }
  if (P.urgencia) { $("urgencia").textContent = P.urgencia; $("urgencia").classList.remove("oculto"); }

  /* ---------- 2. Video de VTurb ---------- */
  if (P.tipo === "vsl" && P.vturb) {
    $("flecha-arriba").textContent = P.flechaArriba || "";
    $("flecha-abajo").textContent = P.flechaAbajo || "";
    $("video").innerHTML = '<vturb-smartplayer id="vid-' + P.vturb +
      '" style="display:block;margin:0 auto;width:100%;max-width:400px;"></vturb-smartplayer>';
    var s = document.createElement("script");
    s.src = "https://scripts.converteai.net/" + C.vturbCuenta + "/players/" + P.vturb + "/v4/player.js";
    s.async = true;
    document.head.appendChild(s);
    $("bloque-video").classList.remove("oculto");
  }

  /* ---------- 3. La oferta aparece con la demora del paso ---------- */
  function abrirOferta() {
    mostrar($("oferta"));
    if (P.tipo === "vsl") mostrar($("reloj"));
    arrancarReloj();
  }
  var demora = Number(P.demora) || 0;
  /* ?ver=1 muestra todo al instante (para revisar sin esperar el video) */
  try { if (new URLSearchParams(location.search).get("ver") === "1") demora = 0; } catch (e) {}
  if (demora > 0) setTimeout(abrirOferta, demora * 1000); else abrirOferta();

  var relojCorriendo = false;
  function arrancarReloj() {
    if (relojCorriendo || P.tipo !== "vsl") return;
    relojCorriendo = true;
    var fin = Date.now() + 10 * 60 * 1000;
    (function tic() {
      var r = Math.max(0, fin - Date.now());
      var m = Math.floor(r / 60000), sg = Math.floor((r % 60000) / 1000);
      $("reloj-num").textContent = m + ":" + (sg < 10 ? "0" : "") + sg;
      if (r > 0) setTimeout(tic, 1000);
    })();
  }

  /* ---------- 4. Botones de KashPay (one-click) ---------- */
  var ks = "";
  try { ks = new URLSearchParams(location.search).get("ks") || ""; } catch (e) {}
  var url = P.token ? (C.pay + P.token) : "";

  if (ks && url) {
    var proc = document.createElement("script");
    proc.id = "kash-proc";
    proc.src = C.procesador;
    document.head.appendChild(proc);
  }

  function avisar(html) {
    var v = $("kash-aviso");
    if (!v) {
      v = document.createElement("div");
      v.id = "kash-aviso";
      v.setAttribute("role", "alert");
      v.style.cssText = "position:fixed;left:14px;right:14px;bottom:14px;z-index:99999;max-width:460px;margin:0 auto;" +
        "background:#fff;border:2px solid #f59e0b;border-radius:14px;padding:14px 16px;color:#1f2937;" +
        "font:500 14px/1.55 Poppins,system-ui,sans-serif;box-shadow:0 14px 40px rgba(0,0,0,.25)";
      document.body.appendChild(v);
    }
    v.innerHTML = html;
  }
  function sinSesion() {
    avisar("<b>No pudimos confirmar tu compra en esta pantalla.</b><br>No se te cobró nada. " +
      "Si ya pagaste, tu acceso está a salvo: entrá desde el enlace del correo o escribinos por WhatsApp al " +
      "<a href='https://wa.me/" + C.whatsapp + "' style='color:#16a34a'>" + C.whatsappTexto + "</a> " +
      "y lo resolvemos dentro de las 24 horas hábiles.");
  }
  function correr(fn) {
    if (typeof window[fn] !== "function") {
      /* el procesador todavía no cargó: reintentar un momento */
      var n = 0;
      (function espera() {
        if (typeof window[fn] === "function") return window[fn](url);
        if (++n < 40) return setTimeout(espera, 150);
        avisar("<b>Se está cargando el pago seguro.</b> Esperá unos segundos y tocá el botón de nuevo.");
      })();
      return;
    }
    window[fn](url);
  }

  var cobrando = false;
  $("si").onclick = function (ev) {
    ev.preventDefault();
    if (!ks) return sinSesion();
    if (!url) return console.warn("[truco-k] falta el token del paso " + id);
    if (cobrando) return;
    cobrando = true;
    $("si").disabled = true;
    $("si").textContent = "Procesando tu acceso…";
    correr("acceptUpsell");
    setTimeout(function () { cobrando = false; $("si").disabled = false; $("si").textContent = P.boton; }, 15000);
  };
  $("no").onclick = function (ev) {
    ev.preventDefault();
    if (!ks) {
      /* Sin sesión (página abierta suelta): sólo para revisar el recorrido. */
      var sig = id === "u1" ? "d1" : id === "d1" ? "u2" : id === "u2" ? "d2" : null;
      location.href = sig ? "/k/" + sig + "?ver=1" : "/app/";
      return;
    }
    if (!url) return console.warn("[truco-k] falta el token del paso " + id);
    correr("declineUpsell");
  };

  /* Que el ?ver no quede pegado si se comparte el link */
  try {
    var q = new URLSearchParams(location.search);
    if (q.has("ver")) { q.delete("ver"); var s2 = q.toString(); history.replaceState(null, "", location.pathname + (s2 ? "?" + s2 : "")); }
  } catch (e) {}
})();
