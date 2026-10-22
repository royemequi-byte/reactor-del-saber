// sim-gases-ideales.js — Simulador Química Grado 10
// Retorna función cleanup() que detiene la animación y libera listeners

export function iniciarSimGasesIdeales(container) {
  container.innerHTML = `
    <div class="sim-wrap sim-gas">
      <div class="sim-head">
        <span class="sim-titulo-txt">⚗️ Simulador — Gases Ideales (Ley de Boyle)</span>
        <span class="sim-instruccion">Ajusta temperatura y pistón</span>
      </div>
      <div class="sim-gas-body">
        <canvas class="sim-canvas-gas" id="sim-gi-canvas"></canvas>
        <div class="sim-lecturas">
          <div class="sim-lectura lectura-p">
            <span class="lec-lbl">PRESIÓN</span>
            <span class="lec-val" id="sim-gi-p">1.00</span>
            <span class="lec-unit">atm</span>
          </div>
          <div class="sim-lectura lectura-t">
            <span class="lec-lbl">TEMP.</span>
            <span class="lec-val" id="sim-gi-t">300</span>
            <span class="lec-unit">K</span>
          </div>
          <div class="sim-lectura lectura-v">
            <span class="lec-lbl">VOLUMEN</span>
            <span class="lec-val" id="sim-gi-v">1.00</span>
            <span class="lec-unit">L</span>
          </div>
        </div>
      </div>
      <div class="sim-gas-controles">
        <div class="sim-ctrl-group">
          <label class="sim-ctrl-lbl">🌡️ Temperatura <span class="sim-ctrl-val" id="sim-gi-tval">300 K</span></label>
          <input type="range" class="sim-slider slider-t" id="sim-gi-sT" min="100" max="600" value="300">
        </div>
        <div class="sim-ctrl-group">
          <label class="sim-ctrl-lbl">🔧 Pistón (↓ comprime) <span class="sim-ctrl-val" id="sim-gi-vval">1.00 L</span></label>
          <input type="range" class="sim-slider slider-v" id="sim-gi-sV" min="30" max="100" value="100">
        </div>
        <div class="sim-ley-badge" id="sim-gi-ley">PV = nRT · Boyle: P₁V₁ = P₂V₂</div>
      </div>
    </div>`;

  const canvas  = container.querySelector('#sim-gi-canvas');
  const sT      = container.querySelector('#sim-gi-sT');
  const sV      = container.querySelector('#sim-gi-sV');
  const elP     = container.querySelector('#sim-gi-p');
  const elT     = container.querySelector('#sim-gi-t');
  const elV     = container.querySelector('#sim-gi-v');
  const elTval  = container.querySelector('#sim-gi-tval');
  const elVval  = container.querySelector('#sim-gi-vval');
  const elLey   = container.querySelector('#sim-gi-ley');
  const ctx     = canvas.getContext('2d');

  const CW = 320, CH = 220;
  canvas.width  = CW;
  canvas.height = CH;

  let T = 300, V = 1.0;
  const nR = 300;

  function calcP() { return (nR * T) / (V * 1000); }

  function actualizarLey() {
    const P = calcP();
    elP.textContent = P.toFixed(2);
    elT.textContent = T;
    elV.textContent = V.toFixed(2);
    const tFijo = Math.abs(T - 300) < 15;
    const vFijo = Math.abs(parseFloat(sV.value) - 100) < 5;
    if (tFijo && !vFijo)        elLey.textContent = 'Ley de Boyle: T constante → P₁V₁ = P₂V₂';
    else if (vFijo && !tFijo)   elLey.textContent = 'Gay-Lussac: V constante → P₁/T₁ = P₂/T₂';
    else if (!tFijo && !vFijo)  elLey.textContent = 'Ley combinada: P₁V₁/T₁ = P₂V₂/T₂';
    else                        elLey.textContent = 'PV = nRT · ajusta temperatura o pistón';
  }

  function onT() { T = parseInt(sT.value); elTval.textContent = T + ' K'; actualizarLey(); }
  function onV() { V = parseInt(sV.value) / 100; elVval.textContent = V.toFixed(2) + ' L'; actualizarLey(); }
  sT.addEventListener('input', onT);
  sV.addEventListener('input', onV);

  // Cilindro
  const CX = 40, CY_TOP = 20, CY_BOT = 200, CWIDTH = 200;
  const CX2 = CX + CWIDTH;

  const NP = 25;
  const parts = Array.from({ length: NP }, () => ({
    x:  CX + 15 + Math.random() * (CWIDTH - 30),
    y:  CY_TOP + 40 + Math.random() * (CY_BOT - CY_TOP - 60),
    vx: (Math.random() - 0.5) * 3,
    vy: (Math.random() - 0.5) * 3,
  }));

  function getPistonY() {
    const pct    = parseInt(sV.value) / 100;
    const maxSp  = CY_BOT - CY_TOP - 20;
    return CY_TOP + 8 + maxSp * (1 - pct) + maxSp * pct * 0.12;
  }

  function particleColor(t) {
    const r = Math.min(255, Math.round((t - 100) / 500 * 255 + 50));
    const g = Math.round(120 - (t - 100) / 500 * 80);
    const b = Math.max(30, Math.round(255 - (t - 100) / 500 * 200));
    return `rgb(${r},${g},${b})`;
  }

  let rafId = null;

  function loop() {
    ctx.clearRect(0, 0, CW, CH);
    ctx.fillStyle = '#05050e';
    ctx.fillRect(0, 0, CW, CH);

    const P       = calcP();
    const pistonY = getPistonY();
    const speed   = 0.8 + (T - 100) / 500 * 5;
    const col     = particleColor(T);

    // Paredes cilindro
    ctx.shadowColor = '#00d4ff44'; ctx.shadowBlur = 14;
    ctx.strokeStyle = '#00d4ff55'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(CX, CY_TOP + 8); ctx.lineTo(CX, CY_BOT);
    ctx.lineTo(CX2, CY_BOT);    ctx.lineTo(CX2, CY_TOP + 8);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Relleno gas
    const tempPct = (T - 100) / 500;
    ctx.fillStyle = `rgba(${Math.round(50+tempPct*180)},${Math.round(100-tempPct*60)},${Math.round(200-tempPct*140)},${0.04+tempPct*0.06})`;
    ctx.fillRect(CX+1, pistonY+12, CWIDTH-2, CY_BOT-pistonY-13);

    // Pistón
    const pg = ctx.createLinearGradient(CX, pistonY, CX, pistonY+12);
    pg.addColorStop(0, '#aaaacc'); pg.addColorStop(0.5, '#ffffff'); pg.addColorStop(1, '#556677');
    ctx.fillStyle = pg;
    ctx.fillRect(CX - 4, pistonY, CWIDTH + 8, 12);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(CX+1, pistonY+12, CWIDTH-2, 5);

    // Vástago
    ctx.strokeStyle = '#7788aa'; ctx.lineWidth = 5;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(CX + CWIDTH/2, pistonY);
    ctx.lineTo(CX + CWIDTH/2, CY_TOP);
    ctx.stroke();
    ctx.fillStyle = '#99aabb';
    ctx.fillRect(CX + CWIDTH/2 - 16, CY_TOP - 10, 32, 12);

    // Partículas
    for (const p of parts) {
      const v = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
      if (v > 0) { p.vx = p.vx/v * speed; p.vy = p.vy/v * speed; }
      p.x += p.vx; p.y += p.vy;
      if (p.x < CX+5)   { p.x = CX+5;   p.vx = Math.abs(p.vx); }
      if (p.x > CX2-5)  { p.x = CX2-5;  p.vx = -Math.abs(p.vx); }
      if (p.y > CY_BOT-5) { p.y = CY_BOT-5; p.vy = -Math.abs(p.vy); }
      if (p.y < pistonY+14) { p.y = pistonY+14; p.vy = Math.abs(p.vy); }

      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 9);
      grd.addColorStop(0, col.replace('rgb','rgba').replace(')',',0.3)'));
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(p.x, p.y, 9, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
      ctx.fillStyle = col; ctx.fill();
    }

    // Barra de presión
    const barH = CY_BOT - CY_TOP - 18;
    const pNorm = Math.min(1, (P - 0.5) / 4);
    ctx.fillStyle = '#111122';
    ctx.fillRect(CX-20, CY_TOP+9, 10, barH);
    ctx.fillStyle = `hsl(${Math.round((1-pNorm)*120)},100%,55%)`;
    ctx.fillRect(CX-20, CY_TOP+9+barH*(1-pNorm), 10, barH*pNorm);
    ctx.strokeStyle = '#ffffff18'; ctx.lineWidth = 1;
    ctx.strokeRect(CX-20, CY_TOP+9, 10, barH);
    ctx.fillStyle = '#ff6b35'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
    ctx.fillText('P', CX-15, CY_BOT+13);

    // Etiqueta pistón
    ctx.fillStyle = '#4fc3f766';
    ctx.font = '9px monospace'; ctx.textAlign = 'center';
    ctx.fillText('PISTÓN', CX + CWIDTH/2, CY_TOP - 14);

    rafId = requestAnimationFrame(loop);
  }

  loop();
  actualizarLey();

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    sT.removeEventListener('input', onT);
    sV.removeEventListener('input', onV);
    rafId = null;
  };
}
