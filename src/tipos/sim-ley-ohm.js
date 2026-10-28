// sim-ley-ohm.js — Simulador Física Grado 10: Ley de Ohm (I = V/R) y potencia eléctrica
export function iniciarSimLeyOhm(container) {
  container.innerHTML = `
    <div class="sim-wrap sim-ohm">
      <div class="sim-head">
        <span class="sim-titulo-txt">🔋 Simulador — Energía Eléctrica · Ley de Ohm</span>
        <span class="sim-instruccion">I = V / R</span>
      </div>
      <div class="sim-ohm-body">
        <canvas class="sim-canvas sim-ohm-cv" id="sim-oh-canvas"></canvas>
        <div class="sim-ohm-lecturas">
          <div class="sim-lectura lectura-p"><span class="lec-lbl">CORRIENTE (I)</span><span class="lec-val" id="sim-oh-i">0.00</span><span class="lec-unit">A</span></div>
          <div class="sim-lectura lectura-t"><span class="lec-lbl">POTENCIA (P)</span><span class="lec-val" id="sim-oh-p">0.0</span><span class="lec-unit">W</span></div>
        </div>
      </div>
      <div class="sim-nuclear-controles">
        <div class="sim-ctrl-group">
          <label class="sim-ctrl-lbl">🔋 Voltaje (V) <span class="sim-ctrl-val" id="sim-oh-vval">12 V</span></label>
          <input type="range" class="sim-slider slider-nu" id="sim-oh-sV" min="1" max="24" step="1" value="12">
        </div>
        <div class="sim-ctrl-group">
          <label class="sim-ctrl-lbl">🌀 Resistencia (R) <span class="sim-ctrl-val" id="sim-oh-rval">4 Ω</span></label>
          <input type="range" class="sim-slider slider-nu" id="sim-oh-sR" min="1" max="100" step="1" value="4">
        </div>
      </div>
    </div>`;

  const canvas = container.querySelector('#sim-oh-canvas');
  const ctx = canvas.getContext('2d');
  const CW = 300, CH = 200;
  canvas.width = CW; canvas.height = CH;

  const sV = container.querySelector('#sim-oh-sV');
  const sR = container.querySelector('#sim-oh-sR');
  const vval = container.querySelector('#sim-oh-vval');
  const rval = container.querySelector('#sim-oh-rval');
  const elI = container.querySelector('#sim-oh-i');
  const elP = container.querySelector('#sim-oh-p');

  let V = 12, R = 4;
  function onV() { V = parseFloat(sV.value); vval.textContent = V + ' V'; }
  function onR() { R = parseFloat(sR.value); rval.textContent = R + ' Ω'; }
  sV.addEventListener('input', onV);
  sR.addEventListener('input', onR);

  // Circuito rectangular
  const x0 = 50, y0 = 40, x1 = 250, y1 = 160;
  const perimetro = 2 * (x1 - x0) + 2 * (y1 - y0);
  function puntoEnPerimetro(d) {
    d = ((d % perimetro) + perimetro) % perimetro;
    const w = x1 - x0, h = y1 - y0;
    if (d < w) return { x: x0 + d, y: y0 };
    d -= w;
    if (d < h) return { x: x1, y: y0 + d };
    d -= h;
    if (d < w) return { x: x1 - d, y: y1 };
    d -= w;
    return { x: x0, y: y1 - d };
  }

  const cargas = Array.from({ length: 12 }, (_, i) => (i / 12) * perimetro);

  let rafId = null;
  function loop() {
    const I = V / R;
    const P = V * I;
    elI.textContent = I.toFixed(2);
    elP.textContent = P.toFixed(1);

    ctx.clearRect(0, 0, CW, CH);
    ctx.fillStyle = '#05050e'; ctx.fillRect(0, 0, CW, CH);

    // Cable
    ctx.strokeStyle = '#4fc3f755'; ctx.lineWidth = 3;
    ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);

    // Batería (lado izquierdo)
    ctx.fillStyle = '#0a0a1c';
    ctx.fillRect(x0 - 14, (y0 + y1) / 2 - 16, 28, 32);
    ctx.strokeStyle = '#ffd600'; ctx.lineWidth = 2;
    ctx.strokeRect(x0 - 14, (y0 + y1) / 2 - 16, 28, 32);
    ctx.fillStyle = '#ffd600'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
    ctx.fillText('+ −', x0, (y0 + y1) / 2 + 3);

    // Resistencia (lado derecho, zigzag)
    const midY = (y0 + y1) / 2;
    ctx.strokeStyle = '#ff6b35'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x1 - 25, midY);
    for (let i = 0; i < 6; i++) {
      ctx.lineTo(x1 - 18 + (i % 2 === 0 ? -6 : 6), midY - 20 + i * 8);
    }
    ctx.lineTo(x1 + 25, midY);
    ctx.stroke();
    ctx.fillStyle = '#ff6b35'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
    ctx.fillText('R', x1, midY - 30);

    // Cargas en movimiento (velocidad proporcional a I)
    const velocidad = Math.min(8, 0.6 + I * 0.5);
    cargas.forEach((d, i) => {
      cargas[i] = d + velocidad;
      const p = puntoEnPerimetro(cargas[i]);
      ctx.shadowColor = '#39ff14'; ctx.shadowBlur = 6;
      ctx.fillStyle = '#39ff14';
      ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    });

    rafId = requestAnimationFrame(loop);
  }

  onV(); onR();
  rafId = requestAnimationFrame(loop);

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    sV.removeEventListener('input', onV);
    sR.removeEventListener('input', onR);
  };
}
