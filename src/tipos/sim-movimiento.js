// sim-movimiento.js — Simulador Física Grado 8: MRU / MRUA
export function iniciarSimMovimiento(container) {
  container.innerHTML = `
    <div class="sim-wrap sim-mov">
      <div class="sim-head">
        <span class="sim-titulo-txt">🚗 Simulador — Movimiento Rectilíneo</span>
        <span class="sim-instruccion">Ajusta v₀ y a, luego inicia</span>
      </div>
      <canvas class="sim-canvas sim-mov-cv" id="sim-mov-canvas"></canvas>
      <div class="sim-mov-badge" id="sim-mov-badge">MRU</div>
      <div class="sim-nuclear-controles">
        <div class="sim-ctrl-group">
          <label class="sim-ctrl-lbl">🏁 Velocidad inicial (v₀) <span class="sim-ctrl-val" id="sim-mov-v0val">2 m/s</span></label>
          <input type="range" class="sim-slider slider-nu" id="sim-mov-sV0" min="0" max="10" step="1" value="2">
        </div>
        <div class="sim-ctrl-group">
          <label class="sim-ctrl-lbl">📈 Aceleración (a) <span class="sim-ctrl-val" id="sim-mov-aval">1 m/s²</span></label>
          <input type="range" class="sim-slider slider-nu" id="sim-mov-sA" min="-3" max="5" step="0.5" value="1">
        </div>
        <div class="sim-nuclear-btns">
          <button class="sim-nuclear-btn sim-nuclear-btn-go" id="sim-mov-iniciar">▶ Iniciar</button>
          <button class="sim-nuclear-btn sim-nuclear-btn-rst" id="sim-mov-reiniciar">↺ Reiniciar</button>
        </div>
      </div>
    </div>`;

  const canvas = container.querySelector('#sim-mov-canvas');
  const ctx = canvas.getContext('2d');
  const CW = 440, CH = 260;
  canvas.width = CW; canvas.height = CH;

  const sV0 = container.querySelector('#sim-mov-sV0');
  const sA  = container.querySelector('#sim-mov-sA');
  const v0val = container.querySelector('#sim-mov-v0val');
  const aval  = container.querySelector('#sim-mov-aval');
  const badge = container.querySelector('#sim-mov-badge');
  const btnIniciar = container.querySelector('#sim-mov-iniciar');
  const btnReiniciar = container.querySelector('#sim-mov-reiniciar');

  let v0 = 2, a = 1, t = 0, corriendo = false;
  const T_MAX = 8;
  const historial = []; // {t, x, v}

  function onV0() { v0 = parseFloat(sV0.value); v0val.textContent = v0 + ' m/s'; }
  function onA()  { a = parseFloat(sA.value); aval.textContent = a + ' m/s²';
    badge.textContent = a === 0 ? 'MRU' : (a > 0 ? 'MRUA — acelerando' : 'MRUA — frenando');
  }
  sV0.addEventListener('input', onV0);
  sA.addEventListener('input', onA);

  function posicion(tt) { return v0 * tt + 0.5 * a * tt * tt; }
  function velocidad(tt) { return v0 + a * tt; }

  function iniciar() {
    if (corriendo) return;
    t = 0; historial.length = 0; corriendo = true;
  }
  function reiniciar() { t = 0; historial.length = 0; corriendo = false; }

  btnIniciar.addEventListener('click', iniciar);
  btnReiniciar.addEventListener('click', reiniciar);

  // Bandas del canvas
  const PISTA_Y = 25, PISTA_H = 45;
  const GX_Y = 115, GX_H = 55;
  const GV_Y = 185, GV_H = 55;
  const MARGEN_IZQ = 40, ANCHO_GRAF = CW - MARGEN_IZQ - 16;
  const X_MAX = 60; // metros visibles en la pista

  function dibujarPista() {
    ctx.strokeStyle = '#4fc3f755'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(MARGEN_IZQ, PISTA_Y + PISTA_H); ctx.lineTo(CW - 10, PISTA_Y + PISTA_H); ctx.stroke();
    for (let m = 0; m <= X_MAX; m += 10) {
      const px = MARGEN_IZQ + (m / X_MAX) * ANCHO_GRAF;
      ctx.strokeStyle = '#4fc3f733';
      ctx.beginPath(); ctx.moveTo(px, PISTA_Y + PISTA_H - 4); ctx.lineTo(px, PISTA_Y + PISTA_H + 4); ctx.stroke();
      ctx.fillStyle = '#555577'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText(m + 'm', px, PISTA_Y + PISTA_H + 14);
    }
    const x = Math.min(posicion(t), X_MAX);
    const px = MARGEN_IZQ + (x / X_MAX) * ANCHO_GRAF;
    ctx.shadowColor = '#ff6b35'; ctx.shadowBlur = 10;
    ctx.font = '22px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('🚗', px, PISTA_Y + PISTA_H - 6);
    ctx.shadowBlur = 0;
  }

  function dibujarGrafica(y, h, titulo, fn, colorLinea, yMax) {
    ctx.strokeStyle = '#2a3a55'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(MARGEN_IZQ, y); ctx.lineTo(MARGEN_IZQ, y + h); ctx.lineTo(CW - 10, y + h); ctx.stroke();
    ctx.fillStyle = '#666688'; ctx.font = '9px monospace'; ctx.textAlign = 'left';
    ctx.fillText(titulo, MARGEN_IZQ, y - 2);

    ctx.strokeStyle = colorLinea; ctx.lineWidth = 2;
    ctx.beginPath();
    historial.forEach((p, i) => {
      const px = MARGEN_IZQ + (p.t / T_MAX) * ANCHO_GRAF;
      const val = fn(p);
      const py = y + h - Math.max(0, Math.min(1, val / yMax)) * h;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke();
  }

  let rafId = null;
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (corriendo) {
      t += dt;
      const x = posicion(t), v = velocidad(t);
      historial.push({ t, x, v });
      if (t >= T_MAX || x >= X_MAX || x < 0) corriendo = false;
    }

    ctx.clearRect(0, 0, CW, CH);
    ctx.fillStyle = '#05050e'; ctx.fillRect(0, 0, CW, CH);
    dibujarPista();
    dibujarGrafica(GX_Y, GX_H, 'posición (m) vs tiempo', p => p.x, '#4fc3f7', X_MAX);
    dibujarGrafica(GV_Y, GV_H, 'velocidad (m/s) vs tiempo', p => p.v, '#ffd600', 20);

    rafId = requestAnimationFrame(loop);
  }

  onV0(); onA();
  rafId = requestAnimationFrame(loop);

  return () => { if (rafId) cancelAnimationFrame(rafId); sV0.removeEventListener('input', onV0); sA.removeEventListener('input', onA); };
}
