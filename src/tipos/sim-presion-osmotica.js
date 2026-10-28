// sim-presion-osmotica.js — Simulador Química Grado 10: presión osmótica (vista física + biológica)
// Retorna función cleanup() que detiene la animación y libera listeners

export function iniciarSimPresionOsmotica(container) {
  container.innerHTML = `
    <div class="sim-wrap sim-osmosis">
      <div class="sim-head sim-head-claro">
        <span class="sim-titulo-txt sim-titulo-claro">🧪 Simulador — Presión Osmótica · π = iMRT</span>
        <span class="sim-instruccion sim-instruccion-claro">Ajusta concentración, temperatura y presión externa</span>
      </div>
      <canvas class="sim-osmosis-cv" id="sim-os-canvas"></canvas>
      <div class="sim-osmosis-lecturas">
        <div class="sim-osmosis-lectura">
          <span class="lec-lbl-claro">π OSMÓTICA</span>
          <span class="lec-val-claro" id="sim-os-pi">0.0</span>
          <span class="lec-unit-claro">atm</span>
        </div>
        <span class="sim-osmosis-badge" id="sim-os-badge-tubo">EQUILIBRIO</span>
        <span class="sim-osmosis-badge" id="sim-os-badge-celula">ESTABLE</span>
      </div>
      <div class="sim-osmosis-controles">
        <div class="sim-ctrl-group">
          <label class="sim-ctrl-lbl-claro">🧂 Concentración <span class="sim-ctrl-val-claro" id="sim-os-mval">0.30 M</span></label>
          <input type="range" class="sim-slider slider-os" id="sim-os-sM" min="2" max="120" value="30">
        </div>
        <div class="sim-ctrl-group">
          <label class="sim-ctrl-lbl-claro">🌡️ Temperatura <span class="sim-ctrl-val-claro" id="sim-os-tval">300 K</span></label>
          <input type="range" class="sim-slider slider-os" id="sim-os-sT" min="250" max="350" value="300">
        </div>
        <div class="sim-ctrl-group">
          <label class="sim-ctrl-lbl-claro">⬇️ Presión externa <span class="sim-ctrl-val-claro" id="sim-os-pval">0 atm</span></label>
          <input type="range" class="sim-slider slider-os" id="sim-os-sP" min="0" max="30" value="0">
        </div>
      </div>
    </div>`;

  const canvas = container.querySelector('#sim-os-canvas');
  const ctx    = canvas.getContext('2d');
  const W = 460, H = 230;
  canvas.width = W; canvas.height = H;

  const sM = container.querySelector('#sim-os-sM');
  const sT = container.querySelector('#sim-os-sT');
  const sP = container.querySelector('#sim-os-sP');
  const mVal = container.querySelector('#sim-os-mval');
  const tVal = container.querySelector('#sim-os-tval');
  const pVal = container.querySelector('#sim-os-pval');
  const elPi = container.querySelector('#sim-os-pi');
  const elBadgeTubo   = container.querySelector('#sim-os-badge-tubo');
  const elBadgeCelula = container.querySelector('#sim-os-badge-celula');

  const I_VANT_HOFF = 2, R_GAS = 0.082;
  const M_ISOTONICA = 0.30;

  let M = 0.30, T = 300, Pext = 0;
  let hActual = 0;      // px, se anima con lerp hacia el objetivo
  let radioActual = 42; // px del radio de la célula, se anima con lerp
  let lisisPrev = false;
  let burbujasLisis = [];
  const solutoPts = Array.from({ length: 40 }, () => ({
    x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
  }));

  function calcPi() { return I_VANT_HOFF * M * R_GAS * T; }

  function onM() { M = parseInt(sM.value) / 100; mVal.textContent = M.toFixed(2) + ' M'; }
  function onT() { T = parseInt(sT.value); tVal.textContent = T + ' K'; }
  function onP() { Pext = parseInt(sP.value); pVal.textContent = Pext + ' atm'; }
  sM.addEventListener('input', onM);
  sT.addEventListener('input', onT);
  sP.addEventListener('input', onP);

  // ── VISTA FÍSICA: TUBO EN U ──────────────────────────────────────────────
  const TUBO_IZQ_X = 55, TUBO_DER_X = 165, TUBO_ANCHO = 34;
  const TUBO_TOP = 18, TUBO_BASE_Y = 165, BASELINE = 110;

  function dibujarTuboU() {
    ctx.save();
    ctx.fillStyle = '#334155'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
    ctx.fillText('VISTA FÍSICA — TUBO EN U', 112, 12);

    const pi = calcPi();
    const neto = pi - Pext;
    const objetivoH = Math.max(-60, Math.min(60, neto * 2.6));
    hActual += (objetivoH - hActual) * 0.05;

    const yIzq = BASELINE + hActual * 0.12;
    const yDer = BASELINE - hActual;

    // Tubos (contorno)
    ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(TUBO_IZQ_X, TUBO_TOP); ctx.lineTo(TUBO_IZQ_X, TUBO_BASE_Y);
    ctx.lineTo(TUBO_DER_X, TUBO_BASE_Y); ctx.lineTo(TUBO_DER_X, TUBO_TOP);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(TUBO_IZQ_X + TUBO_ANCHO, TUBO_TOP); ctx.lineTo(TUBO_IZQ_X + TUBO_ANCHO, TUBO_BASE_Y - 14);
    ctx.lineTo(TUBO_DER_X + TUBO_ANCHO, TUBO_BASE_Y - 14); ctx.lineTo(TUBO_DER_X + TUBO_ANCHO, TUBO_TOP);
    ctx.stroke();

    // Membrana semipermeable (centro de la base)
    const memX = (TUBO_IZQ_X + TUBO_ANCHO + TUBO_DER_X) / 2;
    ctx.strokeStyle = '#0ea5e9'; ctx.lineWidth = 3; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(memX, TUBO_BASE_Y - 14); ctx.lineTo(memX, TUBO_BASE_Y); ctx.stroke();
    ctx.setLineDash([]);

    // Líquido lado izquierdo (agua pura)
    ctx.fillStyle = 'rgba(14,165,233,0.28)';
    ctx.fillRect(TUBO_IZQ_X + 1, yIzq, TUBO_ANCHO - 2, TUBO_BASE_Y - yIzq);
    // Líquido lado derecho (solución, se tiñe más oscuro con M)
    const tono = Math.min(1, M / 1.0);
    ctx.fillStyle = `rgba(${Math.round(14 + tono * 30)},${Math.round(120 - tono * 40)},${Math.round(190 - tono * 30)},0.4)`;
    ctx.fillRect(TUBO_DER_X + 1, yDer, TUBO_ANCHO - 2, TUBO_BASE_Y - yDer);
    // Líquido en la base conectora
    ctx.fillStyle = 'rgba(14,165,233,0.22)';
    ctx.fillRect(TUBO_IZQ_X + 1, TUBO_BASE_Y - 13, TUBO_DER_X + TUBO_ANCHO - TUBO_IZQ_X - 2, 12);

    // Partículas de soluto (confinadas al lado derecho)
    solutoPts.slice(0, Math.round(M * 36) + 2).forEach(p => {
      p.x += p.vx * 0.01; p.y += p.vy * 0.01;
      if (p.x < 0 || p.x > 1) p.vx *= -1;
      if (p.y < 0 || p.y > 1) p.vy *= -1;
      p.x = Math.max(0, Math.min(1, p.x)); p.y = Math.max(0, Math.min(1, p.y));
      const px = TUBO_DER_X + 5 + p.x * (TUBO_ANCHO - 10);
      const py = Math.max(yDer + 4, TUBO_BASE_Y - 10) - p.y * Math.max(4, (TUBO_BASE_Y - 10 - yDer));
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(px, py, 2.4, 0, Math.PI * 2); ctx.fill();
    });

    // Flecha de flujo neto en la membrana
    const t = Date.now() * 0.004;
    const dir = neto >= 0 ? 1 : -1;
    ctx.fillStyle = neto >= 0 ? '#0284c7' : '#dc2626';
    for (let i = 0; i < 3; i++) {
      const off = ((t + i * 0.33) % 1);
      const ay = TUBO_BASE_Y - 3 - off * 10;
      ctx.beginPath();
      ctx.moveTo(memX, ay - dir * 4);
      ctx.lineTo(memX - 3, ay + dir * 2);
      ctx.lineTo(memX + 3, ay + dir * 2);
      ctx.closePath(); ctx.fill();
    }

    // Marca de altura h
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(TUBO_DER_X + TUBO_ANCHO + 6, BASELINE); ctx.lineTo(TUBO_DER_X + TUBO_ANCHO + 6, yDer); ctx.stroke();
    ctx.fillStyle = '#475569'; ctx.font = '8px monospace'; ctx.textAlign = 'left';
    ctx.fillText('h', TUBO_DER_X + TUBO_ANCHO + 10, (BASELINE + yDer) / 2 + 3);

    ctx.fillStyle = '#64748b'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
    ctx.fillText('agua pura', TUBO_IZQ_X + TUBO_ANCHO / 2, TUBO_BASE_Y + 12);
    ctx.fillText('solución', TUBO_DER_X + TUBO_ANCHO / 2, TUBO_BASE_Y + 12);
    ctx.restore();

    if (neto > 2)      elBadgeTubo.textContent = '◉ ÓSMOSIS NORMAL';
    else if (neto < -2) elBadgeTubo.textContent = '◀ ÓSMOSIS INVERSA';
    else                elBadgeTubo.textContent = '● EQUILIBRIO';
  }

  // ── VISTA BIOLÓGICA: CÉLULA AL MICROSCOPIO ──────────────────────────────
  const MIC_CX = 345, MIC_CY = 95, MIC_R = 95;

  function radioObjetivo() {
    if (M >= 0.35) return Math.max(16, 42 - (M - 0.35) * 55);
    if (M <= 0.25) return Math.min(78, 42 + (0.25 - M) * 140);
    return 42;
  }

  function dibujarMicroscopio() {
    ctx.save();
    // Viñeta circular (campo visual del microscopio)
    ctx.beginPath(); ctx.arc(MIC_CX, MIC_CY, MIC_R, 0, Math.PI * 2); ctx.clip();

    const g = ctx.createRadialGradient(MIC_CX, MIC_CY, 10, MIC_CX, MIC_CY, MIC_R);
    g.addColorStop(0, '#0f3a3a');
    g.addColorStop(0.75, '#082427');
    g.addColorStop(1, '#010a0c');
    ctx.fillStyle = g;
    ctx.fillRect(MIC_CX - MIC_R, MIC_CY - MIC_R, MIC_R * 2, MIC_R * 2);

    const lisis = M < 0.08;
    const objetivo = lisis ? radioObjetivo() * 1.6 : radioObjetivo();
    radioActual += (objetivo - radioActual) * 0.06;

    if (lisis && !lisisPrev) {
      for (let i = 0; i < 24; i++) {
        const ang = Math.random() * Math.PI * 2;
        burbujasLisis.push({ x: MIC_CX, y: MIC_CY, vx: Math.cos(ang) * (1 + Math.random() * 2), vy: Math.sin(ang) * (1 + Math.random() * 2), vida: 1 });
      }
    }
    lisisPrev = lisis;

    if (lisis) {
      burbujasLisis = burbujasLisis.filter(b => b.vida > 0);
      burbujasLisis.forEach(b => {
        b.x += b.vx; b.y += b.vy; b.vida -= 0.012;
        ctx.globalAlpha = Math.max(0, b.vida);
        ctx.fillStyle = '#5eead4';
        ctx.beginPath(); ctx.arc(b.x, b.y, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      });
    } else {
      // Membrana + citoplasma de la célula
      const crenada = M >= 0.55;
      ctx.beginPath();
      const puntos = 24;
      for (let i = 0; i <= puntos; i++) {
        const ang = (i / puntos) * Math.PI * 2;
        const jitter = crenada ? Math.sin(ang * 7 + Date.now() * 0.003) * 4 : 0;
        const rx = MIC_CX + Math.cos(ang) * (radioActual + jitter);
        const ry = MIC_CY + Math.sin(ang) * (radioActual + jitter);
        if (i === 0) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry);
      }
      ctx.closePath();
      const cg = ctx.createRadialGradient(MIC_CX - 10, MIC_CY - 10, 4, MIC_CX, MIC_CY, radioActual);
      cg.addColorStop(0, '#5eead4cc');
      cg.addColorStop(1, '#0d948866');
      ctx.fillStyle = cg;
      ctx.fill();
      ctx.strokeStyle = '#99f6e4'; ctx.lineWidth = 1.5; ctx.stroke();
    }

    // Puntitos de agua ambiente en el campo visual
    ctx.fillStyle = '#5eead433';
    for (let i = 0; i < 14; i++) {
      const ang = (i / 14) * Math.PI * 2 + Date.now() * 0.0003;
      const rr = MIC_R - 14;
      ctx.beginPath();
      ctx.arc(MIC_CX + Math.cos(ang) * rr, MIC_CY + Math.sin(ang) * rr, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Aro del ocular
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(MIC_CX, MIC_CY, MIC_R, 0, Math.PI * 2); ctx.stroke();

    ctx.fillStyle = '#334155'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
    ctx.fillText('VISTA BIOLÓGICA — CÉLULA', MIC_CX, 12);

    if (lisis)            elBadgeCelula.textContent = '💥 LISIS CELULAR';
    else if (M >= 0.55)   elBadgeCelula.textContent = '◀ CRENACIÓN';
    else if (M <= 0.25)   elBadgeCelula.textContent = '▶ TÚRGIDA';
    else                  elBadgeCelula.textContent = '● ESTABLE (ISOTÓNICA)';
  }

  let rafId = null;
  function loop() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(228, 10); ctx.lineTo(228, H - 10); ctx.stroke();

    dibujarTuboU();
    dibujarMicroscopio();

    elPi.textContent = calcPi().toFixed(1);

    rafId = requestAnimationFrame(loop);
  }

  loop();

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    sM.removeEventListener('input', onM);
    sT.removeEventListener('input', onT);
    sP.removeEventListener('input', onP);
    rafId = null;
  };
}
