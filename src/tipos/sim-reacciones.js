const CPK = { H:'#e8e8ff', O:'#FF3535', C:'#6677aa', N:'#5566FF', Fe:'#FF9911', Na:'#CC44FF', Cl:'#33EE55', S:'#FFEE33' };

const REACCIONES = [
  {
    nombre: 'Combustión CH₄',
    reactivos: [{ formula:'CH4', label:'CH₄', coef:1 }, { formula:'O2', label:'O₂', coef:2 }],
    productos:  [{ formula:'CO2', label:'CO₂', coef:1 }, { formula:'H2O', label:'H₂O', coef:2 }],
    colorAccent:'#f97316',
    moleculas: {
      CH4:   [{ e:'C',x:0,y:0,r:13 },{ e:'H',x:-20,y:0,r:7 },{ e:'H',x:20,y:0,r:7 },{ e:'H',x:0,y:-20,r:7 },{ e:'H',x:0,y:20,r:7 }],
      O2:    [{ e:'O',x:-11,y:0,r:11 },{ e:'O',x:11,y:0,r:11 }],
      CO2:   [{ e:'O',x:-20,y:0,r:11 },{ e:'C',x:0,y:0,r:11 },{ e:'O',x:20,y:0,r:11 }],
      H2O:   [{ e:'O',x:0,y:0,r:11 },{ e:'H',x:-13,y:13,r:7 },{ e:'H',x:13,y:13,r:7 }],
    },
  },
  {
    nombre: 'Síntesis H₂O',
    reactivos: [{ formula:'H2', label:'H₂', coef:2 }, { formula:'O2', label:'O₂', coef:1 }],
    productos:  [{ formula:'H2O', label:'H₂O', coef:2 }],
    colorAccent:'#22d3ee',
    moleculas: {
      H2:    [{ e:'H',x:-9,y:0,r:8 },{ e:'H',x:9,y:0,r:8 }],
      O2:    [{ e:'O',x:-11,y:0,r:11 },{ e:'O',x:11,y:0,r:11 }],
      H2O:   [{ e:'O',x:0,y:0,r:11 },{ e:'H',x:-13,y:13,r:7 },{ e:'H',x:13,y:13,r:7 }],
    },
  },
  {
    nombre: 'Oxidación Fe',
    reactivos: [{ formula:'Fe', label:'Fe', coef:4 }, { formula:'O2', label:'O₂', coef:3 }],
    productos:  [{ formula:'Fe2O3', label:'Fe₂O₃', coef:2 }],
    colorAccent:'#fb923c',
    moleculas: {
      Fe:    [{ e:'Fe',x:0,y:0,r:14 }],
      O2:    [{ e:'O',x:-11,y:0,r:11 },{ e:'O',x:11,y:0,r:11 }],
      Fe2O3: [{ e:'Fe',x:-20,y:-9,r:13 },{ e:'Fe',x:20,y:-9,r:13 },{ e:'O',x:0,y:11,r:10 },{ e:'O',x:-24,y:11,r:10 },{ e:'O',x:24,y:11,r:10 }],
    },
  },
];

function parseFormula(f) {
  const result = {};
  const re = /([A-Z][a-z]?)(\d*)/g; let m;
  while ((m = re.exec(f)) !== null) {
    if (!m[1]) continue;
    result[m[1]] = (result[m[1]] || 0) + (parseInt(m[2]) || 1);
  }
  return result;
}

function countAtoms(partes, coefArr, offset) {
  const count = {};
  partes.forEach((part, i) => {
    const c = coefArr[offset+i];
    Object.entries(parseFormula(part.formula)).forEach(([e,n]) => { count[e] = (count[e]||0) + n*c; });
  });
  return count;
}

export function iniciarSimReacciones(container) {
  container.innerHTML = `
    <div class="sim-rxn-wrap">
      <div class="sim-rxn-hdr">
        <div class="sim-sol-dots"><span></span><span></span><span></span></div>
        <span class="sim-rxn-title">⚗️  Balanceo Molecular  ·  Conservación de Átomos</span>
      </div>
      <canvas class="sim-rxn-cv" width="620" height="210"></canvas>
      <div class="sim-rxn-tab-row"></div>
      <div class="sim-rxn-eq-panel">
        <div class="sim-rxn-eq-lbl">AJUSTA LOS COEFICIENTES ESTEQUIOMÉTRICOS:</div>
        <div class="sim-rxn-eq-row"></div>
      </div>
      <div class="sim-rxn-bal-panel">
        <div class="sim-rxn-bal-lbl">CONSERVACIÓN DE ÁTOMOS:</div>
        <div class="sim-rxn-bal-row"></div>
        <div class="sim-rxn-bal-msg"></div>
      </div>
    </div>
  `;

  const canvas    = container.querySelector('canvas');
  const ctx       = canvas.getContext('2d');
  const W = 620, H = 210;

  const tabRow    = container.querySelector('.sim-rxn-tab-row');
  const eqRow     = container.querySelector('.sim-rxn-eq-row');
  const balRow    = container.querySelector('.sim-rxn-bal-row');
  const balMsg    = container.querySelector('.sim-rxn-bal-msg');

  // Starfield (precomputed)
  const stars = Array.from({ length: 80 }, () => ({
    x: Math.random()*W, y: Math.random()*H,
    r: Math.random()*1.4 + 0.3,
    phase: Math.random()*Math.PI*2,
    speed: 0.5 + Math.random()*1.5,
  }));

  let rxnActual = 0, coefs = [], flash = 0, flashColor = '#fbbf24', reaccionando = false, moleculasAnim = [];

  function formatFormula(f) {
    return f.replace(/(\d+)/g,'<sub>$1</sub>').replace(/([A-Z][a-z]?)(\d)/g,'$1<sub>$2</sub>');
  }

  function buildMoleculasAnim() {
    const rxn = REACCIONES[rxnActual];
    moleculasAnim = [];
    let x = 44;
    rxn.reactivos.forEach((m, i) => {
      for (let k = 0; k < coefs[i]; k++) {
        moleculasAnim.push({ key:m.formula, x, y:105, vx:(Math.random()-0.5)*0.9, vy:(Math.random()-0.5)*0.5, lado:'r', t:Math.random()*Math.PI*2 });
        x += 58;
      }
      if (i < rxn.reactivos.length-1) x += 10;
    });
    x = W*0.58;
    rxn.productos.forEach((m, i) => {
      const ci = rxn.reactivos.length + i;
      for (let k = 0; k < coefs[ci]; k++) {
        moleculasAnim.push({ key:m.formula, x, y:105, vx:(Math.random()-0.5)*0.9, vy:(Math.random()-0.5)*0.5, lado:'p', t:Math.random()*Math.PI*2 });
        x += 62;
      }
      if (i < rxn.productos.length-1) x += 10;
    });
  }

  function updateBalance() {
    const rxn = REACCIONES[rxnActual];
    const atomsR = countAtoms(rxn.reactivos, coefs, 0);
    const atomsP = countAtoms(rxn.productos, coefs, rxn.reactivos.length);
    const allElems = new Set([...Object.keys(atomsR), ...Object.keys(atomsP)]);
    balRow.innerHTML = '';
    let balanced = true;
    allElems.forEach(e => {
      const r = atomsR[e]||0, p = atomsP[e]||0;
      const ok = r===p; if (!ok) balanced=false;
      balRow.innerHTML += `<div class="sim-elem-badge ${ok?'ok':'no'}"><strong>${e}</strong><span style="font-size:10px;opacity:.7">${r}→${p}</span><span>${ok?'✓':'✗'}</span></div>`;
    });
    if (balanced) {
      balMsg.textContent = '✅ ¡BALANCEADA! — Ley de Conservación de la Masa';
      balMsg.className = 'sim-balance-msg ok';
      if (!reaccionando) {
        reaccionando=true; flash=1.0;
        flashColor = REACCIONES[rxnActual].colorAccent;
        setTimeout(()=>{ reaccionando=false; }, 1600);
      }
    } else {
      balMsg.textContent = '⚠ Átomos sin conservar — ajusta los coeficientes';
      balMsg.className = 'sim-balance-msg no';
    }
  }

  function buildEcuacion() {
    const rxn = REACCIONES[rxnActual];
    eqRow.innerHTML = '';
    const allParts = [
      ...rxn.reactivos.map((m,i) => ({ ...m, idx:i })),
      { arrow:true },
      ...rxn.productos.map((m,i) => ({ ...m, idx:rxn.reactivos.length+i })),
    ];
    allParts.forEach((part, pi) => {
      if (part.arrow) {
        const a=document.createElement('span'); a.className='sim-arrow'; a.textContent='→'; eqRow.appendChild(a); return;
      }
      if (pi>0 && !allParts[pi-1].arrow) {
        const plus=document.createElement('span'); plus.className='sim-op-sign'; plus.textContent='+'; eqRow.appendChild(plus);
      }
      const g=document.createElement('div'); g.className='sim-mol-grupo';
      const cd=document.createElement('div'); cd.className='sim-mol-coef';
      const bu=document.createElement('button'); bu.textContent='▲';
      bu.addEventListener('click',()=>{ coefs[part.idx]=Math.min(9,coefs[part.idx]+1); buildEcuacion(); buildMoleculasAnim(); updateBalance(); });
      const vs=document.createElement('div'); vs.className='sim-mol-coef-val'; vs.textContent=coefs[part.idx];
      const bd=document.createElement('button'); bd.textContent='▼';
      bd.addEventListener('click',()=>{ coefs[part.idx]=Math.max(1,coefs[part.idx]-1); buildEcuacion(); buildMoleculasAnim(); updateBalance(); });
      cd.appendChild(bu); cd.appendChild(vs); cd.appendChild(bd);
      const fs=document.createElement('span'); fs.className='sim-mol-formula';
      fs.innerHTML=formatFormula(part.label||part.formula);
      g.appendChild(cd); g.appendChild(fs); eqRow.appendChild(g);
    });
  }

  function setRxn(i) {
    rxnActual=i;
    const rxn=REACCIONES[i];
    coefs=[...rxn.reactivos.map(()=>1),...rxn.productos.map(()=>1)];
    container.querySelectorAll('.sim-rxn-tab').forEach((b,j)=>b.classList.toggle('activa',j===i));
    buildEcuacion(); buildMoleculasAnim(); updateBalance();
  }

  REACCIONES.forEach((r,i)=>{
    const btn=document.createElement('button');
    btn.className='sim-rxn-tab'+(i===0?' activa':'');
    btn.textContent=r.nombre;
    btn.style.setProperty('--accent', r.colorAccent);
    btn.addEventListener('click',()=>setRxn(i));
    tabRow.appendChild(btn);
  });

  function drawMol(mol, x, y) {
    const rxn=REACCIONES[rxnActual];
    const atoms=rxn.moleculas[mol.key];
    if (!atoms) return;
    for (let i=1;i<atoms.length;i++) {
      ctx.beginPath(); ctx.moveTo(x+atoms[0].x,y+atoms[0].y); ctx.lineTo(x+atoms[i].x,y+atoms[i].y);
      ctx.strokeStyle='rgba(220,220,255,0.35)'; ctx.lineWidth=2.5; ctx.stroke();
    }
    atoms.forEach(a=>{
      const ax=x+a.x,ay=y+a.y,r=a.r;
      const col=CPK[a.e]||'#888';
      // Nebula aura
      const grd=ctx.createRadialGradient(ax,ay,0,ax,ay,r*2.8);
      grd.addColorStop(0,col+'55'); grd.addColorStop(1,'transparent');
      ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(ax,ay,r*2.8,0,Math.PI*2); ctx.fill();
      // Sphere
      const sg=ctx.createRadialGradient(ax-r*.32,ay-r*.32,0,ax,ay,r);
      sg.addColorStop(0,col); sg.addColorStop(0.6,col+'cc'); sg.addColorStop(1,col+'33');
      ctx.fillStyle=sg;
      ctx.shadowColor=col; ctx.shadowBlur=12;
      ctx.beginPath(); ctx.arc(ax,ay,r,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur=0;
      ctx.strokeStyle='rgba(255,255,255,0.25)'; ctx.lineWidth=0.8;
      ctx.beginPath(); ctx.arc(ax,ay,r,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,0.55)';
      ctx.beginPath(); ctx.arc(ax-r*.32,ay-r*.32,r*.28,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=col==='#e8e8ff'?'#444':'#fff';
      ctx.font=`bold ${Math.max(7,r*.72)}px monospace`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(a.e,ax,ay); ctx.textBaseline='alphabetic';
    });
  }

  let rafId;
  function loop() {
    ctx.clearRect(0,0,W,H);

    // Gradient background
    const bg=ctx.createLinearGradient(0,0,W,H);
    bg.addColorStop(0,'#0e0820');
    bg.addColorStop(0.5,'#140a2c');
    bg.addColorStop(1,'#1a0c38');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    // Subtle grid
    ctx.strokeStyle='rgba(130,80,240,0.07)'; ctx.lineWidth=0.5;
    for (let gx=0;gx<W;gx+=28) { ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,H); ctx.stroke(); }
    for (let gy=0;gy<H;gy+=28) { ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(W,gy); ctx.stroke(); }

    // Twinkling stars
    const t=Date.now()*.001;
    stars.forEach(s=>{
      const a=0.25+Math.sin(s.phase+t*s.speed)*0.25;
      ctx.globalAlpha=a; ctx.fillStyle='#fff';
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha=1;

    // Flash on balance
    if (flash>0) {
      const fc=flashColor||'#fbbf24';
      ctx.fillStyle=`rgba(${hexToRgb(fc)},${flash*.18})`;
      ctx.fillRect(0,0,W,H);
      if (flash>0.6) {
        for (let i=0;i<8;i++) {
          const a=Math.random()*Math.PI*2, r=10+Math.random()*40;
          ctx.fillStyle=`rgba(${hexToRgb(fc)},${Math.random()*.9})`;
          ctx.beginPath(); ctx.arc(W*.56+Math.cos(a)*r,H/2+Math.sin(a)*r,Math.random()*4,0,Math.PI*2); ctx.fill();
        }
      }
      flash-=0.022;
    }

    // Center divider with glow
    const midX=W*.57;
    const dg=ctx.createLinearGradient(midX,0,midX,H);
    const ac=(REACCIONES[rxnActual].colorAccent)||'#ff7043';
    dg.addColorStop(0,'transparent');
    dg.addColorStop(0.5,ac+'66');
    dg.addColorStop(1,'transparent');
    ctx.strokeStyle=dg; ctx.lineWidth=1.5; ctx.setLineDash([6,5]);
    ctx.shadowColor=ac; ctx.shadowBlur=8;
    ctx.beginPath(); ctx.moveTo(midX,8); ctx.lineTo(midX,H-8); ctx.stroke();
    ctx.setLineDash([]); ctx.shadowBlur=0;

    // Arrow
    ctx.fillStyle=ac+'ee'; ctx.font='bold 24px monospace'; ctx.textAlign='center';
    ctx.shadowColor=ac; ctx.shadowBlur=16;
    ctx.fillText('→',midX,H/2+8); ctx.shadowBlur=0;

    // Section labels
    ctx.fillStyle='rgba(180,160,255,0.45)'; ctx.font='bold 9px monospace'; ctx.textAlign='center';
    ctx.fillText('REACTIVOS',midX*.38,15); ctx.fillText('PRODUCTOS',midX+(W-midX)*.5,15);

    // Molecules
    moleculasAnim.forEach(mol=>{
      mol.t+=0.028; mol.x+=mol.vx; mol.y+=mol.vy+Math.sin(mol.t)*.35;
      const xMin=mol.lado==='r'?26:midX+22, xMax=mol.lado==='r'?midX-26:W-26;
      if(mol.x<xMin){mol.x=xMin;mol.vx=Math.abs(mol.vx);}
      if(mol.x>xMax){mol.x=xMax;mol.vx=-Math.abs(mol.vx);}
      if(mol.y<40){mol.y=40;mol.vy=Math.abs(mol.vy);}
      if(mol.y>H-38){mol.y=H-38;mol.vy=-Math.abs(mol.vy);}
      drawMol(mol,mol.x,mol.y);
    });

    rafId=requestAnimationFrame(loop);
  }

  function hexToRgb(hex) {
    const r=parseInt(hex.slice(1,3),16), g2=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
    return `${r},${g2},${b}`;
  }

  setRxn(0);
  loop();
  return ()=>{ cancelAnimationFrame(rafId); container.innerHTML=''; };
}
