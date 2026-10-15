// crucigrama.js — crucigrama mini con inputs por celda
export function renderCrucigrama(pregunta, contenedor, onConfirm) {
  const palabras = pregunta.palabras;

  // ── Calcular dimensiones del grid ──────────────────────────────────────────
  let maxFila = 0, maxCol = 0;
  for (const p of palabras) {
    if (p.dir === 'H') {
      maxFila = Math.max(maxFila, p.fila);
      maxCol  = Math.max(maxCol, p.col + p.texto.length - 1);
    } else {
      maxFila = Math.max(maxFila, p.fila + p.texto.length - 1);
      maxCol  = Math.max(maxCol, p.col);
    }
  }

  const filas = maxFila + 1;
  const cols  = maxCol  + 1;

  // ── Mapa del grid ──────────────────────────────────────────────────────────
  // grid[f][c] = { letra, palabrasInfo: [{wi, pos}] }
  const grid = Array.from({ length: filas }, () => Array(cols).fill(null));

  for (let wi = 0; wi < palabras.length; wi++) {
    const p = palabras[wi];
    for (let k = 0; k < p.texto.length; k++) {
      const f = p.dir === 'H' ? p.fila : p.fila + k;
      const c = p.dir === 'H' ? p.col + k : p.col;
      if (!grid[f][c]) grid[f][c] = { letra: p.texto[k], pw: [] };
      grid[f][c].pw.push({ wi, pos: k });
    }
  }

  // ── Pistas ─────────────────────────────────────────────────────────────────
  const pistasDiv = document.createElement('div');
  pistasDiv.className = 'cruce-pistas';
  let html = '';
  const hor = palabras.filter(p => p.dir === 'H');
  const ver = palabras.filter(p => p.dir === 'V');
  if (hor.length) {
    html += '<div class="cruce-pistas-col"><strong>→ Horizontal</strong><ol>';
    hor.forEach(p => { html += `<li>${p.pista}</li>`; });
    html += '</ol></div>';
  }
  if (ver.length) {
    html += '<div class="cruce-pistas-col"><strong>↓ Vertical</strong><ol>';
    ver.forEach(p => { html += `<li>${p.pista}</li>`; });
    html += '</ol></div>';
  }
  pistasDiv.innerHTML = html;

  // ── Tabla ──────────────────────────────────────────────────────────────────
  const table = document.createElement('table');
  table.className = 'cruce-grid';

  const inputs = {}; // `${f}-${c}` → <input>
  let palabraActiva = null;
  const palabrasOk  = new Set();

  for (let f = 0; f < filas; f++) {
    const tr = document.createElement('tr');
    for (let c = 0; c < cols; c++) {
      const td = document.createElement('td');
      const celda = grid[f][c];

      if (!celda) {
        td.className = 'cruce-td cruce-bloqueada';
      } else {
        td.className = 'cruce-td';

        // Número de la(s) palabra(s) que empiezan aquí
        const inicio = celda.pw.filter(pw => pw.pos === 0);
        if (inicio.length) {
          const sp = document.createElement('span');
          sp.className = 'cruce-num';
          sp.textContent = inicio.map(pw => pw.wi + 1).join('/');
          td.appendChild(sp);
        }

        const inp = document.createElement('input');
        inp.className = 'cruce-input';
        inp.maxLength = 1;
        inp.autocomplete = 'off';
        inp.spellcheck = false;
        inp.autocorrect = 'off';
        inp.dataset.f = f;
        inp.dataset.c = c;

        inp.addEventListener('focus', () => {
          if (celda.pw.length > 0) activarPalabra(celda.pw[0].wi);
        });

        inp.addEventListener('input', e => {
          const l = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(-1);
          e.target.value = l;
          if (l) avanzarCelda(f, c);
          verificar();
        });

        inp.addEventListener('keydown', e => {
          if (e.key === 'Backspace' && !e.target.value) retrocederCelda(f, c);
        });

        td.appendChild(inp);
        inputs[`${f}-${c}`] = inp;
      }
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }

  function activarPalabra(wi) {
    palabraActiva = wi;
    Object.values(inputs).forEach(i => i.classList.remove('cruce-activa'));
    const p = palabras[wi];
    for (let k = 0; k < p.texto.length; k++) {
      const f2 = p.dir === 'H' ? p.fila : p.fila + k;
      const c2 = p.dir === 'H' ? p.col + k : p.col;
      inputs[`${f2}-${c2}`]?.classList.add('cruce-activa');
    }
  }

  function avanzarCelda(f, c) {
    if (palabraActiva === null) return;
    const p = palabras[palabraActiva];
    const nf = p.dir === 'H' ? f : f + 1;
    const nc = p.dir === 'H' ? c + 1 : c;
    inputs[`${nf}-${nc}`]?.focus();
  }

  function retrocederCelda(f, c) {
    if (palabraActiva === null) return;
    const p = palabras[palabraActiva];
    const pf = p.dir === 'H' ? f : f - 1;
    const pc = p.dir === 'H' ? c - 1 : c;
    const prev = inputs[`${pf}-${pc}`];
    if (prev) { prev.value = ''; prev.focus(); }
  }

  function verificar() {
    palabrasOk.clear();
    for (let wi = 0; wi < palabras.length; wi++) {
      if (palabrasOk.has(wi)) continue;
      const p  = palabras[wi];
      let escrita = '';
      for (let k = 0; k < p.texto.length; k++) {
        const f2 = p.dir === 'H' ? p.fila : p.fila + k;
        const c2 = p.dir === 'H' ? p.col + k : p.col;
        escrita += (inputs[`${f2}-${c2}`]?.value || '').toUpperCase();
      }
      if (escrita === p.texto) {
        palabrasOk.add(wi);
        for (let k = 0; k < p.texto.length; k++) {
          const f2 = p.dir === 'H' ? p.fila : p.fila + k;
          const c2 = p.dir === 'H' ? p.col + k : p.col;
          const inp = inputs[`${f2}-${c2}`];
          // Solo marcar verde, no deshabilitar: la celda puede cruzar otra palabra
          if (inp) inp.classList.add('cruce-ok');
        }
      }
    }

    progreso.textContent = `${palabrasOk.size} / ${palabras.length} palabras`;

    if (palabrasOk.size === palabras.length) {
      btnConfirmar.textContent = '🎉 ¡Resuelto! Continuar';
      btnConfirmar.disabled = false;
    }
  }

  const progreso = document.createElement('div');
  progreso.className = 'cruce-progreso';
  progreso.textContent = `0 / ${palabras.length} palabras`;

  const btnConfirmar = document.createElement('button');
  btnConfirmar.className = 'btn-accion cian tipo-confirmar';
  btnConfirmar.textContent = 'Enviar sin completar →';
  btnConfirmar.addEventListener('click', () => {
    btnConfirmar.disabled = true;
    // Deshabilitar todos al entregar
    Object.values(inputs).forEach(i => {
      i.disabled = true;
      // Marcar en rojo celdas sin la letra correcta
      const f2 = parseInt(i.dataset.f);
      const c2 = parseInt(i.dataset.c);
      if (!i.classList.contains('cruce-ok') && i.value) {
        if (i.value.toUpperCase() !== grid[f2][c2]?.letra) {
          i.style.color = '#ff4444';
        }
      }
    });
    setTimeout(() => onConfirm(palabrasOk.size === palabras.length), 500);
  });

  contenedor.appendChild(pistasDiv);
  contenedor.appendChild(table);
  contenedor.appendChild(progreso);
  contenedor.appendChild(btnConfirmar);
}
