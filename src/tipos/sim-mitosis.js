// sim-mitosis.js — Simulador Biología Grado 8/9
export function iniciarSimMitosis(container) {
  container.innerHTML = `
    <div class="sim-wrap">
      <div class="sim-head">
        <span class="sim-titulo-txt">🔬 Simulador — Mitosis Celular</span>
        <span class="sim-instruccion">Selecciona una fase para estudiarla</span>
      </div>
      <canvas class="sim-canvas" id="sim-mit-canvas"></canvas>
      <div class="sim-mit-fases" id="sim-mit-fases"></div>
      <div class="sim-mit-info" id="sim-mit-info"></div>
      <div class="sim-controles-row">
        <span class="sim-lbl">⏩ Velocidad</span>
        <input type="range" class="sim-slider" id="sim-mit-vel" min="1" max="5" value="2">
        <span class="sim-lbl" id="sim-mit-velval">×2</span>
      </div>
    </div>`;

  const canvas = container.querySelector('#sim-mit-canvas');
  const velSlider = container.querySelector('#sim-mit-vel');
  const velVal    = container.querySelector('#sim-mit-velval');
  const ctx = canvas.getContext('2d');
  const W = 520, H = 230;
  canvas.width = W; canvas.height = H;

  const FASES = [
    { nombre:'INTERFASE', color:'#4fc3f7', desc:'La célula se prepara: duplica su ADN. Los cromosomas no son visibles, la membrana nuclear está intacta.' },
    { nombre:'PROFASE',   color:'#ab47bc', desc:'Los cromosomas se condensan y se hacen visibles. La membrana nuclear comienza a desintegrarse. Se forman los husos mitóticos.' },
    { nombre:'METAFASE',  color:'#26c6da', desc:'Los cromosomas se alinean en el ecuador de la célula (placa metafásica). Los husos se conectan a los centrómeros.' },
    { nombre:'ANAFASE',   color:'#ff7043', desc:'Las cromátidas hermanas se separan y migran hacia polos opuestos. La célula se alarga.' },
    { nombre:'TELOFASE',  color:'#66bb6a', desc:'Se forman dos núcleos nuevos. Los cromosomas se descondensan. La membrana nuclear reaparece. La célula se divide en dos.' },
  ];

  const CROMO_COLS = ['#e040fb','#40c4ff','#69f0ae','#ffab40','#ff5252','#fff176'];
  let faseActual = 0;
  let t = 0;
  let rafId = null;

  // Botones de fase
  const fasesEl = container.querySelector('#sim-mit-fases');
  FASES.forEach((f, i) => {
    const btn = document.createElement('button');
    btn.className = 'sim-mit-fase-btn' + (i === 0 ? ' activa' : '');
    btn.textContent = f.nombre;
    btn.style.setProperty('--fase-col', f.color);
    btn.addEventListener('click', () => setFase(i));
    fasesEl.appendChild(btn);
  });

  function setFase(i) {
    faseActual = i; t = 0;
    container.querySelectorAll('.sim-mit-fase-btn').forEach((b, j) => b.classList.toggle('activa', j === i));
    container.querySelector('#sim-mit-info').innerHTML =
      `<strong style="color:${FASES[i].color}">${FASES[i].nombre}</strong> — ${FASES[i].desc}`;
  }
  setFase(0);

  velSlider.addEventListener('input', () => { velVal.textContent = '×' + velSlider.value; });

  function lerp(a, b, p) { return a + (b - a) * p; }
  function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }

  function drawChromosome(x, y, angle, col, alpha) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(angle);
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.beginPath(); ctx.moveTo(0,-11); ctx.bezierCurveTo(6,-7,6,1,0,0); ctx.bezierCurveTo(-6,1,-6,-7,0,-11);
    ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 5; ctx.fill(); ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.moveTo(0,0); ctx.bezierCurveTo(6,1,6,11,0,11); ctx.bezierCurveTo(-6,11,-6,1,0,0);
    ctx.fillStyle = col + 'cc'; ctx.fill();
    ctx.beginPath(); ctx.arc(0,0,2.2,0,Math.PI*2); ctx.fillStyle='#fff'; ctx.fill();
    ctx.restore();
  }

  function loop() {
    const vel = parseInt(velSlider.value);
    t += 0.004 * vel;
    const prog = clamp((Math.sin(t)+1)/2, 0, 1);
    const fase = faseActual;
    const cx = W/2, cy = H/2;
    const N = 6;

    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#05050e'; ctx.fillRect(0,0,W,H);

    let rx = 95, ry = 85;
    if (fase === 3) { rx = lerp(95,72,prog); ry = lerp(85,110,prog); }
    if (fase === 4) { rx = lerp(72,95,prog); ry = lerp(110,85,prog); }

    const fc = FASES[fase].color;
    const cellG = ctx.createRadialGradient(cx,cy,0,cx,cy,rx);
    cellG.addColorStop(0, fc+'22'); cellG.addColorStop(0.7, fc+'0a'); cellG.addColorStop(1, fc+'44');
    ctx.beginPath(); ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);
    ctx.fillStyle = cellG; ctx.fill();
    ctx.strokeStyle = fc+'88'; ctx.lineWidth = 2;
    ctx.shadowColor = fc; ctx.shadowBlur = 14;
    ctx.stroke(); ctx.shadowBlur = 0;

    // Membrana nuclear
    if (fase === 0 || (fase === 1 && prog < 0.5)) {
      const a = fase === 0 ? 0.65 : (1 - prog*2)*0.65;
      ctx.beginPath(); ctx.ellipse(cx,cy,42,35,0,0,Math.PI*2);
      ctx.strokeStyle = `rgba(255,255,180,${a})`; ctx.lineWidth=1.5;
      ctx.setLineDash([4,3]); ctx.stroke(); ctx.setLineDash([]);
    }

    // Cromatina (interfase)
    if (fase === 0) {
      for (let i=0;i<36;i++) {
        const ang = (i/36)*Math.PI*2;
        const r = 16 + Math.sin(i*1.7)*12;
        ctx.beginPath(); ctx.arc(cx+Math.cos(ang)*r*0.75, cy+Math.sin(ang)*r*0.6, 1.4,0,Math.PI*2);
        ctx.fillStyle='#ff80ab88'; ctx.fill();
      }
      ctx.fillStyle='#4fc3f755'; ctx.font='10px monospace'; ctx.textAlign='center';
      ctx.fillText('ADN duplicándose...', cx, cy+52);
    }

    // Cromosomas fases 1-4
    if (fase >= 1) {
      for (let i=0;i<N;i++) {
        const ang = (i/N)*Math.PI*2;
        const col = CROMO_COLS[i];

        if (fase === 1) {
          const r = lerp(0,34,prog);
          drawChromosome(cx+Math.cos(ang)*r, cy+Math.sin(ang)*r*0.72, ang, col, lerp(0.2,1,prog));
        }
        if (fase === 2) {
          const xp = cx + lerp(Math.cos(ang)*34, (i-N/2+0.5)*20, prog);
          const yp = lerp(cy+Math.sin(ang)*26, cy, prog);
          drawChromosome(xp, yp, Math.PI/2, col, 1);
          if (prog > 0.4) {
            const a = (prog-0.4)*1.7;
            ctx.beginPath(); ctx.moveTo(xp,yp); ctx.lineTo(cx-rx+12,cy-ry+12);
            ctx.strokeStyle=`rgba(255,255,255,${a*0.25})`; ctx.lineWidth=1; ctx.stroke();
            ctx.beginPath(); ctx.moveTo(xp,yp); ctx.lineTo(cx+rx-12,cy+ry-12);
            ctx.strokeStyle=`rgba(255,255,255,${a*0.25})`; ctx.lineWidth=1; ctx.stroke();
          }
        }
        if (fase === 3) {
          const xb = cx+(i-N/2+0.5)*20;
          const sep = lerp(0, ry*0.65, prog);
          drawChromosome(xb, cy-sep, Math.PI/2, col, 1);
          drawChromosome(xb, cy+sep, Math.PI/2, CROMO_COLS[(i+2)%N], 1);
        }
        if (fase === 4) {
          const xb = cx+(i-N/2+0.5)*18;
          const py = ry*0.52;
          drawChromosome(xb, cy-py, Math.PI/2, col, lerp(1,0.5,prog));
          drawChromosome(xb, cy+py, Math.PI/2, CROMO_COLS[(i+2)%N], lerp(1,0.5,prog));
          if (prog > 0.3) {
            const a = (prog-0.3)/0.7;
            ctx.beginPath(); ctx.ellipse(cx,cy-py,34,20,0,0,Math.PI*2);
            ctx.strokeStyle=`rgba(255,255,180,${a*0.65})`; ctx.lineWidth=1.5;
            ctx.setLineDash([4,3]); ctx.stroke();
            ctx.beginPath(); ctx.ellipse(cx,cy+py,34,20,0,0,Math.PI*2);
            ctx.stroke(); ctx.setLineDash([]);
          }
          if (prog > 0.55) {
            const a = (prog-0.55)*2.2;
            ctx.beginPath(); ctx.moveTo(cx-rx,cy); ctx.lineTo(cx+rx,cy);
            ctx.strokeStyle=`rgba(255,255,255,${a*0.35})`; ctx.lineWidth=2;
            ctx.setLineDash([6,4]); ctx.stroke(); ctx.setLineDash([]);
          }
        }
      }
    }

    ctx.fillStyle = fc+'cc'; ctx.font='bold 11px monospace'; ctx.textAlign='center';
    ctx.shadowColor=fc; ctx.shadowBlur=7;
    ctx.fillText(FASES[fase].nombre, cx, H-10);
    ctx.shadowBlur=0;

    rafId = requestAnimationFrame(loop);
  }

  loop();

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  };
}
