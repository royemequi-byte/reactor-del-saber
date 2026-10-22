// sim-estados-materia.js — Simulador Física Grado 8
// Retorna función cleanup() que detiene la animación y libera listeners

export function iniciarSimEstadosMateria(container) {
  container.innerHTML = `
    <div class="sim-wrap">
      <div class="sim-head">
        <span class="sim-titulo-txt">🔬 Simulador — Estados de la Materia</span>
        <span class="sim-instruccion">Mueve el slider de temperatura</span>
      </div>
      <canvas class="sim-canvas" id="sim-em-canvas"></canvas>
      <div class="sim-controles-row">
        <span class="sim-lbl">🧊</span>
        <input type="range" class="sim-slider" id="sim-em-slider" min="0" max="100" value="20">
        <span class="sim-lbl">🔥</span>
        <div class="sim-badge" id="sim-em-badge">SÓLIDO</div>
      </div>
    </div>`;

  const canvas = container.querySelector('#sim-em-canvas');
  const slider = container.querySelector('#sim-em-slider');
  const badge  = container.querySelector('#sim-em-badge');
  const ctx    = canvas.getContext('2d');

  const W = 520, H = 190;
  canvas.width  = W;
  canvas.height = H;

  const N = 48, cols = 8, rows = 6;
  const gx = W / (cols + 1), gy = H / (rows + 1);

  const basePos = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      basePos.push({ x: gx * (c + 1), y: gy * (r + 1) });

  const parts = basePos.map(b => ({
    x: b.x, y: b.y,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6,
  }));

  function getEstado(t) {
    if (t < 35) return 'solido';
    if (t < 68) return 'liquido';
    return 'gaseoso';
  }

  function getColor(t) {
    const r = Math.min(255, Math.round(t * 2.2));
    const g = Math.round(80 + t * 0.8);
    const b = Math.max(30, Math.round(255 - t * 2));
    return `rgb(${r},${g},${b})`;
  }

  let rafId = null;

  function loop() {
    const t      = parseInt(slider.value);
    const estado = getEstado(t);
    const speed  = estado === 'solido' ? 0.4 : estado === 'liquido' ? 1.8 : 5.5;
    const vib    = t * 0.04;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#05050e';
    ctx.fillRect(0, 0, W, H);

    if (estado === 'solido') {
      ctx.strokeStyle = `rgba(100,181,246,${0.10 + (35 - t) * 0.005})`;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = parts[i].x - parts[j].x;
          const dy = parts[i].y - parts[j].y;
          if (dx*dx + dy*dy < 75*75) {
            ctx.beginPath();
            ctx.moveTo(parts[i].x, parts[i].y);
            ctx.lineTo(parts[j].x, parts[j].y);
            ctx.stroke();
          }
        }
      }
    }

    const col = getColor(t);
    for (let i = 0; i < N; i++) {
      const p = parts[i];
      if (estado === 'solido') {
        p.x = basePos[i].x + (Math.random() - 0.5) * vib * 2;
        p.y = basePos[i].y + (Math.random() - 0.5) * vib * 2;
      } else {
        p.x += p.vx * speed;
        p.y += p.vy * speed;
        if (p.x < 6 || p.x > W - 6) p.vx *= -1;
        if (p.y < 6 || p.y > H - 6) p.vy *= -1;
        const v = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
        if (v > 0) { p.vx /= v; p.vy /= v; }
      }

      const r = estado === 'solido' ? 5.5 : estado === 'liquido' ? 5 : 4;
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 2.5);
      grd.addColorStop(0, col.replace('rgb','rgba').replace(')',',0.35)'));
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(p.x, p.y, r * 2.5, 0, Math.PI*2); ctx.fill();

      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI*2);
      ctx.fillStyle = col; ctx.fill();
    }

    const labels = { solido: 'SÓLIDO', liquido: 'LÍQUIDO', gaseoso: 'GASEOSO' };
    const cls    = { solido: 'badge-solido', liquido: 'badge-liquido', gaseoso: 'badge-gaseoso' };
    badge.textContent = labels[estado];
    badge.className   = 'sim-badge ' + cls[estado];

    rafId = requestAnimationFrame(loop);
  }

  loop();

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  };
}
