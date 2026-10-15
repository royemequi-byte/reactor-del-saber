// admin.js — lógica completa del panel Super Admin
import {
  getBanco, resetBanco,
  agregarPregunta, actualizarPregunta,
  eliminarPregunta, toggleActiva
} from './banco.js';
import { subirImagenPregunta } from './storage.js';

let listo = false; // evitar listeners duplicados en re-login

// ─── PUNTO DE ENTRADA ──────────────────────────────────────────────────────
export function adminInicializar() {
  actualizarContador();
  renderizarPreguntas();

  if (listo) return;
  listo = true;

  // Tabs
  document.querySelectorAll('.admin-tab').forEach(btn =>
    btn.addEventListener('click', () => cambiarTab(btn.dataset.tab))
  );

  // Filtros
  ['admin-fil-materia', 'admin-fil-grado', 'admin-fil-activa'].forEach(id =>
    document.getElementById(id).addEventListener('change', renderizarPreguntas)
  );

  // Nueva pregunta
  document.getElementById('btn-nueva-pregunta')
    .addEventListener('click', () => abrirModal(null));

  // Form
  document.getElementById('admin-form-pregunta')
    .addEventListener('submit', guardarPregunta);
  document.getElementById('btn-cancelar-form')
    .addEventListener('click', cerrarModal);
  document.getElementById('admin-modal')
    .addEventListener('click', e => { if (e.target === e.currentTarget) cerrarModal(); });

  // Imagen — subida a Firebase Storage
  document.getElementById('af-imagen-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const estado = document.getElementById('af-imagen-estado');
    const preview = document.getElementById('af-imagen-preview');
    const btnQuitar = document.getElementById('btn-quitar-imagen');
    estado.textContent = '⏳ Subiendo…';
    try {
      const url = await subirImagenPregunta(file);
      document.getElementById('af-imagen-url').value = url;
      preview.src = url;
      preview.classList.remove('oculto');
      btnQuitar.style.display = 'inline-block';
      estado.textContent = '✅ Imagen lista';
    } catch (err) {
      estado.textContent = '❌ Error al subir: ' + err.message;
    }
  });

  document.getElementById('btn-quitar-imagen').addEventListener('click', () => {
    document.getElementById('af-imagen-url').value = '';
    document.getElementById('af-imagen-file').value = '';
    document.getElementById('af-imagen-preview').classList.add('oculto');
    document.getElementById('af-imagen-preview').src = '';
    document.getElementById('btn-quitar-imagen').style.display = 'none';
    document.getElementById('af-imagen-estado').textContent = '';
  });

  // Restaurar banco original
  document.getElementById('btn-reset-banco').addEventListener('click', () => {
    if (!confirm('¿Restaurar el banco a los valores originales? Se perderán todos los cambios.')) return;
    resetBanco();
    actualizarContador();
    renderizarPreguntas();
  });

  // Ranking
  document.getElementById('btn-limpiar-ranking')
    .addEventListener('click', limpiarRanking);

  // Exportar
  document.getElementById('btn-copiar-json')
    .addEventListener('click', copiarJSON);
}

function cambiarTab(tab) {
  document.querySelectorAll('.admin-tab')
    .forEach(b => b.classList.toggle('activo', b.dataset.tab === tab));
  document.querySelectorAll('.admin-tabcontent')
    .forEach(c => c.classList.add('oculto'));
  document.getElementById(`admin-tab-${tab}`).classList.remove('oculto');

  if (tab === 'ranking')  renderizarRanking();
  if (tab === 'exportar') renderizarExportar();
}

// ─── PREGUNTAS ─────────────────────────────────────────────────────────────
function actualizarContador() {
  const banco = getBanco();
  const activas = banco.filter(p => p.activa).length;
  document.getElementById('admin-count-preguntas').textContent = `${activas}/${banco.length}`;
}

function renderizarPreguntas() {
  const materia = document.getElementById('admin-fil-materia').value;
  const grado   = document.getElementById('admin-fil-grado').value;
  const activa  = document.getElementById('admin-fil-activa').value;

  let banco = getBanco();
  if (materia)      banco = banco.filter(p => p.materia === materia);
  if (grado)        banco = banco.filter(p => String(p.grado) === grado || p.grado === 'todos');
  if (activa === '1') banco = banco.filter(p =>  p.activa);
  if (activa === '0') banco = banco.filter(p => !p.activa);

  const colores = { quimica: '#39ff14', fisica: '#00e5ff', biologia: '#ff9f1c' };
  const emojis  = { quimica: '⚗️', fisica: '⚡', biologia: '🌿' };

  const lista = document.getElementById('admin-lista');
  if (!banco.length) {
    lista.innerHTML = '<p class="admin-vacio">Sin preguntas con este filtro.</p>';
    return;
  }

  lista.innerHTML = banco.map(p => {
    const col = colores[p.materia] || '#ccc';
    const emo = emojis[p.materia]  || '';
    const snippet = p.enunciado.length > 100
      ? p.enunciado.substring(0, 100) + '…'
      : p.enunciado;
    return `
      <div class="admin-card">
        <div class="admin-card-head">
          <span class="admin-badge" style="color:${col}">${emo} ${p.materia}</span>
          <span class="admin-badge grado">G${p.grado}</span>
          <span class="admin-badge dif">D${p.dificultad}</span>
          <span class="admin-badge ${p.activa ? 'activo' : 'inactivo'}">${p.activa ? '✓ Activa' : '✗ Inactiva'}</span>
          <span class="admin-card-tema">${p.tema || ''}</span>
        </div>
        <p class="admin-card-enunciado">${snippet}</p>
        <div class="admin-card-acciones">
          <button class="btn-accion cian chico" onclick="window._adminEditar('${p.id}')">✏️ Editar</button>
          <button class="btn-accion ${p.activa ? 'gris' : 'verde'} chico" onclick="window._adminToggle('${p.id}')">
            ${p.activa ? '🔕 Desactivar' : '🔔 Activar'}
          </button>
          <button class="btn-accion rojo chico" onclick="window._adminBorrar('${p.id}')">🗑 Eliminar</button>
        </div>
      </div>`;
  }).join('');
}

// ─── MODAL CREAR / EDITAR ──────────────────────────────────────────────────
function abrirModal(id) {
  const modal  = document.getElementById('admin-modal');
  const titulo = document.getElementById('admin-modal-titulo');
  const form   = document.getElementById('admin-form-pregunta');
  form.reset();

  // Resetear área de imagen
  document.getElementById('af-imagen-url').value = '';
  document.getElementById('af-imagen-file').value = '';
  document.getElementById('af-imagen-preview').classList.add('oculto');
  document.getElementById('af-imagen-preview').src = '';
  document.getElementById('btn-quitar-imagen').style.display = 'none';
  document.getElementById('af-imagen-estado').textContent = '';

  if (id) {
    const p = getBanco().find(q => q.id === id);
    if (!p) return;
    titulo.textContent = '✏️ Editar pregunta';
    document.getElementById('af-id').value         = p.id;
    document.getElementById('af-materia').value    = p.materia;
    document.getElementById('af-grado').value      = String(p.grado);
    document.getElementById('af-dificultad').value = String(p.dificultad);
    document.getElementById('af-tema').value       = p.tema || '';
    document.getElementById('af-enunciado').value  = p.enunciado;
    document.getElementById('af-op0').value        = p.opciones[0] || '';
    document.getElementById('af-op1').value        = p.opciones[1] || '';
    document.getElementById('af-op2').value        = p.opciones[2] || '';
    document.getElementById('af-op3').value        = p.opciones[3] || '';
    const radio = form.querySelector(`input[name="af-correcta"][value="${p.correcta}"]`);
    if (radio) radio.checked = true;
    document.getElementById('af-explicacion').value = p.explicacion || '';
    document.getElementById('af-activa').checked   = !!p.activa;
    if (p.imagen) {
      document.getElementById('af-imagen-url').value = p.imagen;
      const prev = document.getElementById('af-imagen-preview');
      prev.src = p.imagen;
      prev.classList.remove('oculto');
      document.getElementById('btn-quitar-imagen').style.display = 'inline-block';
      document.getElementById('af-imagen-estado').textContent = '✅ Imagen cargada';
    }
  } else {
    titulo.textContent = '➕ Nueva pregunta';
    document.getElementById('af-id').value = '';
    document.getElementById('af-activa').checked = true;
    const r = form.querySelector('input[name="af-correcta"][value="0"]');
    if (r) r.checked = true;
  }

  modal.classList.remove('oculto');
}

function cerrarModal() {
  document.getElementById('admin-modal').classList.add('oculto');
}

function guardarPregunta(e) {
  e.preventDefault();
  const id = document.getElementById('af-id').value;
  const radioChecked = document.querySelector('input[name="af-correcta"]:checked');
  if (!radioChecked) { alert('Selecciona cuál opción es la correcta.'); return; }

  const pregunta = {
    id:         id || `P-${Date.now()}`,
    materia:    document.getElementById('af-materia').value,
    tema:       document.getElementById('af-tema').value.trim(),
    grado:      document.getElementById('af-grado').value === 'todos'
                  ? 'todos'
                  : parseInt(document.getElementById('af-grado').value),
    dificultad: parseInt(document.getElementById('af-dificultad').value),
    enunciado:  document.getElementById('af-enunciado').value.trim(),
    opciones: [
      document.getElementById('af-op0').value.trim(),
      document.getElementById('af-op1').value.trim(),
      document.getElementById('af-op2').value.trim(),
      document.getElementById('af-op3').value.trim(),
    ],
    correcta:   parseInt(radioChecked.value),
    explicacion:document.getElementById('af-explicacion').value.trim(),
    imagen:     document.getElementById('af-imagen-url').value || null,
    autor:      'admin',
    activa:     document.getElementById('af-activa').checked,
  };

  if (id) {
    actualizarPregunta(id, pregunta);
  } else {
    agregarPregunta(pregunta);
  }

  cerrarModal();
  actualizarContador();
  renderizarPreguntas();
}

// Expuestas en window para los onclick en HTML dinámico
window._adminEditar = (id) => abrirModal(id);
window._adminToggle = (id) => {
  toggleActiva(id);
  actualizarContador();
  renderizarPreguntas();
};
window._adminBorrar = (id) => {
  if (!confirm('¿Eliminar esta pregunta del banco?')) return;
  eliminarPregunta(id);
  actualizarContador();
  renderizarPreguntas();
};

// ─── RANKING ───────────────────────────────────────────────────────────────
function renderizarRanking() {
  const datos = JSON.parse(localStorage.getItem('ranking') || '[]');
  const lista = document.getElementById('admin-ranking-lista');

  if (!datos.length) {
    lista.innerHTML = '<p class="admin-vacio">El ranking está vacío.</p>';
    return;
  }

  lista.innerHTML = `
    <table class="ranking-tabla" style="margin-top:14px">
      <thead>
        <tr>
          <th>#</th><th>Nombre</th><th>Avatar</th>
          <th>Grado</th><th>Curso</th><th>Pts</th><th>Nota</th><th>Fecha</th><th></th>
        </tr>
      </thead>
      <tbody>
        ${datos.map((r, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${r.nombre}</td>
            <td>${r.avatar}</td>
            <td>${r.grado}°</td>
            <td>${r.curso}</td>
            <td>${Number(r.puntaje).toLocaleString('es-CO')}</td>
            <td>${r.nota}</td>
            <td>${r.fecha || '—'}</td>
            <td><button class="btn-accion rojo chico" onclick="window._adminBorrarEntrada(${i})">🗑</button></td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

function limpiarRanking() {
  if (!confirm('¿Eliminar TODO el ranking? Esta acción no se puede deshacer.')) return;
  localStorage.removeItem('ranking');
  renderizarRanking();
}

window._adminBorrarEntrada = (idx) => {
  const datos = JSON.parse(localStorage.getItem('ranking') || '[]');
  datos.splice(idx, 1);
  localStorage.setItem('ranking', JSON.stringify(datos));
  renderizarRanking();
};

// ─── EXPORTAR ──────────────────────────────────────────────────────────────
function renderizarExportar() {
  const banco = getBanco();
  document.getElementById('admin-json-pre').textContent = JSON.stringify(banco, null, 2);
}

function copiarJSON() {
  const texto = document.getElementById('admin-json-pre').textContent;
  navigator.clipboard.writeText(texto).then(() => {
    const btn = document.getElementById('btn-copiar-json');
    const original = btn.textContent;
    btn.textContent = '✅ ¡Copiado!';
    setTimeout(() => { btn.textContent = original; }, 2500);
  });
}
