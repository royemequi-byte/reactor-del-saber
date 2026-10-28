// sim-transferencia-calor.js — Simulador Física Grado 9: conducción de calor al equilibrio
export function iniciarSimTransferenciaCalor(container) {
  container.innerHTML = `
    <div class="sim-wrap sim-calor">
      <div class="sim-head">
        <span class="sim-titulo-txt">🔥 Simulador — Transferencia de Calor</span>
        <span class="sim-instruccion">Misma masa y material en ambos objetos</span>
      </div>
      <canvas class="sim-canvas sim-calor-cv" id="sim-ca-canvas"></canvas>
      <div class="sim-nuclear-controles">
        <div class="sim-ctrl-group">
          <label class="sim-ctrl-lbl">🌡️ Temp. objeto A <span class="sim-ctrl-val" id="sim-ca-aval">80°C</span></label>
          <input type="range" class="sim-slider slider-nu" id="sim-ca-sA" min="0" max="100" step="5" value="80">
        </div>
        <div class="sim-ctrl-group">
          <label class="sim-ctrl-lbl">🌡️ Temp. objeto B <span class="sim-ctrl-val" id="sim-ca-bval">20°C</span></label>
          <input type="range" class="sim-slider slider-nu" id="sim-ca-sB" min="0" max="100" step="5" value="20">
        </div>
        <div class="sim-ctrl-group">
          <label class="sim-ctrl-lbl">🧲 Conductividad <span class="sim-ctrl-val" id="sim-ca-cval">Media</span></label>
          <input type="range" class="sim-slider slider-nu" id="sim-ca-sC" min="1" max="3" step="1" value="2">
        </div>
        <div class="sim-nuclear-btns">
          <button class="sim-nuclear-btn sim-nuclear-btn-go" id="sim-ca-contacto">🤝 Poner en contacto</button>
          <button class="sim-nuclear-btn sim-nuclear-btn-rst" id="sim-ca-reiniciar">↺ Reiniciar</button>
        </div>
      </div>
    </div>`;

  const canvas = container.querySelector('#sim-ca-canvas');
  const ctx = canvas.getContext('2d');
  const CW = 440, CH = 200;
  canvas.width = CW; canvas.height = CH;

  const sA = container.querySelector('#sim-ca-sA');
  const sB = container.querySelector('#sim-ca-sB');
  const sC = container.querySelector('#sim-ca-sC');
  const aval = container.querySelector('#sim-ca-aval');
  const bval = container.querySelector('#sim-ca-bval');
  const cval = container.querySelector('#sim-ca-cval');

  let tA0 = 80, tB0 = 20, cond = 2, tA = 80, tB = 20, contacto = false;
  const CONDS = { 1: 'Baja', 2: 'Media', 3: 'Alta' };
  const TASAS = { 1: 0.15, 2: 0.4, 3: 0.9 };

  function onA() { tA0 = parseFloat(sA.value); aval.textContent = tA0 + '°C'; if (!contacto) tA = tA0; }
  function onB() { tB0 = parseFloat(sB.value); bval.textContent = tB0 + '°C'; if (!contacto) tB = tB0; }
  function onC() { cond = parseInt(sC.value); cval.textContent = CONDS[cond]; }
  sA.addEventListener('input', onA);
  sB.addEventListener('input', onB);
  sC.addEventListener('input', onC);

  container.querySelector('#sim-ca-contacto').addEventListener('click', () => { contacto = true; });
  container.querySelector('#sim-ca-reiniciar').addEventListener('click', () => { tA = tA0; tB = tB0; contacto = false; });

  const partA = Array.from({ length: 20 }, () => ({ x: Math.random(), y: Math.random(), ang: Math.random() * Math.PI * 2 }));
  const partB = Array.from({ length: 20 }, () => ({ x: Math.random(), y: Math.random(), ang: Math.random() * Math.PI * 2 }));

  function colorTemp(temp) {
    const pct = Math.min(1, Math.max(0, temp / 100));
    const r = Math.round(50 + pct * 205), b = Math.round(220 - pct * 190);
    return `rgb(${r},${Math.round(80 + pct * 40)},${b})`;
  }

  function dibujarBloque(x0, w, temp, parts) {
    const y0 = 30, h = 140;
    ctx.fillStyle = colorTemp(temp) + '22';
    ctx.strokeStyle = colorTemp(temp);
    ctx.lineWidth = 2;
    ctx.fillRect(x0, y0, w, h);
    ctx.strokeRect(x0, y0, w, h);

    const velFactor = 0.3 + (temp / 100) * 2.2;
    parts.forEach(p => {
      p.ang += velFactor * 0.15;
      const px = x0 + 14 + p.x * (w - 28) + Math.cos(p.ang) * 4;
      const py = y0 + 14 + p.y * (h - 28) + Math.sin(p.ang * 1.3) * 4;
      ctx.fillStyle = colorTemp(temp);
      ctx.shadowColor = colorTemp(temp); ctx.shadowBlur = 4;
      ctx.beginPath(); ctx.arc(px, py, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    });

    ctx.fillStyle = '#eafcff'; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center';
    ctx.fillText(Math.round(temp) + '°C', x0 + w / 2, y0 + h + 18);
  }

  let rafId = null;
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    if (contacto) {
      const promedio = (tA + tB) / 2;
      const tasa = TASAS[cond];
      tA += (promedio - tA) * tasa * dt * 4;
      tB += (promedio - tB) * tasa * dt * 4;
    }

    ctx.clearRect(0, 0, CW, CH);
    ctx.fillStyle = '#05050e'; ctx.fillRect(0, 0, CW, CH);

    dibujarBloque(40, 160, tA, partA);
    dibujarBloque(240, 160, tB, partB);

    if (contacto) {
      ctx.strokeStyle = '#ff980088'; ctx.lineWidth = 2; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(200, 50); ctx.lineTo(240, 50); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ff9800'; ctx.font = '16px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(tA > tB ? '→' : (tB > tA ? '←' : '·'), 220, 46);
    }

    rafId = requestAnimationFrame(loop);
  }

  onA(); onB(); onC();
  rafId = requestAnimationFrame(loop);

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    sA.removeEventListener('input', onA);
    sB.removeEventListener('input', onB);
    sC.removeEventListener('input', onC);
  };
}
