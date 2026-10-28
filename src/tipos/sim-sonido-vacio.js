// sim-sonido-vacio.js — Simulador Física Grado 10: el sonido necesita un medio material
export function iniciarSimSonidoVacio(container) {
  container.innerHTML = `
    <div class="sim-wrap sim-sonido">
      <div class="sim-head">
        <span class="sim-titulo-txt">🔔 Simulador — Sonido y Vacío</span>
        <span class="sim-instruccion">El sonido es una onda mecánica</span>
      </div>
      <canvas class="sim-canvas sim-sonido-cv" id="sim-sn-canvas"></canvas>
      <div class="sim-sonido-lectura" id="sim-sn-lectura">Selecciona un medio y emite sonido</div>
      <div class="sim-nuclear-controles">
        <div class="sim-sonido-medios">
          <button class="sim-sonido-medio activa" data-medio="aire">💨 Aire</button>
          <button class="sim-sonido-medio" data-medio="agua">💧 Agua</button>
          <button class="sim-sonido-medio" data-medio="vacio">🌌 Vacío</button>
        </div>
        <div class="sim-nuclear-btns">
          <button class="sim-nuclear-btn sim-nuclear-btn-go" id="sim-sn-emitir">🔊 Emitir sonido</button>
        </div>
      </div>
    </div>`;

  const canvas = container.querySelector('#sim-sn-canvas');
  const ctx = canvas.getContext('2d');
  const CW = 440, CH = 200;
  canvas.width = CW; canvas.height = CH;
  const lectura = container.querySelector('#sim-sn-lectura');
  const botones = container.querySelectorAll('.sim-sonido-medio');

  const MEDIOS = {
    aire:  { v: 343,  color: '#4fc3f7', label: 'Aire (343 m/s)' },
    agua:  { v: 1480, color: '#0ea5e9', label: 'Agua (1480 m/s)' },
    vacio: { v: 0,     color: '#555577', label: 'Vacío — no se propaga' },
  };

  let medio = 'aire';
  let ondas = []; // {r, vida}

  botones.forEach(b => b.addEventListener('click', () => {
    medio = b.dataset.medio;
    botones.forEach(x => x.classList.toggle('activa', x === b));
  }));

  container.querySelector('#sim-sn-emitir').addEventListener('click', () => {
    if (medio === 'vacio') {
      lectura.textContent = '🔇 Silencio total — no hay partículas que transmitan la vibración.';
      return;
    }
    ondas.push({ r: 8, vida: 1 });
    lectura.textContent = `🔊 Propagándose en ${MEDIOS[medio].label}`;
  });

  function loop() {
    ctx.clearRect(0, 0, CW, CH);
    ctx.fillStyle = '#05050e'; ctx.fillRect(0, 0, CW, CH);

    const cx = CW / 2, cy = CH / 2;
    const velFactor = medio === 'vacio' ? 0 : (medio === 'agua' ? 3.2 : 1.6);

    ondas = ondas.filter(o => o.vida > 0);
    ondas.forEach(o => {
      o.r += velFactor;
      o.vida -= 0.012;
      ctx.globalAlpha = Math.max(0, o.vida);
      ctx.strokeStyle = MEDIOS[medio].color; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(cx, cy, o.r, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Fuente de sonido
    ctx.shadowColor = MEDIOS[medio].color; ctx.shadowBlur = 14;
    ctx.font = '28px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🔔', cx, cy);
    ctx.shadowBlur = 0; ctx.textBaseline = 'alphabetic';

    if (medio === 'vacio') {
      ctx.fillStyle = '#555577'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText('· · · (sin partículas, sin propagación) · · ·', cx, cy + 50);
    }

    rafId = requestAnimationFrame(loop);
  }

  let rafId = requestAnimationFrame(loop);
  return () => { if (rafId) cancelAnimationFrame(rafId); };
}
