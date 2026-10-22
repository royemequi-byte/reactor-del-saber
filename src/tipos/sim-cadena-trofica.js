// sim-cadena-trofica.js — Simulador Biología Grado 8
export function iniciarSimCadenaTrofica(container) {
  const NIVELES = [
    { id:'carniv',  emoji:'🦊', nombre:'Carnívoros',     sub:'Depredadores tope',         color:'#ff7043' },
    { id:'herbiv',  emoji:'🐛', nombre:'Herbívoros',     sub:'Consumidores primarios',    color:'#ffd54f' },
    { id:'product', emoji:'🌿', nombre:'Productores',    sub:'Fotosíntesis',              color:'#66bb6a' },
    { id:'descomp', emoji:'🍄', nombre:'Descomponedores',sub:'Reciclaje de nutrientes',   color:'#8d6e63' },
  ];

  const EFECTOS = {
    descomp: { carniv:90,  herbiv:75,  product:35,  msg:'⚠ Sin descomponedores, los nutrientes no regresan al suelo → los productores se agotan → toda la cadena colapsa.' },
    product: { carniv:15,  herbiv:5,   descomp:160, msg:'⚠ Sin productores, los herbívoros desaparecen → carnívoros colapsan. Los descomponedores aumentan por la materia muerta.' },
    herbiv:  { carniv:10,  product:180,descomp:110, msg:'⚠ Sin herbívoros, los carnívoros colapsan. Las plantas se disparan sin control (superpoblación vegetal).' },
    carniv:  { herbiv:185, product:20, descomp:120, msg:'⚠ Sin carnívoros, los herbívoros se disparan → devoran toda la vegetación → productores colapsan.' },
  };

  let eliminados = new Set();

  function calcularEstado() {
    const est = { carniv:100, herbiv:100, product:100, descomp:100 };
    eliminados.forEach(id => {
      const ef = EFECTOS[id];
      Object.keys(ef).forEach(k => {
        if (k === 'msg') return;
        if (!eliminados.has(k)) est[k] = Math.min(est[k], ef[k]);
      });
      est[id] = 0;
    });
    return est;
  }

  function getMensaje() {
    if (eliminados.size === 0) return 'Elimina una especie para ver el efecto cascada en el ecosistema.';
    return [...eliminados].map(id => EFECTOS[id].msg).join(' ');
  }

  function render() {
    const estado = calcularEstado();
    container.innerHTML = `
      <div class="sim-wrap sim-eco">
        <div class="sim-head">
          <span class="sim-titulo-txt">🌿 Simulador — Pirámide Trófica · Efecto Cascada</span>
          <span class="sim-instruccion">Presiona ✕ Eliminar para ver qué pasa</span>
        </div>
        <div class="sim-eco-grid" id="sim-eco-inner"></div>
        <div class="sim-eco-resumen" id="sim-eco-resumen"></div>
        <button class="sim-eco-reset" id="sim-eco-reset">↺ Restaurar ecosistema original</button>
      </div>`;

    const grid = container.querySelector('#sim-eco-inner');

    NIVELES.forEach((niv, i) => {
      if (i > 0) {
        const fl = document.createElement('div');
        fl.className = 'sim-eco-flecha';
        fl.textContent = '↑ energía / materia ↑';
        grid.appendChild(fl);
      }

      const v = Math.round(estado[niv.id]);
      const esEliminado = eliminados.has(niv.id);
      const esColapso   = !esEliminado && v < 30;
      const esExplosion = !esEliminado && v > 140;
      const barCol = esEliminado ? '#333' : esColapso ? '#ff5252' : esExplosion ? '#ff9800' : niv.color;

      const row = document.createElement('div');
      row.className = 'sim-eco-row'
        + (esEliminado ? ' eco-eliminado' : '')
        + (esColapso   ? ' eco-colapso'   : '')
        + (esExplosion ? ' eco-explosion' : '');

      row.innerHTML = `
        <div class="sim-eco-info">
          <span class="sim-eco-emoji">${niv.emoji}</span>
          <div>
            <div class="sim-eco-nombre">${niv.nombre}</div>
            <div class="sim-eco-sub">${niv.sub}</div>
          </div>
        </div>
        <div class="sim-eco-barra-wrap">
          <div class="sim-eco-barra-bg"></div>
          <div class="sim-eco-barra-fill" style="width:${Math.min(100, v/2)}%;background:${barCol};box-shadow:0 0 8px ${barCol}66"></div>
          <div class="sim-eco-barra-lbl" style="color:${barCol}">${esEliminado ? 'ELIMINADO' : v + '%'}</div>
          ${esColapso   ? `<div class="sim-eco-alerta" style="color:#ff5252">⚠ COLAPSO</div>` : ''}
          ${esExplosion ? `<div class="sim-eco-alerta" style="color:#ff9800">▲ EXPLOSIÓN</div>` : ''}
        </div>
        <button class="sim-eco-btn ${esEliminado ? 'eco-btn-restaurar' : 'eco-btn-eliminar'}" data-id="${niv.id}">
          ${esEliminado ? '✓ Restaurar' : '✕ Eliminar'}
        </button>`;

      grid.appendChild(row);
    });

    container.querySelector('#sim-eco-resumen').textContent = getMensaje();

    container.querySelector('#sim-eco-reset').addEventListener('click', () => {
      eliminados.clear(); render();
    });
    container.querySelectorAll('[data-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (eliminados.has(id)) eliminados.delete(id); else eliminados.add(id);
        render();
      });
    });
  }

  render();
  return () => { container.innerHTML = ''; };
}
