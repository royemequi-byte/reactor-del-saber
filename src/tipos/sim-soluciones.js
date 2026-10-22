export function iniciarSimSoluciones(container) {
  container.innerHTML = `
    <div class="sim-wrap">
      <div class="sim-head">
        <span class="sim-dot dg"></span><span class="sim-dot dy"></span><span class="sim-dot dr"></span>
        <span class="sim-titulo-txt">⚗️ Simulador — Disolución Iónica · NaCl en H₂O</span>
      </div>
      <div class="sim-sol-body">
        <canvas class="sim-sol-canvas" width="460" height="300"></canvas>
        <div class="sim-sol-panel">
          <div class="sim-sol-instrumento">
            <span class="sim-sol-inst-lbl">CONCENTRACIÓN</span>
            <span class="sim-sol-conc sim-sol-inst-val" style="color:#ce93d8">0.00</span>
            <span class="sim-sol-inst-unit">mol / L</span>
            <div class="sim-sol-bar-conc" style="height:5px;border-radius:3px;margin-top:6px;transition:width 0.5s,background 0.5s;width:0%;background:#ce93d8"></div>
          </div>
          <div class="sim-sol-instrumento">
            <span class="sim-sol-inst-lbl">VOLUMEN H₂O</span>
            <span class="sim-sol-vol sim-sol-inst-val" style="color:#81d4fa">1.00</span>
            <span class="sim-sol-inst-unit">litros</span>
            <div class="sim-sol-bar-vol" style="height:5px;border-radius:3px;margin-top:6px;width:20%;background:#29b6f6"></div>
          </div>
          <div class="sim-sol-instrumento">
            <span class="sim-sol-inst-lbl">MOLES NaCl</span>
            <span class="sim-sol-moles sim-sol-inst-val" style="color:#ffcc80">0.00</span>
            <span class="sim-sol-inst-unit">mol</span>
          </div>
          <div class="sim-sol-estado">NO SATURADA</div>
          <div class="sim-sol-btns">
            <button class="sim-sol-btn btn-nacl">＋ Agregar NaCl</button>
            <button class="sim-sol-btn btn-agua">💧 Agregar agua (×2)</button>
            <button class="sim-sol-btn btn-calentar">🔥 Calentar (+20°C)</button>
            <button class="sim-sol-btn btn-reset">↺ Reiniciar</button>
          </div>
        </div>
      </div>
      <div class="sim-sol-leyenda">
        <div class="sim-sol-ley-item"><div class="sim-sol-ley-dot" style="background:#ab47bc;box-shadow:0 0 4px #ab47bc"></div> Na⁺ (ión sodio)</div>
        <div class="sim-sol-ley-item"><div class="sim-sol-ley-dot" style="background:#26c6da;box-shadow:0 0 4px #26c6da"></div> Cl⁻ (ión cloro)</div>
        <div class="sim-sol-ley-item"><div class="sim-sol-ley-dot" style="background:#e3f2fd44;border:1px solid #e3f2fd44"></div> H₂O (agua)</div>
        <div class="sim-sol-ley-item" style="color:#555577;margin-left:auto">Sat. NaCl ≈ 6 mol/L</div>
      </div>
    </div>
  `;

  const canvas = container.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const W = 460, H = 300;

  const elConc  = container.querySelector('.sim-sol-conc');
  const elVol   = container.querySelector('.sim-sol-vol');
  const elMoles = container.querySelector('.sim-sol-moles');
  const elEst   = container.querySelector('.sim-sol-estado');
  const elBarC  = container.querySelector('.sim-sol-bar-conc');
  const elBarV  = container.querySelector('.sim-sol-bar-vol');

  let moles = 0, litros = 1, tempC = 25;
  const SAT_BASE = 6;
  const iones = [];
  let cristales = [];

  const getConc = () => litros > 0 ? moles / litros : 0;
  const getSat  = () => SAT_BASE + (tempC - 25) * 0.04;
  const getWaterY = () => Math.max(60, 200 - litros * 25);

  function addIones(n) {
    for (let i = 0; i < n; i++) {
      const tipo = i % 2 === 0 ? 'na' : 'cl';
      iones.push({
        tipo, x: 120 + Math.random() * 220, y: 60 + Math.random() * 20,
        vx: (Math.random() - 0.5) * 1.5, vy: Math.random() * 1.5 + 0.5,
        r: tipo === 'na' ? 7 : 8.5,
        wobble: Math.random() * Math.PI * 2,
      });
    }
  }

  function addCristal() {
    cristales.push({ x: 200 + Math.random() * 60, y: 30, life: 1.0 });
  }

  function drawBackground() {
    ctx.fillStyle = '#03030a';
    ctx.fillRect(0, 0, W, H);
  }

  function drawBeakerFill() {
    const bx = 96, bw = 268;
    const waterY = getWaterY();
    const waterH = 268 - waterY;
    if (waterH <= 0) return;

    const conc = getConc();
    const alpha = Math.min(0.75, 0.12 + conc * 0.08);
    const blueShift = Math.min(200, Math.round(conc * 30));

    const wg = ctx.createLinearGradient(bx, waterY, bx, 268);
    wg.addColorStop(0, `rgba(${blueShift},${150 - blueShift / 3},220,${alpha * 0.6})`);
    wg.addColorStop(1, `rgba(${blueShift + 20},${120 - blueShift / 3},200,${alpha})`);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(bx, waterY); ctx.lineTo(bx + bw, waterY);
    ctx.lineTo(bx + bw + 4, 268); ctx.lineTo(bx - 4, 268);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = wg;
    ctx.fillRect(bx - 5, waterY, bw + 10, 280);

    const t = Date.now() * 0.002;
    ctx.beginPath();
    ctx.moveTo(bx, waterY);
    for (let x = bx; x <= bx + bw; x += 4) {
      ctx.lineTo(x, waterY + Math.sin((x - bx) * 0.04 + t) * 2.5);
    }
    ctx.lineTo(bx + bw, waterY);
    ctx.strokeStyle = 'rgba(180,220,255,0.3)'; ctx.lineWidth = 1.5; ctx.stroke();

    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 12; i++) {
      const wx = bx + 20 + i * 20, wy = waterY + 20 + (i % 3) * 50;
      ctx.fillStyle = '#81d4fa';
      ctx.beginPath(); ctx.arc(wx, wy, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(wx + 8, wy - 4, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(wx + 8, wy + 4, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawCristales() {
    cristales = cristales.filter(c => c.life > 0);
    cristales.forEach(c => {
      c.y += 0.5; c.life -= 0.008;
      const s = 12 * c.life;
      ctx.globalAlpha = c.life * 0.9;
      ctx.save(); ctx.translate(c.x, c.y);
      const step = s * 0.5;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const tipo = (dx + dy) % 2 === 0 ? '#ab47bc' : '#26c6da';
          ctx.fillStyle = tipo; ctx.shadowColor = tipo; ctx.shadowBlur = 4;
          ctx.beginPath(); ctx.arc(dx * step, dy * step, s * 0.3, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.shadowBlur = 0; ctx.restore(); ctx.globalAlpha = 1;
    });
  }

  function drawIones() {
    const waterY = getWaterY();
    iones.forEach(ion => {
      ion.wobble += 0.04;
      ion.x += ion.vx + Math.sin(ion.wobble * 0.7) * 0.3;
      ion.y += ion.vy;
      const ratio = (ion.y - 30) / 240;
      const lw = 96 - ratio * 4, rw = 364 + ratio * 4;
      if (ion.x < lw + ion.r)  { ion.x = lw + ion.r;  ion.vx = Math.abs(ion.vx); }
      if (ion.x > rw - ion.r)  { ion.x = rw - ion.r;  ion.vx = -Math.abs(ion.vx); }
      if (ion.y > 262 - ion.r) { ion.y = 262 - ion.r; ion.vy = -Math.abs(ion.vy) * 0.7; }
      if (ion.y < waterY + ion.r) { ion.y = waterY + ion.r; ion.vy = Math.abs(ion.vy); }
      const speed = Math.sqrt(ion.vx ** 2 + ion.vy ** 2);
      if (speed > 2) { ion.vx *= 0.98; ion.vy *= 0.98; }
      if (speed < 0.3 && Math.random() < 0.01) { ion.vx += (Math.random() - 0.5) * 0.8; ion.vy += (Math.random() - 0.5) * 0.4; }

      const col = ion.tipo === 'na' ? '#ab47bc' : '#26c6da';
      const label = ion.tipo === 'na' ? 'Na⁺' : 'Cl⁻';

      const grd = ctx.createRadialGradient(ion.x, ion.y, 0, ion.x, ion.y, ion.r * 2.5);
      grd.addColorStop(0, col + '66'); grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(ion.x, ion.y, ion.r * 2.5, 0, Math.PI * 2); ctx.fill();

      const sg = ctx.createRadialGradient(ion.x - ion.r * 0.3, ion.y - ion.r * 0.3, 0, ion.x, ion.y, ion.r);
      sg.addColorStop(0, col + 'ff'); sg.addColorStop(0.5, col + 'cc'); sg.addColorStop(1, col + '55');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(ion.x, ion.y, ion.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.beginPath(); ctx.arc(ion.x - ion.r * 0.28, ion.y - ion.r * 0.28, ion.r * 0.28, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = `bold ${ion.r < 8 ? 7 : 8}px monospace`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(label, ion.x, ion.y + ion.r + 8);
      ctx.textBaseline = 'alphabetic';
    });
  }

  function drawBeakerGlass() {
    const bx = 95, by = 30, bw = 270, bh = 238;
    ctx.strokeStyle = 'rgba(160,200,255,0.35)'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(bx + 15, by); ctx.lineTo(bx + bw - 15, by);
    ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx, by + bh);
    ctx.moveTo(bx + 15, by); ctx.lineTo(bx, by + bh);
    ctx.moveTo(bx + bw - 15, by); ctx.lineTo(bx + bw, by + bh);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx + bw - 15, by); ctx.lineTo(bx + bw + 10, by - 18);
    ctx.strokeStyle = 'rgba(160,200,255,0.25)'; ctx.lineWidth = 2; ctx.stroke();
    for (let i = 1; i <= 4; i++) {
      const y = by + bh - i * 50;
      ctx.beginPath(); ctx.moveTo(bx - 12, y); ctx.lineTo(bx + 4, y);
      ctx.strokeStyle = 'rgba(100,150,200,0.4)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = 'rgba(100,150,200,0.5)'; ctx.font = '9px monospace'; ctx.textAlign = 'right';
      ctx.fillText(i * 0.25 + 'L', bx - 14, y + 3);
    }
    ctx.fillStyle = 'rgba(100,150,200,0.4)'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
    ctx.fillText('NaCl → Na⁺ + Cl⁻', W / 2, H - 8);
    ctx.fillStyle = '#ff704388'; ctx.font = '11px monospace'; ctx.textAlign = 'left';
    ctx.fillText('🌡️ ' + Math.round(tempC) + '°C', 10, 20);
  }

  function updateUI() {
    const c = getConc(), s = getSat();
    elConc.textContent  = c.toFixed(2);
    elVol.textContent   = litros.toFixed(2);
    elMoles.textContent = moles.toFixed(1);
    const pct = Math.min(100, (c / s) * 100);
    const barCol = pct < 60 ? '#ce93d8' : pct < 85 ? '#ff9800' : '#ff5252';
    elBarC.style.width = pct + '%';
    elBarC.style.background = barCol;
    elConc.style.color = barCol;
    elBarV.style.width = Math.min(100, litros * 20) + '%';
    if (c < s * 0.85) {
      elEst.style.cssText = 'background:#00e67612;border:1px solid #00e67644;color:#69f0ae;font-size:11px;font-weight:bold;font-family:monospace;padding:4px 8px;border-radius:12px;text-align:center;';
      elEst.textContent = 'NO SATURADA';
    } else if (c < s) {
      elEst.style.cssText = 'background:#ff980012;border:1px solid #ff980044;color:#ffcc02;font-size:11px;font-weight:bold;font-family:monospace;padding:4px 8px;border-radius:12px;text-align:center;';
      elEst.textContent = 'CASI SATURADA';
    } else {
      elEst.style.cssText = 'background:#ff525212;border:1px solid #ff525244;color:#ff8a80;font-size:11px;font-weight:bold;font-family:monospace;padding:4px 8px;border-radius:12px;text-align:center;';
      elEst.textContent = 'SATURADA';
    }
  }

  let rafId;
  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawBackground();
    drawBeakerFill();
    drawCristales();
    drawIones();
    drawBeakerGlass();
    updateUI();
    rafId = requestAnimationFrame(loop);
  }

  container.querySelector('.btn-nacl').addEventListener('click', () => {
    if (getConc() >= getSat() * 1.05) return;
    moles += 0.5;
    addCristal();
    setTimeout(() => addIones(8), 400);
  });
  container.querySelector('.btn-agua').addEventListener('click', () => {
    litros = Math.min(5, litros * 2);
  });
  container.querySelector('.btn-calentar').addEventListener('click', () => {
    tempC = Math.min(100, tempC + 20);
  });
  container.querySelector('.btn-reset').addEventListener('click', () => {
    moles = 0; litros = 1; tempC = 25;
    iones.length = 0; cristales.length = 0;
  });

  loop();
  return () => { cancelAnimationFrame(rafId); container.innerHTML = ''; };
}
