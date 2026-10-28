// sim-energia-potencial.js — Simulador Física Grado 8: Ep ↔ Ec (conservación de energía)
export function iniciarSimEnergiaPotencial(container) {
  container.innerHTML = `
    <div class="sim-wrap sim-epot">
      <div class="sim-head">
        <span class="sim-titulo-txt">🍏 Simulador — Energía Potencial ↔ Cinética</span>
        <span class="sim-instruccion">g = 10 m/s² (aproximación estándar)</span>
      </div>
      <div class="sim-epot-body">
        <canvas class="sim-canvas sim-epot-cv" id="sim-ep-canvas"></canvas>
        <div class="sim-epot-barras">
          <div class="sim-epot-barra-grupo">
            <span class="lec-lbl">Ep</span>
            <div class="sim-epot-barra-wrap"><div class="sim-epot-barra-fill ep" id="sim-ep-barEp"></div></div>
            <span class="sim-epot-barra-val" id="sim-ep-valEp">0 J</span>
          </div>
          <div class="sim-epot-barra-grupo">
            <span class="lec-lbl">Ec</span>
            <div class="sim-epot-barra-wrap"><div class="sim-epot-barra-fill ec" id="sim-ep-barEc"></div></div>
            <span class="sim-epot-barra-val" id="sim-ep-valEc">0 J</span>
          </div>
          <div class="sim-epot-total">Total: <strong id="sim-ep-valTot">0 J</strong></div>
        </div>
      </div>
      <div class="sim-nuclear-controles">
        <div class="sim-ctrl-group">
          <label class="sim-ctrl-lbl">📏 Altura inicial (h) <span class="sim-ctrl-val" id="sim-ep-hval">5 m</span></label>
          <input type="range" class="sim-slider slider-nu" id="sim-ep-sH" min="1" max="20" step="1" value="5">
        </div>
        <div class="sim-ctrl-group">
          <label class="sim-ctrl-lbl">⚖️ Masa (m) <span class="sim-ctrl-val" id="sim-ep-mval">2 kg</span></label>
          <input type="range" class="sim-slider slider-nu" id="sim-ep-sM" min="1" max="10" step="1" value="2">
        </div>
        <div class="sim-nuclear-btns">
          <button class="sim-nuclear-btn sim-nuclear-btn-go" id="sim-ep-soltar">⬇️ Soltar</button>
          <button class="sim-nuclear-btn sim-nuclear-btn-rst" id="sim-ep-reiniciar">↺ Reiniciar</button>
        </div>
      </div>
    </div>`;

  const canvas = container.querySelector('#sim-ep-canvas');
  const ctx = canvas.getContext('2d');
  const CW = 260, CH = 240;
  canvas.width = CW; canvas.height = CH;

  const sH = container.querySelector('#sim-ep-sH');
  const sM = container.querySelector('#sim-ep-sM');
  const hval = container.querySelector('#sim-ep-hval');
  const mval = container.querySelector('#sim-ep-mval');
  const barEp = container.querySelector('#sim-ep-barEp');
  const barEc = container.querySelector('#sim-ep-barEc');
  const valEp = container.querySelector('#sim-ep-valEp');
  const valEc = container.querySelector('#sim-ep-valEc');
  const valTot = container.querySelector('#sim-ep-valTot');

  const G = 10;
  let h0 = 5, m = 2, y = 5, v = 0, cayendo = false;

  function onH() { h0 = parseFloat(sH.value); hval.textContent = h0 + ' m'; if (!cayendo) { y = h0; actualizarUI(); } }
  function onM() { m = parseFloat(sM.value); mval.textContent = m + ' kg'; actualizarUI(); }
  sH.addEventListener('input', onH);
  sM.addEventListener('input', onM);

  container.querySelector('#sim-ep-soltar').addEventListener('click', () => { cayendo = true; });
  container.querySelector('#sim-ep-reiniciar').addEventListener('click', () => { y = h0; v = 0; cayendo = false; actualizarUI(); });

  function actualizarUI() {
    const Ep = m * G * Math.max(0, y);
    const Ec = 0.5 * m * v * v;
    const Etot = m * G * h0;
    barEp.style.height = Math.min(100, (Ep / Etot) * 100) + '%';
    barEc.style.height = Math.min(100, (Ec / Etot) * 100) + '%';
    valEp.textContent = Math.round(Ep) + ' J';
    valEc.textContent = Math.round(Ec) + ' J';
    valTot.textContent = Math.round(Ep + Ec) + ' J';
  }

  function dibujar() {
    ctx.clearRect(0, 0, CW, CH);
    ctx.fillStyle = '#05050e'; ctx.fillRect(0, 0, CW, CH);

    const sueloY = 210, topeY = 20;
    ctx.strokeStyle = '#4fc3f744'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(20, sueloY); ctx.lineTo(CW - 20, sueloY); ctx.stroke();

    // Regla de altura
    for (let m2 = 0; m2 <= 20; m2 += 5) {
      const py = sueloY - (m2 / 20) * (sueloY - topeY);
      ctx.strokeStyle = '#2a3a55'; ctx.beginPath(); ctx.moveTo(20, py); ctx.lineTo(28, py); ctx.stroke();
      ctx.fillStyle = '#555577'; ctx.font = '8px monospace'; ctx.textAlign = 'left';
      ctx.fillText(m2 + 'm', 30, py + 3);
    }

    const py = sueloY - (Math.max(0, y) / 20) * (sueloY - topeY);
    ctx.shadowColor = '#ff6b35'; ctx.shadowBlur = 10;
    ctx.fillStyle = '#ff6b35';
    ctx.beginPath(); ctx.arc(CW / 2 + 20, py, 10, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  let rafId = null;
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (cayendo && y > 0) {
      v += G * dt;
      y -= v * dt;
      if (y <= 0) { y = 0; cayendo = false; }
      actualizarUI();
    }
    dibujar();
    rafId = requestAnimationFrame(loop);
  }

  onH(); onM();
  y = h0;
  actualizarUI();
  rafId = requestAnimationFrame(loop);

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    sH.removeEventListener('input', onH);
    sM.removeEventListener('input', onM);
  };
}
