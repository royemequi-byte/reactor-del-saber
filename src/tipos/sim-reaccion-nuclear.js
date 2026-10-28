// sim-reaccion-nuclear.js — Simulador Física Grado 10: fisión en cadena y producción de energía
// Retorna función cleanup() que detiene la animación y libera listeners

export function iniciarSimReaccionNuclear(container) {
  container.innerHTML = `
    <div class="sim-wrap sim-nuclear">
      <div class="sim-head">
        <span class="sim-titulo-txt">☢️ Simulador — Reactor Nuclear · Fisión en Cadena</span>
        <span class="sim-instruccion">Ajusta las barras e inicia la reacción</span>
      </div>
      <div class="sim-nuclear-body">
        <canvas class="sim-nuclear-cv" id="sim-nu-canvas"></canvas>
        <div class="sim-nuclear-panel">
          <div class="sim-nuclear-gauge">
            <svg viewBox="0 0 120 68" class="sim-nuclear-gauge-svg">
              <path d="M10,62 A50,50 0 0 1 110,62" fill="none" stroke="#1a2440" stroke-width="10"/>
              <path d="M10,62 A50,50 0 0 1 110,62" fill="none" stroke="url(#nuGrad)" stroke-width="10" id="sim-nu-arco"/>
              <defs>
                <linearGradient id="nuGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stop-color="#4fc3f7"/>
                  <stop offset="55%" stop-color="#ffd600"/>
                  <stop offset="100%" stop-color="#ff3b3b"/>
                </linearGradient>
              </defs>
              <line x1="60" y1="62" x2="60" y2="18" stroke="#eaf6ff" stroke-width="2.5" id="sim-nu-aguja" style="transform-origin:60px 62px"/>
              <circle cx="60" cy="62" r="4" fill="#eaf6ff"/>
            </svg>
            <span class="sim-nuclear-mw"><span id="sim-nu-mwval">0</span> MW</span>
          </div>
          <div class="sim-nuclear-k">Factor k ≈ <strong id="sim-nu-k">0.0</strong></div>
          <div class="sim-nuclear-badge" id="sim-nu-badge">INACTIVA</div>
          <div class="sim-nuclear-turbina-wrap">
            <svg viewBox="0 0 60 60" class="sim-nuclear-turbina" id="sim-nu-turbina">
              <circle cx="30" cy="30" r="26" fill="none" stroke="#2a3a55" stroke-width="2"/>
              <g id="sim-nu-aspas">
                <path d="M30,30 L30,8 A22,22 0 0 1 49,20 Z" fill="#4fc3f766"/>
                <path d="M30,30 L49,20 A22,22 0 0 1 49,40 Z" fill="#4fc3f744"/>
                <path d="M30,30 L49,40 A22,22 0 0 1 30,52 Z" fill="#4fc3f766"/>
                <path d="M30,30 L30,52 A22,22 0 0 1 11,40 Z" fill="#4fc3f744"/>
                <path d="M30,30 L11,40 A22,22 0 0 1 11,20 Z" fill="#4fc3f766"/>
                <path d="M30,30 L11,20 A22,22 0 0 1 30,8 Z" fill="#4fc3f744"/>
              </g>
              <circle cx="30" cy="30" r="5" fill="#eaf6ff"/>
            </svg>
            <span class="sim-nuclear-turbina-lbl">TURBINA</span>
          </div>
        </div>
      </div>
      <div class="sim-nuclear-controles">
        <div class="sim-ctrl-group">
          <label class="sim-ctrl-lbl">🔧 Barras de control <span class="sim-ctrl-val" id="sim-nu-bval">50%</span></label>
          <input type="range" class="sim-slider slider-nu" id="sim-nu-sB" min="0" max="100" value="50">
        </div>
        <div class="sim-nuclear-btns">
          <button class="sim-nuclear-btn sim-nuclear-btn-go" id="sim-nu-iniciar">⚡ Iniciar reacción</button>
          <button class="sim-nuclear-btn sim-nuclear-btn-rst" id="sim-nu-reiniciar">↺ Reiniciar</button>
        </div>
      </div>
    </div>`;

  const canvas   = container.querySelector('#sim-nu-canvas');
  const sB       = container.querySelector('#sim-nu-sB');
  const bVal     = container.querySelector('#sim-nu-bval');
  const elMw     = container.querySelector('#sim-nu-mwval');
  const elK      = container.querySelector('#sim-nu-k');
  const elBadge  = container.querySelector('#sim-nu-badge');
  const elAguja  = container.querySelector('#sim-nu-aguja');
  const elAspas  = container.querySelector('#sim-nu-aspas');
  const btnIniciar   = container.querySelector('#sim-nu-iniciar');
  const btnReiniciar = container.querySelector('#sim-nu-reiniciar');
  const ctx = canvas.getContext('2d');

  const CW = 320, CH = 240;
  canvas.width = CW; canvas.height = CH;
  const CX = CW / 2, CY = CH / 2, RADIO = 100;

  let barras = 50; // % de inserción de las barras de control
  let nucleos = [];
  let neutrones = [];
  let fisiones = [];
  let fragmentos = [];
  let activa = false;
  let meltdown = false;
  let potenciaSuave = 0;
  let fisionesRecientes = 0;
  let turbinaAngulo = 0;

  function poblarNucleos() {
    nucleos = [];
    const paso = 15;
    for (let qy = -RADIO; qy <= RADIO; qy += paso) {
      for (let qx = -RADIO; qx <= RADIO; qx += paso) {
        const offset = (Math.round(qy / paso) % 2 === 0) ? 0 : paso / 2;
        const x = qx + offset, y = qy * 0.87;
        if (Math.hypot(x, y) < RADIO - 8) {
          nucleos.push({ x: CX + x, y: CY + y, vivo: true, flash: 0 });
        }
      }
    }
  }

  function continuanPromedio() {
    // 3 neutrones liberados por fisión; las barras absorben una fracción de ellos.
    return Math.max(0, 3 * (1 - barras / 100));
  }

  function kEfectivo() { return continuanPromedio(); }

  function dispararNeutron(x, y) {
    const ang = Math.random() * Math.PI * 2;
    neutrones.push({ x, y, vx: Math.cos(ang) * 2.4, vy: Math.sin(ang) * 2.4, vida: 400 });
  }

  function fisionar(nucleo) {
    nucleo.vivo = false;
    nucleo.flash = 1;
    fisiones.push({ x: nucleo.x, y: nucleo.y, t: 0 });
    for (let i = 0; i < 2; i++) {
      const ang = Math.random() * Math.PI * 2;
      fragmentos.push({ x: nucleo.x, y: nucleo.y, vx: Math.cos(ang) * 1.1, vy: Math.sin(ang) * 1.1, vida: 1 });
    }
    const promedio = continuanPromedio();
    const base = Math.floor(promedio);
    const extra = (Math.random() < (promedio - base)) ? 1 : 0;
    const nNuevos = base + extra;
    for (let i = 0; i < nNuevos; i++) dispararNeutron(nucleo.x, nucleo.y);
    fisionesRecientes++;
  }

  function iniciarCadena() {
    if (!activa && !meltdown) {
      const vivos = nucleos.filter(n => n.vivo);
      if (vivos.length) {
        activa = true;
        const centro = vivos.reduce((m, n) => Math.hypot(n.x - CX, n.y - CY) < Math.hypot(m.x - CX, m.y - CY) ? n : m);
        fisionar(centro);
      }
    }
  }

  function reiniciar() {
    poblarNucleos();
    neutrones = []; fisiones = []; fragmentos = [];
    activa = false; meltdown = false; potenciaSuave = 0; fisionesRecientes = 0;
    btnIniciar.disabled = false;
  }

  function onB() { barras = parseInt(sB.value); bVal.textContent = barras + '%'; }
  sB.addEventListener('input', onB);
  btnIniciar.addEventListener('click', iniciarCadena);
  btnReiniciar.addEventListener('click', reiniciar);

  function actualizarUI() {
    const k = kEfectivo();
    elK.textContent = k.toFixed(1);

    let estado = 'INACTIVA', color = '#4fc3f7';
    if (meltdown)       { estado = '🔥 FUSIÓN DEL NÚCLEO'; color = '#ff3b3b'; }
    else if (!activa)   { estado = 'INACTIVA'; color = '#4fc3f7'; }
    else if (k < 0.92)  { estado = 'SUBCRÍTICA'; color = '#4fc3f7'; }
    else if (k <= 1.12) { estado = '✓ CRÍTICA'; color = '#39ff14'; }
    else                { estado = '⚠ SUPERCRÍTICA'; color = '#ff9800'; }

    elBadge.textContent = estado;
    elBadge.style.color = color;
    elBadge.style.borderColor = color;
    elBadge.classList.toggle('sim-nuclear-badge-alerta', meltdown || (activa && k > 1.12));

    // Potencia suavizada en MW (escala arbitraria 0-50) según ritmo de fisiones recientes
    const objetivo = Math.min(50, fisionesRecientes * 2.2);
    potenciaSuave += (objetivo - potenciaSuave) * 0.06;
    fisionesRecientes = Math.max(0, fisionesRecientes - 0.4);
    elMw.textContent = Math.round(potenciaSuave);

    const pct = Math.min(1, potenciaSuave / 50);
    elAguja.style.transform = `rotate(${pct * 180 - 90}deg)`;

    turbinaAngulo += potenciaSuave * 0.15;
    elAspas.style.transform = `rotate(${turbinaAngulo}deg)`;
    elAspas.style.transformOrigin = '30px 30px';

    if (!meltdown && potenciaSuave > 44 && activa) {
      meltdown = true;
      activa = false;
      btnIniciar.disabled = true;
    }
  }

  function dibujarVasija() {
    ctx.strokeStyle = meltdown ? '#ff3b3b88' : '#4fc3f755';
    ctx.lineWidth = 2;
    ctx.shadowColor = meltdown ? '#ff3b3b' : '#4fc3f7';
    ctx.shadowBlur = meltdown ? 18 : 8;
    ctx.beginPath();
    ctx.arc(CX, CY, RADIO, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    if (meltdown) {
      // Franjas de alerta diagonales
      ctx.save();
      ctx.beginPath(); ctx.arc(CX, CY, RADIO, 0, Math.PI * 2); ctx.clip();
      const t = Date.now() * 0.02;
      for (let i = -4; i < 10; i++) {
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255,59,59,0.22)' : 'rgba(255,214,0,0.18)';
        ctx.beginPath();
        ctx.moveTo(CX - RADIO + i * 22 + (t % 44), CY - RADIO);
        ctx.lineTo(CX - RADIO + i * 22 + 14 + (t % 44), CY - RADIO);
        ctx.lineTo(CX - RADIO + i * 22 - RADIO + (t % 44), CY + RADIO);
        ctx.lineTo(CX - RADIO + i * 22 - RADIO - 14 + (t % 44), CY + RADIO);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
  }

  function dibujarNucleos() {
    nucleos.forEach(n => {
      if (n.flash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${n.flash})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, 10 * n.flash + 2, 0, Math.PI * 2); ctx.fill();
        n.flash -= 0.06;
      }
      if (!n.vivo) return;
      ctx.shadowColor = '#4fc3f7'; ctx.shadowBlur = 6;
      const g = ctx.createRadialGradient(n.x - 1.5, n.y - 1.5, 0, n.x, n.y, 4.5);
      g.addColorStop(0, '#bfe9ff'); g.addColorStop(1, '#1565c0');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(n.x, n.y, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  function dibujarNeutrones() {
    neutrones = neutrones.filter(nt => nt.vida > 0);
    neutrones.forEach(nt => {
      nt.x += nt.vx; nt.y += nt.vy; nt.vida--;
      if (Math.hypot(nt.x - CX, nt.y - CY) > RADIO) { nt.vida = 0; return; }

      ctx.shadowColor = '#eafcff'; ctx.shadowBlur = 10;
      ctx.fillStyle = '#eafcff';
      ctx.beginPath(); ctx.arc(nt.x, nt.y, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      for (const n of nucleos) {
        if (n.vivo && Math.hypot(n.x - nt.x, n.y - nt.y) < 6.5) {
          nt.vida = 0;
          fisionar(n);
          break;
        }
      }
    });
  }

  function dibujarFragmentos() {
    fragmentos = fragmentos.filter(f => f.vida > 0);
    fragmentos.forEach(f => {
      f.x += f.vx; f.y += f.vy; f.vida -= 0.02;
      ctx.globalAlpha = Math.max(0, f.vida);
      ctx.fillStyle = '#ff9800';
      ctx.beginPath(); ctx.arc(f.x, f.y, 3, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  let rafId = null;
  function loop() {
    ctx.clearRect(0, 0, CW, CH);
    ctx.fillStyle = '#05050e';
    ctx.fillRect(0, 0, CW, CH);

    dibujarVasija();
    dibujarNucleos();
    dibujarFragmentos();
    dibujarNeutrones();
    actualizarUI();

    rafId = requestAnimationFrame(loop);
  }

  reiniciar();
  loop();

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    sB.removeEventListener('input', onB);
    rafId = null;
  };
}
