// sim-ondas-cuerda.js — Simulador Física Grado 9: ondas en una cuerda (v = λf)
export function iniciarSimOndasCuerda(container) {
  container.innerHTML = `
    <div class="sim-wrap sim-ondas">
      <div class="sim-head">
        <span class="sim-titulo-txt">🪢 Simulador — Ondas en una Cuerda</span>
        <span class="sim-instruccion">v fija de la cuerda = 4 m/s</span>
      </div>
      <canvas class="sim-canvas sim-ondas-cv" id="sim-on-canvas"></canvas>
      <div class="sim-ondas-lecturas">
        <div class="sim-ondas-lectura"><span class="lec-lbl">λ (longitud de onda)</span><span class="lec-val" id="sim-on-lambda" style="color:#4fc3f7">8.0 m</span></div>
        <div class="sim-ondas-lectura"><span class="lec-lbl">v (velocidad)</span><span class="lec-val" id="sim-on-v" style="color:#ffd600">4.0 m/s</span></div>
      </div>
      <div class="sim-nuclear-controles">
        <div class="sim-ctrl-group">
          <label class="sim-ctrl-lbl">🔁 Frecuencia (f) <span class="sim-ctrl-val" id="sim-on-fval">0.5 Hz</span></label>
          <input type="range" class="sim-slider slider-nu" id="sim-on-sF" min="0.5" max="5" step="0.1" value="0.5">
        </div>
        <div class="sim-ctrl-group">
          <label class="sim-ctrl-lbl">📶 Amplitud <span class="sim-ctrl-val" id="sim-on-aval">5</span></label>
          <input type="range" class="sim-slider slider-nu" id="sim-on-sA" min="1" max="10" step="1" value="5">
        </div>
      </div>
    </div>`;

  const canvas = container.querySelector('#sim-on-canvas');
  const ctx = canvas.getContext('2d');
  const CW = 440, CH = 180;
  canvas.width = CW; canvas.height = CH;

  const sF = container.querySelector('#sim-on-sF');
  const sA = container.querySelector('#sim-on-sA');
  const fval = container.querySelector('#sim-on-fval');
  const aval = container.querySelector('#sim-on-aval');
  const elLambda = container.querySelector('#sim-on-lambda');

  const V = 4; // m/s, velocidad fija de la cuerda
  const METROS_VISIBLES = 8;
  let f = 0.5, amp = 5;

  function onF() { f = parseFloat(sF.value); fval.textContent = f.toFixed(1) + ' Hz'; elLambda.textContent = (V / f).toFixed(1) + ' m'; }
  function onA() { amp = parseFloat(sA.value); aval.textContent = amp; }
  sF.addEventListener('input', onF);
  sA.addEventListener('input', onA);

  let t = 0, rafId = null, last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now; t += dt;

    ctx.clearRect(0, 0, CW, CH);
    ctx.fillStyle = '#05050e'; ctx.fillRect(0, 0, CW, CH);

    const midY = CH / 2;
    const lambda = V / f;
    ctx.strokeStyle = '#2a3a55'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(10, midY); ctx.lineTo(CW - 10, midY); ctx.stroke();

    ctx.strokeStyle = '#4fc3f7'; ctx.lineWidth = 2.5;
    ctx.shadowColor = '#4fc3f7'; ctx.shadowBlur = 6;
    ctx.beginPath();
    for (let px = 10; px <= CW - 10; px++) {
      const xm = ((px - 10) / (CW - 20)) * METROS_VISIBLES;
      const y = midY - amp * 5 * Math.sin(2 * Math.PI * (xm / lambda - f * t));
      if (px === 10) ctx.moveTo(px, y); else ctx.lineTo(px, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Marca un ciclo de longitud de onda
    const lamPx = (lambda / METROS_VISIBLES) * (CW - 20);
    if (lamPx < CW - 30) {
      ctx.strokeStyle = '#ffd60088'; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(10, 20); ctx.lineTo(10 + lamPx, 20); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ffd600'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText('λ', 10 + lamPx / 2, 14);
    }

    rafId = requestAnimationFrame(loop);
  }

  onF(); onA();
  rafId = requestAnimationFrame(loop);

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    sF.removeEventListener('input', onF);
    sA.removeEventListener('input', onA);
  };
}
