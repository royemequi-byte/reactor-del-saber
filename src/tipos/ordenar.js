// ordenar.js — tocar elementos en el orden correcto
export function renderOrdenar(pregunta, contenedor, onConfirm) {
  const itemsOriginales = pregunta.items;
  const ordenCorrecto   = pregunta.orden; // índices en el orden correcto

  // Mezclar para visualización
  const posiciones = [...Array(itemsOriginales.length).keys()]
    .sort(() => Math.random() - 0.5);

  const secuencia = []; // índices originales tapados en orden
  let botones = [];

  const instruccion = document.createElement('p');
  instruccion.className = 'ord-instruccion';
  instruccion.textContent = `Toca los ${itemsOriginales.length} elementos en el orden correcto (1°, 2°, 3°…)`;
  contenedor.appendChild(instruccion);

  const wrapper = document.createElement('div');
  wrapper.className = 'ord-wrapper';

  posiciones.forEach(realIdx => {
    const btn = document.createElement('button');
    btn.className = 'ord-item';
    btn.textContent = itemsOriginales[realIdx];
    btn._ordReal = realIdx;
    btn.addEventListener('click', () => {
      if (btn.disabled || btn.classList.contains('ord-sel')) return;
      secuencia.push(realIdx);
      btn.classList.add('ord-sel');
      btn.disabled = true;

      const badge = document.createElement('span');
      badge.className = 'ord-badge';
      badge.textContent = secuencia.length;
      btn.prepend(badge);

      if (secuencia.length === itemsOriginales.length) {
        btnConfirmar.disabled = false;
      }
    });
    wrapper.appendChild(btn);
    botones.push(btn);
  });

  const acciones = document.createElement('div');
  acciones.className = 'ord-acciones';

  const btnReset = document.createElement('button');
  btnReset.className = 'btn-accion gris';
  btnReset.textContent = '↺ Reiniciar';
  btnReset.addEventListener('click', () => {
    secuencia.length = 0;
    botones.forEach(btn => {
      btn.disabled = false;
      btn.classList.remove('ord-sel', 'ord-ok', 'ord-mal');
      const badge = btn.querySelector('.ord-badge');
      if (badge) badge.remove();
    });
    btnConfirmar.disabled = true;
  });

  const btnConfirmar = document.createElement('button');
  btnConfirmar.className = 'btn-accion cian tipo-confirmar';
  btnConfirmar.textContent = '✓ Confirmar orden';
  btnConfirmar.disabled = true;
  btnConfirmar.addEventListener('click', () => {
    btnConfirmar.disabled = true;
    btnReset.disabled = true;

    const esCorrecta = secuencia.every((idx, pos) => idx === ordenCorrecto[pos]);

    botones.forEach(btn => {
      const posEnSec = secuencia.indexOf(btn._ordReal);
      const posOk    = ordenCorrecto.indexOf(btn._ordReal);
      btn.classList.add(posEnSec === posOk ? 'ord-ok' : 'ord-mal');
    });

    setTimeout(() => onConfirm(esCorrecta), 900);
  });

  acciones.appendChild(btnReset);
  acciones.appendChild(btnConfirmar);

  contenedor.appendChild(wrapper);
  contenedor.appendChild(acciones);
}
