// sim-leyes-newton.js — Simulador Física Grado 8: las 3 Leyes de Newton
export function iniciarSimLeyesNewton(container) {
  container.innerHTML = `
    <div class="sim-wrap sim-newton">
      <div class="sim-head">
        <span class="sim-titulo-txt">🍎 Simulador — Leyes de Newton</span>
        <span class="sim-instruccion">Elige una ley</span>
      </div>
      <div class="sim-newton-tabs">
        <button class="sim-newton-tab activa" data-tab="1">1ª — Inercia</button>
        <button class="sim-newton-tab" data-tab="2">2ª — F = m·a</button>
        <button class="sim-newton-tab" data-tab="3">3ª — Acción-Reacción</button>
      </div>
      <canvas class="sim-canvas sim-newton-cv" id="sim-nw-canvas"></canvas>
      <div class="sim-newton-lectura" id="sim-nw-lectura"></div>
      <div class="sim-nuclear-controles" id="sim-nw-controles"></div>
    </div>`;

  const canvas = container.querySelector('#sim-nw-canvas');
  const ctx = canvas.getContext('2d');
  const CW = 440, CH = 200;
  canvas.width = CW; canvas.height = CH;
  const lectura = container.querySelector('#sim-nw-lectura');
  const controles = container.querySelector('#sim-nw-controles');
  const tabs = container.querySelectorAll('.sim-newton-tab');

  let tab = 1;

  // ── Estado Ley 1 (Inercia) ──
  let i_x = 60, i_v = 0, i_fricActiva = false;

  // ── Estado Ley 2 (F = m·a) ──
  let n2_F = 20, n2_m = 4, n2_fric = 0, n2_x = 40, n2_v = 0;

  // ── Estado Ley 3 (Acción-Reacción) ──
  let n3_mA = 40, n3_mB = 60, n3_empujado = false, n3_xA = 200, n3_xB = 240, n3_vA = 0, n3_vB = 0;

  function limpiar() { container.querySelectorAll('.sim-newton-tab').forEach(b => b.classList.toggle('activa', +b.dataset.tab === tab)); }

  function renderControles() {
    if (tab === 1) {
      controles.innerHTML = `
        <div class="sim-nuclear-btns">
          <button class="sim-nuclear-btn sim-nuclear-btn-go" id="nw1-empujar">👉 Empujar (sin fricción)</button>
          <button class="sim-nuclear-btn sim-nuclear-btn-rst" id="nw1-frenar">🧱 Aplicar fuerza de freno</button>
        </div>`;
      container.querySelector('#nw1-empujar').addEventListener('click', () => { i_v = 2.5; i_fricActiva = false; });
      container.querySelector('#nw1-frenar').addEventListener('click', () => { i_fricActiva = true; });
    } else if (tab === 2) {
      controles.innerHTML = `
        <div class="sim-ctrl-group">
          <label class="sim-ctrl-lbl">💪 Fuerza (F) <span class="sim-ctrl-val" id="nw2-fval">20 N</span></label>
          <input type="range" class="sim-slider slider-nu" id="nw2-sF" min="0" max="50" step="1" value="20">
        </div>
        <div class="sim-ctrl-group">
          <label class="sim-ctrl-lbl">⚖️ Masa (m) <span class="sim-ctrl-val" id="nw2-mval">4 kg</span></label>
          <input type="range" class="sim-slider slider-nu" id="nw2-sM" min="1" max="10" step="1" value="4">
        </div>
        <div class="sim-ctrl-group">
          <label class="sim-ctrl-lbl">🧊 Fricción <span class="sim-ctrl-val" id="nw2-fricval">0 N</span></label>
          <input type="range" class="sim-slider slider-nu" id="nw2-sFric" min="0" max="30" step="1" value="0">
        </div>
        <div class="sim-nuclear-btns">
          <button class="sim-nuclear-btn sim-nuclear-btn-rst" id="nw2-reiniciar">↺ Reiniciar</button>
        </div>`;
      container.querySelector('#nw2-sF').addEventListener('input', e => { n2_F = +e.target.value; container.querySelector('#nw2-fval').textContent = n2_F + ' N'; });
      container.querySelector('#nw2-sM').addEventListener('input', e => { n2_m = +e.target.value; container.querySelector('#nw2-mval').textContent = n2_m + ' kg'; });
      container.querySelector('#nw2-sFric').addEventListener('input', e => { n2_fric = +e.target.value; container.querySelector('#nw2-fricval').textContent = n2_fric + ' N'; });
      container.querySelector('#nw2-reiniciar').addEventListener('click', () => { n2_x = 40; n2_v = 0; });
    } else {
      controles.innerHTML = `
        <div class="sim-ctrl-group">
          <label class="sim-ctrl-lbl">🧍 Masa patinador A <span class="sim-ctrl-val" id="nw3-maval">40 kg</span></label>
          <input type="range" class="sim-slider slider-nu" id="nw3-sMA" min="20" max="100" step="5" value="40">
        </div>
        <div class="sim-ctrl-group">
          <label class="sim-ctrl-lbl">🧍 Masa patinador B <span class="sim-ctrl-val" id="nw3-mbval">60 kg</span></label>
          <input type="range" class="sim-slider slider-nu" id="nw3-sMB" min="20" max="100" step="5" value="60">
        </div>
        <div class="sim-nuclear-btns">
          <button class="sim-nuclear-btn sim-nuclear-btn-go" id="nw3-empujar">🤾 Empujarse</button>
          <button class="sim-nuclear-btn sim-nuclear-btn-rst" id="nw3-reiniciar">↺ Reiniciar</button>
        </div>`;
      container.querySelector('#nw3-sMA').addEventListener('input', e => { n3_mA = +e.target.value; container.querySelector('#nw3-maval').textContent = n3_mA + ' kg'; });
      container.querySelector('#nw3-sMB').addEventListener('input', e => { n3_mB = +e.target.value; container.querySelector('#nw3-mbval').textContent = n3_mB + ' kg'; });
      container.querySelector('#nw3-empujar').addEventListener('click', () => {
        if (n3_empujado) return;
        n3_empujado = true;
        const impulso = 120; // kg·m/s repartido por conservación de momentum
        n3_vA = -impulso / n3_mA;
        n3_vB = impulso / n3_mB;
      });
      container.querySelector('#nw3-reiniciar').addEventListener('click', () => {
        n3_empujado = false; n3_xA = 200; n3_xB = 240; n3_vA = 0; n3_vB = 0;
      });
    }
  }

  tabs.forEach(btn => btn.addEventListener('click', () => { tab = +btn.dataset.tab; limpiar(); renderControles(); }));

  function dibujarBloque(x, y, color, label) {
    ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 8;
    ctx.fillRect(x - 15, y - 15, 30, 30);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#05050e'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
    ctx.fillText(label, x, y + 4);
  }

  function loop() {
    ctx.clearRect(0, 0, CW, CH);
    ctx.fillStyle = '#05050e'; ctx.fillRect(0, 0, CW, CH);
    const sueloY = 160;
    ctx.strokeStyle = '#4fc3f744'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(20, sueloY); ctx.lineTo(CW - 20, sueloY); ctx.stroke();

    if (tab === 1) {
      if (i_fricActiva) i_v = Math.max(0, i_v - 0.04);
      i_x += i_v;
      if (i_x > CW - 35 || i_x < 35) i_v *= -1;
      dibujarBloque(i_x, sueloY - 15, '#4fc3f7', '📦');
      lectura.textContent = i_v === 0
        ? 'En reposo: sin fuerza neta, seguirá en reposo (1ª Ley).'
        : `Moviéndose a velocidad constante (${i_v.toFixed(1)} u/f) — ninguna fuerza actúa sobre él.`;
    } else if (tab === 2) {
      const aNeta = Math.max(0, n2_F - n2_fric) / n2_m;
      n2_v += aNeta * 0.05;
      n2_x += n2_v;
      if (n2_x > CW - 35) { n2_x = 40; n2_v = 0; }
      dibujarBloque(n2_x, sueloY - 15, '#ff9800', '📦');
      ctx.fillStyle = '#ffd600'; ctx.font = '10px monospace'; ctx.textAlign = 'left';
      ctx.fillText(`F=${n2_F}N  fricción=${n2_fric}N  →  a = (F-fricción)/m = ${aNeta.toFixed(2)} m/s²`, 20, 25);
      lectura.textContent = `Aceleración resultante: ${aNeta.toFixed(2)} m/s² · velocidad actual: ${n2_v.toFixed(1)} m/s`;
    } else {
      if (n3_empujado) { n3_xA += n3_vA * 3; n3_xB += n3_vB * 3; }
      dibujarBloque(Math.max(35, n3_xA), sueloY - 15, '#39ff14', 'A');
      dibujarBloque(Math.min(CW - 35, n3_xB), sueloY - 15, '#ff3b9a', 'B');
      lectura.textContent = n3_empujado
        ? `A sale a ${Math.abs(n3_vA).toFixed(2)} m/s · B sale a ${n3_vB.toFixed(2)} m/s — mismo impulso, direcciones opuestas (3ª Ley).`
        : 'Presiona "Empujarse" para ver la acción-reacción.';
    }

    rafId = requestAnimationFrame(loop);
  }

  let rafId = null;
  limpiar(); renderControles();
  rafId = requestAnimationFrame(loop);

  return () => { if (rafId) cancelAnimationFrame(rafId); };
}
