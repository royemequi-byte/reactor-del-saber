// clasifica.js — arrastrar (tap) elementos a la categoría correcta
export function renderClasifica(pregunta, contenedor, onConfirm) {
  const { categorias, items } = pregunta;

  // Mezclar items
  const mezclados = [...items].sort(() => Math.random() - 0.5);
  const asignaciones = new Map(); // índice en mezclados → índice de categoría

  let selIdx = null; // índice en mezclados actualmente seleccionado

  const instruccion = document.createElement('p');
  instruccion.className = 'clas-instruccion';
  instruccion.textContent = '① Toca un elemento · ② Toca la categoría donde pertenece';
  contenedor.appendChild(instruccion);

  // Zonas de categorías
  const catWrap = document.createElement('div');
  catWrap.className = 'clas-categorias';
  catWrap.style.gridTemplateColumns = `repeat(${categorias.length}, 1fr)`;

  categorias.forEach((nombre, catIdx) => {
    const zona = document.createElement('div');
    zona.className = 'clas-zona';
    zona.dataset.cat = catIdx;

    const titulo = document.createElement('div');
    titulo.className = 'clas-zona-titulo';
    titulo.textContent = nombre;
    zona.appendChild(titulo);

    const lista = document.createElement('div');
    lista.className = 'clas-zona-lista';
    lista.dataset.catLista = catIdx;
    zona.appendChild(lista);

    zona.addEventListener('click', () => {
      if (selIdx === null) return;

      // Quitar de zona anterior si ya estaba asignado
      const prevCat = asignaciones.get(selIdx);
      if (prevCat !== undefined) {
        const prevLista = contenedor.querySelector(`[data-cat-lista="${prevCat}"]`);
        const prevChip  = prevLista?.querySelector(`[data-mezcla-idx="${selIdx}"]`);
        if (prevChip) prevChip.remove();
      }

      asignaciones.set(selIdx, catIdx);

      // Crear chip en la zona
      const chip = document.createElement('div');
      chip.className = 'clas-chip';
      chip.textContent = mezclados[selIdx].texto;
      chip.dataset.mezclaIdx = selIdx;
      chip.title = 'Clic para devolver al banco';
      chip.addEventListener('click', e => {
        e.stopPropagation();
        const mi = parseInt(chip.dataset.mezclaIdx);
        asignaciones.delete(mi);
        chip.remove();
        const origBtn = pool.querySelector(`button[data-mi="${mi}"]`);
        if (origBtn) origBtn.classList.remove('clas-usado');
        actualizarConfirmar();
      });
      lista.appendChild(chip);

      // Marcar el botón del pool como usado
      const origBtn = pool.querySelector(`button[data-mi="${selIdx}"]`);
      if (origBtn) origBtn.classList.add('clas-usado');

      // Limpiar selección
      selIdx = null;
      pool.querySelectorAll('.clas-item-sel').forEach(b => b.classList.remove('clas-item-sel'));

      actualizarConfirmar();
    });

    catWrap.appendChild(zona);
  });

  // Pool de items
  const pool = document.createElement('div');
  pool.className = 'clas-pool';

  mezclados.forEach((item, mi) => {
    const btn = document.createElement('button');
    btn.className = 'clas-item';
    btn.textContent = item.texto;
    btn.dataset.mi = mi;
    btn.addEventListener('click', () => {
      if (btn.classList.contains('clas-usado')) return;
      if (selIdx === mi) {
        selIdx = null;
        btn.classList.remove('clas-item-sel');
        return;
      }
      pool.querySelectorAll('.clas-item-sel').forEach(b => b.classList.remove('clas-item-sel'));
      selIdx = mi;
      btn.classList.add('clas-item-sel');
    });
    pool.appendChild(btn);
  });

  const btnConfirmar = document.createElement('button');
  btnConfirmar.className = 'btn-accion cian tipo-confirmar';
  btnConfirmar.textContent = '✓ Confirmar clasificación';
  btnConfirmar.disabled = true;

  function actualizarConfirmar() {
    btnConfirmar.disabled = asignaciones.size < mezclados.length;
  }

  btnConfirmar.addEventListener('click', () => {
    btnConfirmar.disabled = true;

    let correctas = 0;
    mezclados.forEach((item, mi) => {
      const asignada = asignaciones.get(mi);
      const ok = asignada === item.cat;
      if (ok) correctas++;

      const chip = contenedor.querySelector(`[data-mezcla-idx="${mi}"]`);
      if (chip) chip.classList.add(ok ? 'clas-ok' : 'clas-mal');
    });

    setTimeout(() => onConfirm(correctas === mezclados.length), 900);
  });

  contenedor.appendChild(catWrap);
  contenedor.appendChild(pool);
  contenedor.appendChild(btnConfirmar);
}
