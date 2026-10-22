const CPK = { H:'#FFFFFF', O:'#FF4444', C:'#444444', N:'#4444FF', Fe:'#CC6600', Na:'#AA44CC', Cl:'#44CC44', S:'#CCCC00' };

const REACCIONES = [
  {
    nombre: 'Combustión CH₄',
    reactivos: [{ formula:'CH4', label:'CH₄', coef:1 }, { formula:'O2', label:'O₂', coef:2 }],
    productos:  [{ formula:'CO2', label:'CO₂', coef:1 }, { formula:'H2O', label:'H₂O', coef:2 }],
    moleculas: {
      CH4:   [{ e:'C',x:0,y:0,r:12 },{ e:'H',x:-18,y:0,r:6 },{ e:'H',x:18,y:0,r:6 },{ e:'H',x:0,y:-18,r:6 },{ e:'H',x:0,y:18,r:6 }],
      O2:    [{ e:'O',x:-10,y:0,r:10 },{ e:'O',x:10,y:0,r:10 }],
      CO2:   [{ e:'O',x:-18,y:0,r:10 },{ e:'C',x:0,y:0,r:10 },{ e:'O',x:18,y:0,r:10 }],
      H2O:   [{ e:'O',x:0,y:0,r:10 },{ e:'H',x:-12,y:12,r:6 },{ e:'H',x:12,y:12,r:6 }],
    },
  },
  {
    nombre: 'Síntesis H₂O',
    reactivos: [{ formula:'H2', label:'H₂', coef:2 }, { formula:'O2', label:'O₂', coef:1 }],
    productos:  [{ formula:'H2O', label:'H₂O', coef:2 }],
    moleculas: {
      H2:    [{ e:'H',x:-8,y:0,r:7 },{ e:'H',x:8,y:0,r:7 }],
      O2:    [{ e:'O',x:-10,y:0,r:10 },{ e:'O',x:10,y:0,r:10 }],
      H2O:   [{ e:'O',x:0,y:0,r:10 },{ e:'H',x:-12,y:12,r:6 },{ e:'H',x:12,y:12,r:6 }],
    },
  },
  {
    nombre: 'Oxidación Fe',
    reactivos: [{ formula:'Fe', label:'Fe', coef:4 }, { formula:'O2', label:'O₂', coef:3 }],
    productos:  [{ formula:'Fe2O3', label:'Fe₂O₃', coef:2 }],
    moleculas: {
      Fe:    [{ e:'Fe',x:0,y:0,r:13 }],
      O2:    [{ e:'O',x:-10,y:0,r:10 },{ e:'O',x:10,y:0,r:10 }],
      Fe2O3: [{ e:'Fe',x:-18,y:-8,r:12 },{ e:'Fe',x:18,y:-8,r:12 },{ e:'O',x:0,y:10,r:9 },{ e:'O',x:-22,y:10,r:9 },{ e:'O',x:22,y:10,r:9 }],
    },
  },
];

function parseFormula(f) {
  const result = {};
  const re = /([A-Z][a-z]?)(\d*)/g;
  let m;
  while ((m = re.exec(f)) !== null) {
    if (!m[1]) continue;
    result[m[1]] = (result[m[1]] || 0) + (parseInt(m[2]) || 1);
  }
  return result;
}

function countAtoms(partes, coefArr, offset) {
  const count = {};
  partes.forEach((part, i) => {
    const c = coefArr[offset + i];
    const atoms = parseFormula(part.formula);
    Object.entries(atoms).forEach(([e, n]) => { count[e] = (count[e] || 0) + n * c; });
  });
  return count;
}

export function iniciarSimReacciones(container) {
  container.innerHTML = `
    <div class="sim-wrap">
      <div class="sim-head">
        <span class="sim-dot dg"></span><span class="sim-dot dy"></span><span class="sim-dot dr"></span>
        <span class="sim-titulo-txt">⚗️ Simulador — Reacciones Químicas · Balanceo Molecular</span>
      </div>
      <canvas class="sim-rxn-canvas" width="620" height="220"></canvas>
      <div class="sim-rxn-tabs"></div>
      <div class="sim-ecuacion-panel">
        <div class="sim-ecuacion-lbl">AJUSTA LOS COEFICIENTES ESTEQUIOMÉTRICOS:</div>
        <div class="sim-ecuacion-row"></div>
      </div>
      <div class="sim-balance-panel">
        <div class="sim-balance-lbl">CONSERVACIÓN DE ÁTOMOS:</div>
        <div class="sim-balance-row"></div>
        <div class="sim-balance-msg"></div>
      </div>
    </div>
  `;

  const canvas = container.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const W = 620, H = 220;

  const tabsCont    = container.querySelector('.sim-rxn-tabs');
  const eqRow       = container.querySelector('.sim-ecuacion-row');
  const balRow      = container.querySelector('.sim-balance-row');
  const balMsg      = container.querySelector('.sim-balance-msg');

  let rxnActual = 0;
  let coefs = [];
  let flash = 0;
  let reaccionando = false;
  let moleculasAnim = [];

  function formatFormula(f) {
    return f.replace(/(\d+)/g, '<sub>$1</sub>').replace(/([A-Z][a-z]?)(\d)/g, '$1<sub>$2</sub>');
  }

  function buildMoleculasAnim() {
    const rxn = REACCIONES[rxnActual];
    moleculasAnim = [];
    let x = 45;
    rxn.reactivos.forEach((m, i) => {
      for (let k = 0; k < coefs[i]; k++) {
        moleculasAnim.push({ key: m.formula, x, y: 110, vx: (Math.random()-0.5)*0.8, vy: (Math.random()-0.5)*0.5, lado:'r', t: Math.random()*Math.PI*2 });
        x += 55;
      }
      if (i < rxn.reactivos.length - 1) x += 10;
    });
    x = W * 0.58;
    rxn.productos.forEach((m, i) => {
      const ci = rxn.reactivos.length + i;
      for (let k = 0; k < coefs[ci]; k++) {
        moleculasAnim.push({ key: m.formula, x, y: 110, vx: (Math.random()-0.5)*0.8, vy: (Math.random()-0.5)*0.5, lado:'p', t: Math.random()*Math.PI*2 });
        x += 60;
      }
      if (i < rxn.productos.length - 1) x += 10;
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
      const r = atomsR[e] || 0, p = atomsP[e] || 0;
      const ok = r === p;
      if (!ok) balanced = false;
      balRow.innerHTML += `<div class="sim-elem-badge ${ok?'ok':'no'}"><strong>${e}</strong><span style="font-size:10px;opacity:0.7">${r}→${p}</span><span>${ok?'✓':'✗'}</span></div>`;
    });
    if (balanced) {
      balMsg.textContent = '✅ ¡Ecuación BALANCEADA! — Ley de Conservación de la Masa';
      balMsg.className = 'sim-balance-msg ok';
      if (!reaccionando) { reaccionando = true; flash = 1.0; setTimeout(() => { reaccionando = false; }, 1500); }
    } else {
      balMsg.textContent = '⚠ Átomos sin conservar — ajusta los coeficientes';
      balMsg.className = 'sim-balance-msg no';
    }
  }

  function buildEcuacion() {
    const rxn = REACCIONES[rxnActual];
    eqRow.innerHTML = '';
    const allParts = [
      ...rxn.reactivos.map((m, i) => ({ ...m, idx: i })),
      { arrow: true },
      ...rxn.productos.map((m, i) => ({ ...m, idx: rxn.reactivos.length + i })),
    ];

    allParts.forEach((part, pi) => {
      if (part.arrow) {
        const a = document.createElement('span'); a.className = 'sim-arrow'; a.textContent = '→'; eqRow.appendChild(a); return;
      }
      if (pi > 0 && !allParts[pi-1].arrow) {
        const plus = document.createElement('span'); plus.className = 'sim-op-sign'; plus.textContent = '+'; eqRow.appendChild(plus);
      }
      const grupo = document.createElement('div'); grupo.className = 'sim-mol-grupo';
      const coefDiv = document.createElement('div'); coefDiv.className = 'sim-mol-coef';
      const btnUp = document.createElement('button'); btnUp.textContent = '▲';
      btnUp.addEventListener('click', () => { coefs[part.idx] = Math.min(9, coefs[part.idx]+1); buildEcuacion(); buildMoleculasAnim(); updateBalance(); });
      const valSpan = document.createElement('div'); valSpan.className = 'sim-mol-coef-val'; valSpan.textContent = coefs[part.idx];
      const btnDn = document.createElement('button'); btnDn.textContent = '▼';
      btnDn.addEventListener('click', () => { coefs[part.idx] = Math.max(1, coefs[part.idx]-1); buildEcuacion(); buildMoleculasAnim(); updateBalance(); });
      coefDiv.appendChild(btnUp); coefDiv.appendChild(valSpan); coefDiv.appendChild(btnDn);
      const fs = document.createElement('span'); fs.className = 'sim-mol-formula';
      fs.innerHTML = formatFormula(part.label || part.formula);
      grupo.appendChild(coefDiv); grupo.appendChild(fs); eqRow.appendChild(grupo);
    });
  }

  function setRxn(i) {
    rxnActual = i;
    const rxn = REACCIONES[i];
    coefs = [...rxn.reactivos.map(() => 1), ...rxn.productos.map(() => 1)];
    container.querySelectorAll('.sim-rxn-tab').forEach((b, j) => b.classList.toggle('activa', j === i));
    buildEcuacion();
    buildMoleculasAnim();
    updateBalance();
  }

  REACCIONES.forEach((r, i) => {
    const btn = document.createElement('button');
    btn.className = 'sim-rxn-tab' + (i === 0 ? ' activa' : '');
    btn.textContent = r.nombre;
    btn.addEventListener('click', () => setRxn(i));
    tabsCont.appendChild(btn);
  });

  function drawMol(mol, x, y) {
    const rxn = REACCIONES[rxnActual];
    const atoms = rxn.moleculas[mol.key];
    if (!atoms) return;
    for (let i = 1; i < atoms.length; i++) {
      ctx.beginPath(); ctx.moveTo(x+atoms[0].x, y+atoms[0].y); ctx.lineTo(x+atoms[i].x, y+atoms[i].y);
      ctx.strokeStyle = 'rgba(200,200,200,0.4)'; ctx.lineWidth = 2.5; ctx.stroke();
    }
    atoms.forEach(a => {
      const ax = x+a.x, ay = y+a.y, r = a.r;
      const col = CPK[a.e] || '#888888';
      const grd = ctx.createRadialGradient(ax,ay,0,ax,ay,r*2.2);
      grd.addColorStop(0,col+'44'); grd.addColorStop(1,'transparent');
      ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(ax,ay,r*2.2,0,Math.PI*2); ctx.fill();
      const sg = ctx.createRadialGradient(ax-r*0.3,ay-r*0.3,0,ax,ay,r);
      sg.addColorStop(0,col); sg.addColorStop(0.6,col+'cc'); sg.addColorStop(1,col+'44');
      ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(ax,ay,r,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=0.8;
      ctx.beginPath(); ctx.arc(ax,ay,r,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,0.5)';
      ctx.beginPath(); ctx.arc(ax-r*0.3,ay-r*0.3,r*0.25,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = col==='#FFFFFF'?'#333':'#fff';
      ctx.font=`bold ${Math.max(7,r*0.7)}px monospace`; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(a.e,ax,ay); ctx.textBaseline='alphabetic';
    });
  }

  let rafId;
  function loop() {
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#04040e'; ctx.fillRect(0,0,W,H);
    if (flash > 0) { ctx.fillStyle=`rgba(255,200,50,${flash*0.15})`; ctx.fillRect(0,0,W,H); flash-=0.02; }
    const midX = W*0.56;
    ctx.strokeStyle='rgba(255,100,50,0.3)'; ctx.lineWidth=1.5; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.moveTo(midX,10); ctx.lineTo(midX,H-10); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='#ff7043cc'; ctx.font='bold 22px monospace'; ctx.textAlign='center';
    ctx.shadowColor='#ff7043'; ctx.shadowBlur=12;
    ctx.fillText('→',midX,H/2+7); ctx.shadowBlur=0;
    ctx.fillStyle='rgba(100,150,200,0.4)'; ctx.font='10px monospace'; ctx.textAlign='center';
    ctx.fillText('REACTIVOS',midX*0.38,16); ctx.fillText('PRODUCTOS',midX+(W-midX)*0.5,16);
    moleculasAnim.forEach(mol => {
      mol.t+=0.025; mol.x+=mol.vx; mol.y+=mol.vy+Math.sin(mol.t)*0.3;
      const xMin=mol.lado==='r'?28:midX+22, xMax=mol.lado==='r'?midX-28:W-28;
      if(mol.x<xMin){mol.x=xMin;mol.vx=Math.abs(mol.vx);}
      if(mol.x>xMax){mol.x=xMax;mol.vx=-Math.abs(mol.vx);}
      if(mol.y<42){mol.y=42;mol.vy=Math.abs(mol.vy);}
      if(mol.y>H-42){mol.y=H-42;mol.vy=-Math.abs(mol.vy);}
      drawMol(mol,mol.x,mol.y);
    });
    if(flash>0.5) {
      for(let i=0;i<6;i++) {
        const a=Math.random()*Math.PI*2, r=15+Math.random()*25;
        ctx.fillStyle=`rgba(255,200,50,${Math.random()*0.8})`;
        ctx.beginPath(); ctx.arc(midX+Math.cos(a)*r,H/2+Math.sin(a)*r,Math.random()*3,0,Math.PI*2); ctx.fill();
      }
    }
    rafId = requestAnimationFrame(loop);
  }

  setRxn(0);
  loop();
  return () => { cancelAnimationFrame(rafId); container.innerHTML = ''; };
}
