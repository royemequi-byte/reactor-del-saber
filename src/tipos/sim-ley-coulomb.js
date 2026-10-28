// sim-ley-coulomb.js — Simulador Física Grado 9: Ley de Coulomb (F = k·q1·q2/r²)
export function iniciarSimLeyCoulomb(container) {
  container.innerHTML = `
    <div class="sim-wrap sim-coulomb">
      <div class="sim-head">
        <span class="sim-titulo-txt">⚡ Simulador — Ley de Coulomb</span>
        <span class="sim-instruccion">k = 9×10⁹ N·m²/C²</span>
      </div>
      <canvas class="sim-canvas sim-coulomb-cv" id="sim-co-canvas"></canvas>
      <div class="sim-coulomb-lectura" id="sim-co-lectura">F ≈ 0 N</div>
      <div class="sim-nuclear-controles">
        <div class="sim-ctrl-group">
          <label class="sim-ctrl-lbl">🔴 Carga 1 (|q₁|) <span class="sim-ctrl-val" id="sim-co-q1val">2 μC</span>
            <button type="button" class="sim-coulomb-signo" id="sim-co-signo1">+</button>
          </label>
          <input type="range" class="sim-slider slider-nu" id="sim-co-sQ1" min="1" max="10" step="1" value="2">
        </div>
        <div class="sim-ctrl-group">
          <label class="sim-ctrl-lbl">🔵 Carga 2 (|q₂|) <span class="sim-ctrl-val" id="sim-co-q2val">3 μC</span>
            <button type="button" class="sim-coulomb-signo" id="sim-co-signo2">+</button>
          </label>
          <input type="range" class="sim-slider slider-nu" id="sim-co-sQ2" min="1" max="10" step="1" value="3">
        </div>
        <div class="sim-ctrl-group">
          <label class="sim-ctrl-lbl">📏 Distancia (r) <span class="sim-ctrl-val" id="sim-co-rval">3 m</span></label>
          <input type="range" class="sim-slider slider-nu" id="sim-co-sR" min="1" max="10" step="1" value="3">
        </div>
      </div>
    </div>`;

  const canvas = container.querySelector('#sim-co-canvas');
  const ctx = canvas.getContext('2d');
  const CW = 440, CH = 160;
  canvas.width = CW; canvas.height = CH;

  const sQ1 = container.querySelector('#sim-co-sQ1');
  const sQ2 = container.querySelector('#sim-co-sQ2');
  const sR  = container.querySelector('#sim-co-sR');
  const btnSigno1 = container.querySelector('#sim-co-signo1');
  const btnSigno2 = container.querySelector('#sim-co-signo2');
  const q1val = container.querySelector('#sim-co-q1val');
  const q2val = container.querySelector('#sim-co-q2val');
  const rval  = container.querySelector('#sim-co-rval');
  const lectura = container.querySelector('#sim-co-lectura');

  const K = 9e9;
  let q1 = 2, q2 = 3, r = 3, signo1 = 1, signo2 = 1;

  function onQ1() { q1 = parseFloat(sQ1.value); q1val.textContent = q1 + ' μC'; }
  function onQ2() { q2 = parseFloat(sQ2.value); q2val.textContent = q2 + ' μC'; }
  function onR()  { r = parseFloat(sR.value); rval.textContent = r + ' m'; }
  sQ1.addEventListener('input', onQ1);
  sQ2.addEventListener('input', onQ2);
  sR.addEventListener('input', onR);
  btnSigno1.addEventListener('click', () => { signo1 *= -1; btnSigno1.textContent = signo1 > 0 ? '+' : '−'; btnSigno1.classList.toggle('neg', signo1 < 0); });
  btnSigno2.addEventListener('click', () => { signo2 *= -1; btnSigno2.textContent = signo2 > 0 ? '+' : '−'; btnSigno2.classList.toggle('neg', signo2 < 0); });

  function calcF() {
    const q1C = q1 * 1e-6, q2C = q2 * 1e-6;
    return K * Math.abs(q1C * q2C) / (r * r);
  }

  let rafId = null, t = 0;
  function loop() {
    t += 0.05;
    ctx.clearRect(0, 0, CW, CH);
    ctx.fillStyle = '#05050e'; ctx.fillRect(0, 0, CW, CH);

    const midY = 70;
    const rPx = Math.min(300, r * 28);
    const cx = CW / 2;
    const x1 = cx - rPx / 2, x2 = cx + rPx / 2;

    const atraen = (signo1 * signo2) < 0;
    const F = calcF();

    ctx.strokeStyle = '#2a3a55'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(x1, midY); ctx.lineTo(x2, midY); ctx.stroke();
    ctx.setLineDash([]);

    // Flechas de fuerza
    const offset = atraen ? -14 : 14;
    const dir = atraen ? 1 : -1;
    dibujarFlecha(x1, midY, x1 + offset * dir * -1 + (atraen ? 18 : -18), midY, '#ffd600');
    dibujarFlecha(x2, midY, x2 - (atraen ? 18 : -18), midY, '#ffd600');

    dibujarCarga(x1, midY, signo1, '#ff5252', q1);
    dibujarCarga(x2, midY, signo2, '#4fc3f7', q2);

    lectura.textContent = `F ≈ ${formatear(F)} N  ·  ${atraen ? 'ATRACCIÓN (signos opuestos)' : 'REPULSIÓN (mismo signo)'}`;

    rafId = requestAnimationFrame(loop);
  }

  function formatear(F) {
    if (F === 0) return '0';
    if (F < 0.001) return F.toExponential(2);
    return F.toFixed(3);
  }

  function dibujarFlecha(x0, y0, x1b, y1b, color) {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1b, y1b); ctx.stroke();
    const ang = Math.atan2(y1b - y0, x1b - x0);
    ctx.beginPath();
    ctx.moveTo(x1b, y1b);
    ctx.lineTo(x1b - 7 * Math.cos(ang - 0.4), y1b - 7 * Math.sin(ang - 0.4));
    ctx.lineTo(x1b - 7 * Math.cos(ang + 0.4), y1b - 7 * Math.sin(ang + 0.4));
    ctx.closePath(); ctx.fill();
  }

  function dibujarCarga(x, y, signo, color, mag) {
    const radio = 14 + mag * 1.2;
    ctx.shadowColor = color; ctx.shadowBlur = 12;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, radio, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#05050e'; ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(signo > 0 ? '+' : '−', x, y);
    ctx.textBaseline = 'alphabetic';
  }

  onQ1(); onQ2(); onR();
  rafId = requestAnimationFrame(loop);

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    sQ1.removeEventListener('input', onQ1);
    sQ2.removeEventListener('input', onQ2);
    sR.removeEventListener('input', onR);
  };
}
