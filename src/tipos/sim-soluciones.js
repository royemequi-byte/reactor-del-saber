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
          <div class="sim-sol-gauge sim-sol-gauge-conc">
            <div class="sim-sol-gauge-ring" style="--ring:#a855f7"></div>
            <div class="sim-sol-gauge-body">
              <span class="sim-sol-gauge-lbl">CONCENTRACIÓN</span>
              <span class="sim-sol-gauge-val sim-sol-conc">0.00</span>
              <span class="sim-sol-gauge-unit">mol / L</span>
            </div>
            <div class="sim-sol-bar-wrap">
              <div class="sim-sol-bar-fill sim-sol-bar-conc" style="width:0%"></div>
            </div>
          </div>
          <div class="sim-sol-gauge">
            <div class="sim-sol-gauge-ring" style="--ring:#22d3ee"></div>
            <div class="sim-sol-gauge-body">
              <span class="sim-sol-gauge-lbl">VOLUMEN H₂O</span>
              <span class="sim-sol-gauge-val sim-sol-vol" style="color:#22d3ee">1.00</span>
              <span class="sim-sol-gauge-unit">litros</span>
            </div>
            <div class="sim-sol-bar-wrap">
              <div class="sim-sol-bar-fill" style="width:20%;background:#22d3ee"></div>
            </div>
          </div>
          <div class="sim-sol-gauge">
            <div class="sim-sol-gauge-ring" style="--ring:#fbbf24"></div>
            <div class="sim-sol-gauge-body">
              <span class="sim-sol-gauge-lbl">MOLES NaCl</span>
              <span class="sim-sol-gauge-val sim-sol-moles" style="color:#fbbf24">0.00</span>
              <span class="sim-sol-gauge-unit">mol</span>
            </div>
          </div>
          <div class="sim-sol-estado-badge">NO SATURADA</div>
          <div class="sim-sol-actions">
            <button class="sim-sol-action btn-nacl-a">＋ NaCl</button>
            <button class="sim-sol-action btn-agua-a">💧 Agua ×2</button>
            <button class="sim-sol-action btn-cal-a">🔥 +20°C</button>
            <button class="sim-sol-action btn-rst-a">↺ Reset</button>
          </div>
        </div>
      </div>
      <div class="sim-sol-footer">
        <span class="sim-sol-ion-tag" style="--c:#c084fc">● Na⁺ sodio</span>
        <span class="sim-sol-ion-tag" style="--c:#34d399">● Cl⁻ cloro</span>
        <span class="sim-sol-ion-tag" style="--c:#93c5fd">● H₂O agua</span>
        <span style="color:#334155;margin-left:auto;font-size:10px;font-family:monospace">Sat≈6 mol/L@25°C</span>
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

  let moles = 0, litros = 1, tempC = 25;
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
        trail: [],
      });
    }
  }

  function addCristal() {
    cristales.push({ x: 195 + Math.random()*65, y: 28, life: 1.0 });
  }

  // ── DRAW ──────────────────────────────────────────────────────────────────
  function drawBg() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#04101f');
    g.addColorStop(0.45, '#072438');
    g.addColorStop(1, '#0b2e4a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Shimmer band (lab window light)
    const t = Date.now() * 0.0004;
    const shimmer = 0.05 + Math.sin(t) * 0.025;
    const sg = ctx.createLinearGradient(0, 0, 0, 70);
    sg.addColorStop(0, `rgba(100,210,255,${shimmer})`);
    sg.addColorStop(1, 'transparent');
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, W, 70);

    // Hexagonal grid overlay (subtle)
    ctx.strokeStyle = 'rgba(0,180,255,0.04)';
    ctx.lineWidth = 0.6;
    const R = 28;
    for (let row = -1; row < H / (R*1.5) + 1; row++) {
      for (let col = -1; col < W / (R*1.73) + 1; col++) {
        const cx = col * R * 1.73 + (row % 2 === 0 ? 0 : R * 0.865);
        const cy = row * R * 1.5;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * Math.PI * 2;
          const px = cx + Math.cos(a) * R * 0.72;
          const py = cy + Math.sin(a) * R * 0.72;
          k === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
  }

  function drawBeakerFill() {
    const bx = 96, bw = 268;
    const waterY = getWaterY();
    const waterH = 268 - waterY;
    if (waterH <= 0) return;

    const conc = getConc();
    const sat  = getSat();
    const pct  = Math.min(1, conc / sat);
    const r = Math.round(0 + pct * 40);
    const g2 = Math.round(140 + pct * -60);
    const b  = Math.round(220 - pct * 30);

    const wg = ctx.createLinearGradient(bx, waterY, bx, 268);
    wg.addColorStop(0, `rgba(${r},${g2+20},${b},0.45)`);
    wg.addColorStop(1, `rgba(${r+15},${g2},${b-10},0.72)`);

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
      ctx.lineTo(x, waterY + Math.sin((x-bx)*0.045 + t)*2.8 + Math.sin((x-bx)*0.02 - t*0.6)*1.4);
    }
    ctx.lineTo(bx+bw, waterY);
    ctx.strokeStyle = `rgba(100,230,255,0.45)`;
    ctx.lineWidth = 1.8; ctx.stroke();

    // Subsurface caustic shimmer
    ctx.globalAlpha = 0.07;
    for (let i = 0; i < 10; i++) {
      const wx = bx + 20 + i*24, wy = waterY + 22 + (i%4)*48;
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath(); ctx.arc(wx, wy, 4, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(wx+9, wy-5, 3, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(wx+9, wy+5, 3, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawCristales() {
    cristales = cristales.filter(c => c.life > 0);
    cristales.forEach(c => {
      c.y += 0.6; c.life -= 0.009;
      const s = 13 * c.life;
      ctx.globalAlpha = c.life * 0.9;
      ctx.save(); ctx.translate(c.x, c.y);
      const step = s * 0.5;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const col = (dx + dy) % 2 === 0 ? '#a855f7' : '#34d399';
          ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 6;
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

      const col = ion.tipo === 'na' ? '#c084fc' : '#34d399';
      const label = ion.tipo === 'na' ? 'Na⁺' : 'Cl⁻';

      // Outer nebula glow
      const grd = ctx.createRadialGradient(ion.x, ion.y, 0, ion.x, ion.y, ion.r*3.2);
      grd.addColorStop(0, col+'55'); grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(ion.x, ion.y, ion.r*3.2, 0, Math.PI*2); ctx.fill();

      // 3D sphere
      const sg = ctx.createRadialGradient(ion.x-ion.r*0.32, ion.y-ion.r*0.32, 0, ion.x, ion.y, ion.r);
      sg.addColorStop(0, col+'ff'); sg.addColorStop(0.55, col+'dd'); sg.addColorStop(1, col+'44');
      ctx.fillStyle = sg;
      ctx.shadowColor = col; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(ion.x, ion.y, ion.r, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;

      // Specular
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath(); ctx.arc(ion.x-ion.r*0.3, ion.y-ion.r*0.3, ion.r*0.3, 0, Math.PI*2); ctx.fill();

      ctx.fillStyle = '#fff'; ctx.font = `bold ${ion.r<8?7:8}px monospace`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(label, ion.x, ion.y + ion.r + 9);
      ctx.textBaseline = 'alphabetic';
    });
  }

  function drawGlass() {
    const bx=95, by=30, bw=270, bh=238;
    // Outer glow
    ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 18;
    ctx.strokeStyle = 'rgba(100,230,255,0.55)'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx+15,by); ctx.lineTo(bx+bw-15,by);
    ctx.lineTo(bx+bw,by+bh); ctx.lineTo(bx,by+bh);
    ctx.moveTo(bx+15,by); ctx.lineTo(bx,by+bh);
    ctx.moveTo(bx+bw-15,by); ctx.lineTo(bx+bw,by+bh);
    ctx.stroke();
    ctx.shadowBlur = 0;
    // Spout
    ctx.beginPath(); ctx.moveTo(bx+bw-15,by); ctx.lineTo(bx+bw+10,by-18);
    ctx.strokeStyle='rgba(100,230,255,0.3)'; ctx.lineWidth=1.8; ctx.stroke();
    // Graduations
    for (let i=1; i<=4; i++) {
      const y = by+bh-i*50;
      ctx.beginPath(); ctx.moveTo(bx-12,y); ctx.lineTo(bx+5,y);
      ctx.strokeStyle='rgba(34,211,238,0.5)'; ctx.lineWidth=1; ctx.stroke();
      ctx.fillStyle='rgba(34,211,238,0.6)'; ctx.font='9px monospace'; ctx.textAlign='right';
      ctx.fillText(i*0.25+'L', bx-14, y+3);
    }
    // Formula
    ctx.fillStyle='rgba(34,211,238,0.45)'; ctx.font='bold 12px monospace'; ctx.textAlign='center';
    ctx.fillText('NaCl → Na⁺ + Cl⁻', W/2, H-6);
  }

  function updateUI() {
    const c = getConc(), s = getSat();
    elConc.textContent  = c.toFixed(2);
    elVol.textContent   = litros.toFixed(2);
    elMoles.textContent = moles.toFixed(1);
    elTempV.textContent = Math.round(tempC);
    const pct = Math.min(100, (c/s)*100);
    const barCol = pct < 60 ? '#a855f7' : pct < 85 ? '#f59e0b' : '#ef4444';
    elBarC.style.width = pct + '%';
    elBarC.style.background = barCol;
    elConc.style.color = barCol;
    if (c < s*0.85) {
      elEst.style.cssText='background:#065f4615;border:1px solid #34d39944;color:#6ee7b7;font-size:11px;font-weight:bold;font-family:monospace;padding:5px 10px;border-radius:20px;text-align:center;letter-spacing:1px;';
      elEst.textContent='● NO SATURADA';
    } else if (c < s) {
      elEst.style.cssText='background:#78350f15;border:1px solid #f59e0b44;color:#fcd34d;font-size:11px;font-weight:bold;font-family:monospace;padding:5px 10px;border-radius:20px;text-align:center;letter-spacing:1px;';
      elEst.textContent='◐ CASI SATURADA';
    } else {
      elEst.style.cssText='background:#7f1d1d15;border:1px solid #ef444444;color:#fca5a5;font-size:11px;font-weight:bold;font-family:monospace;padding:5px 10px;border-radius:20px;text-align:center;letter-spacing:1px;';
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

  loop();
  return () => { cancelAnimationFrame(rafId); container.innerHTML=''; };
}
