// relacionar.js — conectar pares con código de color
const COLORES = ['#00e5ff', '#ffd600', '#39ff14', '#ff00c8', '#ff6b35'];

export function renderRelacionar(pregunta, contenedor, onConfirm) {
  const pares = pregunta.pares;
  const n = pares.length;

  // Mezclar columna derecha
  const idxDer = [...Array(n).keys()].sort(() => Math.random() - 0.5);

  let selIzq = null;
  const conexiones = new Map(); // izqIdx → { derIdx, color }

  // Instrucción
  const instruccion = document.createElement('p');
  instruccion.className = 'rel-instruccion';
  instruccion.textContent = 'Toca un elemento izquierdo, luego su par derecho para conectarlos';
  contenedor.appendChild(instruccion);

  const wrapper = document.createElement('div');
  wrapper.className = 'rel-wrapper';

  const colIzq = document.createElement('div');
  colIzq.className = 'rel-col rel-izq';

  const colDer = document.createElement('div');
  colDer.className = 'rel-col rel-der';

  // Columna izquierda
  pares.forEach((par, i) => {
    const btn = document.createElement('button');
    btn.className = 'rel-item';
    btn.textContent = par.izq;
    btn.addEventListener('click', () => {
      if (selIzq === i) {
        selIzq = null;
        btn.classList.remove('rel-sel');
        return;
      }
      colIzq.querySelectorAll('.rel-sel').forEach(el => el.classList.remove('rel-sel'));
      selIzq = i;
      btn.classList.add('rel-sel');
    });
    colIzq.appendChild(btn);
  });

  // Columna derecha (mezclada)
  idxDer.forEach(realIdx => {
    const btn = document.createElement('button');
    btn.className = 'rel-item';
    btn.textContent = pares[realIdx].der;
    btn._relReal = realIdx;
    btn.addEventListener('click', () => {
      if (selIzq === null) {
        btn.classList.add('rel-shake');
        setTimeout(() => btn.classList.remove('rel-shake'), 400);
        return;
      }

      const color = COLORES[selIzq % COLORES.length];

      // Limpiar conexión anterior de este izq
      const anterior = conexiones.get(selIzq);
      if (anterior !== undefined) {
        const viejoBtn = [...colDer.querySelectorAll('.rel-item')]
          .find(el => el._relReal === anterior);
        if (viejoBtn) { viejoBtn.style.borderColor = ''; viejoBtn.style.color = ''; viejoBtn.style.background = ''; }
      }

      // Limpiar si otro izq ya apuntaba a este der
      for (const [k, v] of conexiones.entries()) {
        if (v === realIdx && k !== selIzq) {
          const viejoIzq = colIzq.querySelectorAll('.rel-item')[k];
          if (viejoIzq) { viejoIzq.style.borderColor = ''; viejoIzq.style.color = ''; viejoIzq.style.background = ''; }
          conexiones.delete(k);
          break;
        }
      }

      conexiones.set(selIzq, realIdx);

      // Aplicar color
      const izqBtn = colIzq.querySelectorAll('.rel-item')[selIzq];
      const bg = color + '22';
      izqBtn.style.borderColor = color; izqBtn.style.color = color; izqBtn.style.background = bg;
      btn.style.borderColor = color;    btn.style.color = color;    btn.style.background = bg;

      selIzq = null;
      colIzq.querySelectorAll('.rel-sel').forEach(el => el.classList.remove('rel-sel'));

      btnConfirmar.disabled = conexiones.size < n;
    });
    colDer.appendChild(btn);
  });

  wrapper.appendChild(colIzq);
  wrapper.appendChild(colDer);
  contenedor.appendChild(wrapper);

  const btnConfirmar = document.createElement('button');
  btnConfirmar.className = 'btn-accion cian tipo-confirmar';
  btnConfirmar.textContent = '✓ Confirmar relaciones';
  btnConfirmar.disabled = true;
  btnConfirmar.addEventListener('click', () => {
    btnConfirmar.disabled = true;
    let correctas = 0;
    for (const [izqIdx, derIdx] of conexiones.entries()) {
      const esOk = izqIdx === derIdx;
      if (esOk) correctas++;
      const izqBtn = colIzq.querySelectorAll('.rel-item')[izqIdx];
      const derBtn = [...colDer.querySelectorAll('.rel-item')].find(el => el._relReal === derIdx);
      const color  = esOk ? '#39ff14' : '#ff4444';
      if (izqBtn) { izqBtn.style.borderColor = color; izqBtn.style.color = color; }
      if (derBtn) { derBtn.style.borderColor = color; derBtn.style.color = color; }
    }
    setTimeout(() => onConfirm(correctas === n), 900);
  });
  contenedor.appendChild(btnConfirmar);
}
