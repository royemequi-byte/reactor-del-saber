const CPK = { H:'#9ca3af', O:'#ef4444', C:'#374151', N:'#3b82f6', Fe:'#f97316', Na:'#8b5cf6', Cl:'#10b981', S:'#eab308' };

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
    colorAccent:'#0ea5e9',
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
    colorAccent:'#dc2626',
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

  let rxnActual = 0, coefs = [], flash = 0, flashColor = '#f97316', reaccionando = false, moleculasAnim = [];

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
        const a=document.createElement('span'); a.className='sim-arrow'; a.style.color=REACCIONES[rxnActual].colorAccent; a.textContent='→'; eqRow.appendChild(a); return;
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
    // Bonds
    for (let i=1;i<atoms.length;i++) {
      ctx.beginPath(); ctx.moveTo(x+atoms[0].x,y+atoms[0].y); ctx.lineTo(x+atoms[i].x,y+atoms[i].y);
      ctx.strokeStyle='rgba(100,100,120,0.4)'; ctx.lineWidth=2.5; ctx.stroke();
    }
    atoms.forEach(a=>{
      const ax=x+a.x, ay=y+a.y, r=a.r;
      const col=CPK[a.e]||'#888';

      // Soft shadow on white bg
      ctx.shadowColor=col; ctx.shadowBlur=8;

      // Sphere with 3D gradient
      const sg=ctx.createRadialGradient(ax-r*.32,ay-r*.32,0,ax,ay,r);
      sg.addColorStop(0, lighten(col));
      sg.addColorStop(0.55, col);
      sg.addColorStop(1, darken(col));
      ctx.fillStyle=sg;
      ctx.beginPath(); ctx.arc(ax,ay,r,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur=0;

      // Dark outline
      ctx.strokeStyle='rgba(0,0,0,0.18)'; ctx.lineWidth=0.9;
      ctx.beginPath(); ctx.arc(ax,ay,r,0,Math.PI*2); ctx.stroke();

      // Specular
      ctx.fillStyle='rgba(255,255,255,0.7)';
      ctx.beginPath(); ctx.arc(ax-r*.32,ay-r*.32,r*.28,0,Math.PI*2); ctx.fill();

      // Element label — visible on colored sphere
      const lum = luminance(col);
      ctx.fillStyle=lum>0.4?'#1f2937':'#ffffff';
      ctx.font=`bold ${Math.max(7,r*.72)}px monospace`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(a.e,ax,ay); ctx.textBaseline='alphabetic';
    });
  }

  function lighten(hex) {
    const [r,g,b] = hexToComponents(hex);
    return `rgb(${Math.min(255,r+70)},${Math.min(255,g+70)},${Math.min(255,b+70)})`;
  }
  function darken(hex) {
    const [r,g,b] = hexToComponents(hex);
    return `rgb(${Math.max(0,r-50)},${Math.max(0,g-50)},${Math.max(0,b-50)})`;
  }
  function hexToComponents(hex) {
    return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
  }
  function luminance(hex) {
    const [r,g,b] = hexToComponents(hex).map(v=>v/255);
    return 0.299*r + 0.587*g + 0.114*b;
  }
  function hexToRgb(hex) {
    const [r,g,b] = hexToComponents(hex); return `${r},${g},${b}`;
  }

  let rafId;
  function loop() {
    ctx.clearRect(0,0,W,H);

    // White background with subtle warm gradient
    const bg=ctx.createLinearGradient(0,0,W,H);
    bg.addColorStop(0,'#fafafa');
    bg.addColorStop(0.5,'#f8f9ff');
    bg.addColorStop(1,'#f5f3ff');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    // Subtle dot grid
    ctx.fillStyle='rgba(99,102,241,0.1)';
    for (let gx=18;gx<W;gx+=22) {
      for (let gy=12;gy<H;gy+=22) {
        ctx.beginPath(); ctx.arc(gx,gy,1.2,0,Math.PI*2); ctx.fill();
      }
    }

    const midX=W*.57;

    // Flash on balance
    if (flash>0) {
      const fc=flashColor||'#f97316';
      ctx.fillStyle=`rgba(${hexToRgb(fc)},${flash*.12})`;
      ctx.fillRect(0,0,W,H);
      if (flash>0.6) {
        for (let i=0;i<6;i++) {
          const a=Math.random()*Math.PI*2, rd=8+Math.random()*35;
          ctx.fillStyle=`rgba(${hexToRgb(fc)},${Math.random()*.8})`;
          ctx.beginPath(); ctx.arc(midX+Math.cos(a)*rd,H/2+Math.sin(a)*rd,Math.random()*4,0,Math.PI*2); ctx.fill();
        }
      }
      flash-=0.022;
    }

    // Left/right labels
    ctx.fillStyle='rgba(100,100,130,0.55)'; ctx.font='bold 9px monospace'; ctx.textAlign='center';
    ctx.fillText('REACTIVOS',midX*.38,13); ctx.fillText('PRODUCTOS',midX+(W-midX)*.5,13);

    // Center divider with accent color
    const ac=REACCIONES[rxnActual].colorAccent;
    ctx.strokeStyle=ac+'88'; ctx.lineWidth=1.5; ctx.setLineDash([5,5]);
    ctx.beginPath(); ctx.moveTo(midX,16); ctx.lineTo(midX,H-8); ctx.stroke(); ctx.setLineDash([]);

    // Arrow
    ctx.fillStyle=ac; ctx.font='bold 26px sans-serif'; ctx.textAlign='center';
    ctx.shadowColor=ac; ctx.shadowBlur=10;
    ctx.fillText('→',midX,H/2+9); ctx.shadowBlur=0;

    // Molecules
    moleculasAnim.forEach(mol=>{
      mol.t+=0.028; mol.x+=mol.vx; mol.y+=mol.vy+Math.sin(mol.t)*.35;
      const xMin=mol.lado==='r'?26:midX+22, xMax=mol.lado==='r'?midX-26:W-26;
      if(mol.x<xMin){mol.x=xMin;mol.vx=Math.abs(mol.vx);}
      if(mol.x>xMax){mol.x=xMax;mol.vx=-Math.abs(mol.vx);}
      if(mol.y<38){mol.y=38;mol.vy=Math.abs(mol.vy);}
      if(mol.y>H-36){mol.y=H-36;mol.vy=-Math.abs(mol.vy);}
      drawMol(mol,mol.x,mol.y);
    });

    rafId=requestAnimationFrame(loop);
  }

  setRxn(0);
  loop();
  return ()=>{ cancelAnimationFrame(rafId); container.innerHTML=''; };
}
