export function iniciarSimSoluciones(container) {
  container.innerHTML = `
    <div class="sim-sol-wrap">
      <div class="sim-sol-header">
        <div class="sim-sol-dots"><span></span><span></span><span></span></div>
        <span class="sim-sol-title">⚗️  Disolución Iónica  ·  NaCl en H₂O</span>
        <div class="sim-sol-temp-badge">🌡️ <span class="sim-sol-temp-val">25</span>°C</div>
      </div>
      <div class="sim-sol-layout">
        <canvas class="sim-sol-cv" width="460" height="300"></canvas>
        <div class="sim-sol-panel">
          <div class="sim-sol-gauge" style="--acc:#7c3aed">
            <span class="sim-sol-gauge-lbl">CONCENTRACIÓN</span>
            <span class="sim-sol-gauge-val sim-sol-conc">0.00</span>
            <span class="sim-sol-gauge-unit">mol / L</span>
            <div class="sim-sol-bar-wrap"><div class="sim-sol-bar-fill sim-sol-bar-conc" style="width:0%"></div></div>
          </div>
          <div class="sim-sol-gauge" style="--acc:#0284c7">
            <span class="sim-sol-gauge-lbl">VOLUMEN H₂O</span>
            <span class="sim-sol-gauge-val sim-sol-vol" style="color:#0284c7">1.00</span>
            <span class="sim-sol-gauge-unit">litros</span>
            <div class="sim-sol-bar-wrap"><div class="sim-sol-bar-fill" style="width:20%;background:#0284c7"></div></div>
          </div>
          <div class="sim-sol-gauge" style="--acc:#b45309">
            <span class="sim-sol-gauge-lbl">MOLES NaCl</span>
            <span class="sim-sol-gauge-val sim-sol-moles" style="color:#b45309">0.00</span>
            <span class="sim-sol-gauge-unit">mol</span>
          </div>
          <div class="sim-sol-estado-badge">NO SATURADA</div>
          <div class="sim-sol-actions">
            <button class="sim-sol-action btn-nacl-a">＋ Agregar NaCl</button>
            <button class="sim-sol-action btn-agua-a">💧 Agregar agua ×2</button>
            <button class="sim-sol-action btn-cal-a">🔥 Calentar +20°C</button>
            <button class="sim-sol-action btn-rst-a">↺ Reiniciar</button>
          </div>
        </div>
      </div>
      <div class="sim-sol-footer">
        <span class="sim-sol-ion-tag" style="--c:#7c3aed">● Na⁺ sodio</span>
        <span class="sim-sol-ion-tag" style="--c:#059669">● Cl⁻ cloro</span>
        <span class="sim-sol-ion-tag" style="--c:#0284c7">● H₂O agua</span>
        <span class="sim-sol-sat-hint">Sat NaCl ≈ 6 mol/L @ 25°C</span>
      </div>
    </div>
  `;

  const canvas  = container.querySelector('canvas');
  const ctx     = canvas.getContext('2d');
  const W = 460, H = 300;

  const elConc   = container.querySelector('.sim-sol-conc');
  const elVol    = container.querySelector('.sim-sol-vol');
  const elMoles  = container.querySelector('.sim-sol-moles');
  const elEst    = container.querySelector('.sim-sol-estado-badge');
  const elBarC   = container.querySelector('.sim-sol-bar-conc');
  const elTempV  = container.querySelector('.sim-sol-temp-val');

  let moles = 6, litros = 1, tempC = 25;
  const SAT_BASE = 6;
  const iones = [];
  let cristales = [];

  const getConc   = () => litros > 0 ? moles / litros : 0;
  const getSat    = () => SAT_BASE + (tempC - 25) * 0.04;
  const getWaterY = () => Math.max(58, 196 - litros * 24);

  function addIones(n) {
    for (let i = 0; i < n; i++) {
      const tipo = i % 2 === 0 ? 'na' : 'cl';
      iones.push({
        tipo, x: 120 + Math.random()*220, y: 62 + Math.random()*18,
        vx: (Math.random()-0.5)*1.8, vy: Math.random()*1.6+0.6,
        r: tipo==='na' ? 7 : 8.5,
        wobble: Math.random()*Math.PI*2,
      });
    }
  }

  function addCristal() {
    cristales.push({ x: 195 + Math.random()*65, y: 28, life: 1.0 });
  }

  // ── DRAW ──────────────────────────────────────────────────────────────────
  function drawBg() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#f0f8ff');
    g.addColorStop(0.5, '#e8f4fd');
    g.addColorStop(1, '#dbeafe');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Subtle dot grid
    ctx.fillStyle = 'rgba(59,130,246,0.12)';
    for (let x = 18; x < W; x += 22) {
      for (let y = 18; y < H; y += 22) {
        ctx.beginPath(); ctx.arc(x, y, 1.1, 0, Math.PI*2); ctx.fill();
      }
    }
  }

  function drawBeakerFill() {
    const bx = 96, bw = 268;
    const waterY = getWaterY();
    const waterH = 268 - waterY;
    if (waterH <= 0) return;

    const conc = getConc(), sat = getSat();
    const pct = Math.min(1, conc / sat);
    // Water transitions from sky-blue to deep blue as concentration rises
    const r = Math.round(56 + pct*20);
    const g2 = Math.round(189 - pct*80);
    const b  = Math.round(248 - pct*40);

    const wg = ctx.createLinearGradient(bx, waterY, bx, 268);
    wg.addColorStop(0, `rgba(${r},${g2},${b},0.55)`);
    wg.addColorStop(1, `rgba(${r+10},${g2-20},${b-20},0.78)`);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(bx, waterY); ctx.lineTo(bx+bw, waterY);
    ctx.lineTo(bx+bw+4, 268); ctx.lineTo(bx-4, 268);
    ctx.closePath(); ctx.clip();
    ctx.fillStyle = wg;
    ctx.fillRect(bx-6, waterY, bw+12, 280);

    // Waves
    const t = Date.now() * 0.002;
    ctx.beginPath(); ctx.moveTo(bx, waterY);
    for (let x = bx; x <= bx+bw; x += 3) {
      ctx.lineTo(x, waterY + Math.sin((x-bx)*0.046 + t)*2.8 + Math.sin((x-bx)*0.02 - t*0.6)*1.4);
    }
    ctx.lineTo(bx+bw, waterY);
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.8; ctx.stroke();

    // H2O molecules background (faint)
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 10; i++) {
      const wx = bx + 22 + i*24, wy = waterY + 24 + (i%4)*46;
      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath(); ctx.arc(wx, wy, 3.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(wx+8, wy-4, 2.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(wx+8, wy+4, 2.5, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawCristales() {
    cristales = cristales.filter(c => c.life > 0);
    cristales.forEach(c => {
      c.y += 0.6; c.life -= 0.009;
      const s = 12 * c.life;
      ctx.globalAlpha = c.life * 0.85;
      ctx.save(); ctx.translate(c.x, c.y);
      const step = s * 0.5;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const col = (dx + dy) % 2 === 0 ? '#7c3aed' : '#059669';
          ctx.fillStyle = col;
          ctx.shadowColor = col; ctx.shadowBlur = 5;
          ctx.beginPath(); ctx.arc(dx*step, dy*step, s*0.32, 0, Math.PI*2); ctx.fill();
        }
      }
      ctx.shadowBlur = 0; ctx.restore(); ctx.globalAlpha = 1;
    });
  }

  function drawIones() {
    const waterY = getWaterY();
    iones.forEach(ion => {
      ion.wobble += 0.042;
      ion.x += ion.vx + Math.sin(ion.wobble*0.65)*0.35;
      ion.y += ion.vy;
      const ratio = (ion.y - 30) / 240;
      const lw = 96 - ratio*4, rw = 364 + ratio*4;
      if (ion.x < lw+ion.r)  { ion.x = lw+ion.r;  ion.vx = Math.abs(ion.vx); }
      if (ion.x > rw-ion.r)  { ion.x = rw-ion.r;  ion.vx = -Math.abs(ion.vx); }
      if (ion.y > 262-ion.r) { ion.y = 262-ion.r; ion.vy = -Math.abs(ion.vy)*0.72; }
      if (ion.y < waterY+ion.r) { ion.y = waterY+ion.r; ion.vy = Math.abs(ion.vy); }
      const spd = Math.hypot(ion.vx, ion.vy);
      if (spd > 2.2) { ion.vx *= 0.97; ion.vy *= 0.97; }
      if (spd < 0.28 && Math.random() < 0.015) { ion.vx += (Math.random()-0.5)*0.9; ion.vy += (Math.random()-0.5)*0.5; }

      const col = ion.tipo === 'na' ? '#7c3aed' : '#059669';
      const label = ion.tipo === 'na' ? 'Na⁺' : 'Cl⁻';

      // Soft shadow visible on white
      ctx.shadowColor = col; ctx.shadowBlur = 8;

      // 3D sphere
      const sg = ctx.createRadialGradient(ion.x-ion.r*.32, ion.y-ion.r*.32, 0, ion.x, ion.y, ion.r);
      sg.addColorStop(0, col==='#7c3aed'?'#a78bfa':col==='#059669'?'#34d399':col);
      sg.addColorStop(0.55, col);
      sg.addColorStop(1, ion.tipo==='na'?'#4c1d95':'#064e3b');
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(ion.x, ion.y, ion.r, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;

      // White ring edge
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(ion.x, ion.y, ion.r, 0, Math.PI*2); ctx.stroke();

      // Specular
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.beginPath(); ctx.arc(ion.x-ion.r*.3, ion.y-ion.r*.3, ion.r*.3, 0, Math.PI*2); ctx.fill();

      // Label — dark on white bg outside water area
      ctx.fillStyle = '#1e1b4b';
      ctx.font = `bold ${ion.r<8?7:8}px monospace`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(label, ion.x, ion.y + ion.r + 9);
      ctx.textBaseline = 'alphabetic';
    });
  }

  function drawGlass() {
    const bx=95, by=30, bw=270, bh=238;
    ctx.strokeStyle = 'rgba(30,64,175,0.65)'; ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(bx+15,by); ctx.lineTo(bx+bw-15,by);
    ctx.lineTo(bx+bw,by+bh); ctx.lineTo(bx,by+bh);
    ctx.moveTo(bx+15,by); ctx.lineTo(bx,by+bh);
    ctx.moveTo(bx+bw-15,by); ctx.lineTo(bx+bw,by+bh);
    ctx.stroke();
    // Spout
    ctx.beginPath(); ctx.moveTo(bx+bw-15,by); ctx.lineTo(bx+bw+10,by-18);
    ctx.strokeStyle='rgba(30,64,175,0.4)'; ctx.lineWidth=1.8; ctx.stroke();
    // Glass reflection
    ctx.strokeStyle='rgba(255,255,255,0.55)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(bx+15,by); ctx.lineTo(bx+6,by+50); ctx.stroke();
    // Graduations
    for (let i=1; i<=4; i++) {
      const y = by+bh-i*50;
      ctx.beginPath(); ctx.moveTo(bx-12,y); ctx.lineTo(bx+5,y);
      ctx.strokeStyle='rgba(37,99,235,0.6)'; ctx.lineWidth=1; ctx.stroke();
      ctx.fillStyle='#1e40af'; ctx.font='9px monospace'; ctx.textAlign='right';
      ctx.fillText(i*0.25+'L', bx-14, y+3);
    }
    // Formula
    ctx.fillStyle='rgba(30,64,175,0.55)'; ctx.font='bold 11px monospace'; ctx.textAlign='center';
    ctx.fillText('NaCl → Na⁺ + Cl⁻', W/2, H-6);
  }

  function updateUI() {
    const c = getConc(), s = getSat();
    elConc.textContent  = c.toFixed(2);
    elVol.textContent   = litros.toFixed(2);
    elMoles.textContent = moles.toFixed(1);
    elTempV.textContent = Math.round(tempC);
    const pct = Math.min(100, (c/s)*100);
    const barCol = pct < 60 ? '#7c3aed' : pct < 85 ? '#d97706' : '#dc2626';
    elBarC.style.width = pct + '%';
    elBarC.style.background = barCol;
    elConc.style.color = barCol;
    if (c < s*0.85) {
      elEst.style.cssText='background:#d1fae5;border:1.5px solid #059669;color:#065f46;font-size:11px;font-weight:700;font-family:monospace;padding:5px 12px;border-radius:20px;text-align:center;letter-spacing:1px;';
      elEst.textContent='● NO SATURADA';
    } else if (c < s) {
      elEst.style.cssText='background:#fef3c7;border:1.5px solid #d97706;color:#92400e;font-size:11px;font-weight:700;font-family:monospace;padding:5px 12px;border-radius:20px;text-align:center;letter-spacing:1px;';
      elEst.textContent='◐ CASI SATURADA';
    } else {
      elEst.style.cssText='background:#fee2e2;border:1.5px solid #dc2626;color:#7f1d1d;font-size:11px;font-weight:700;font-family:monospace;padding:5px 12px;border-radius:20px;text-align:center;letter-spacing:1px;';
      elEst.textContent='● SATURADA';
    }
  }

  let rafId;
  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawBg();
    drawBeakerFill();
    drawCristales();
    drawIones();
    drawGlass();
    updateUI();
    rafId = requestAnimationFrame(loop);
  }

  container.querySelector('.btn-nacl-a').addEventListener('click', () => {
    if (getConc() >= getSat()*1.05) return;
    moles += 0.5; addCristal();
    setTimeout(() => addIones(8), 380);
  });
  container.querySelector('.btn-agua-a').addEventListener('click', () => { litros = Math.min(5, litros*2); });
  container.querySelector('.btn-cal-a').addEventListener('click',  () => { tempC = Math.min(100, tempC+20); });
  container.querySelector('.btn-rst-a').addEventListener('click',  () => {
    moles=0; litros=1; tempC=25; iones.length=0; cristales.length=0;
  });

  addIones(48); // poblar iones iniciales para la solución saturada de partida
  loop();
  return () => { cancelAnimationFrame(rafId); container.innerHTML=''; };
}
