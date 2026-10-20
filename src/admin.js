// admin.js — lógica completa del panel Super Admin
import {
  getBanco, resetBanco,
  agregarPregunta, actualizarPregunta,
  eliminarPregunta, toggleActiva
} from './banco.js';
import { subirImagenPregunta } from './storage.js';
import * as XLSX from 'xlsx';
import { db } from './firebase.js';
import { ref, get, set, onValue } from 'firebase/database';
import Chart from 'chart.js/auto';
import './estilos/indicadores.css';

let listo = false; // evitar listeners duplicados en re-login

// ─── CONTROL DE ACCESO ─────────────────────────────────────────────────────
function iniciarControlAcceso() {
  const btnToggle  = document.getElementById('btn-toggle-acceso');
  const textoEstado = document.getElementById('acceso-estado-texto');

  function aplicarEstado(habilitado) {
    if (habilitado) {
      btnToggle.textContent  = '🔴 Deshabilitar';
      btnToggle.style.background = '#c0392b';
      btnToggle.style.color  = '#fff';
      textoEstado.textContent = '✅ Los estudiantes pueden ingresar ahora';
      textoEstado.style.color = '#39ff14';
    } else {
      btnToggle.textContent  = '🟢 Habilitar acceso';
      btnToggle.style.background = '#27ae60';
      btnToggle.style.color  = '#fff';
      textoEstado.textContent = '🔒 Bloqueado — los estudiantes no pueden entrar';
      textoEstado.style.color = '#ffd600';
    }
  }

  // Leer estado actual y escuchar cambios
  onValue(ref(db, 'config/habilitado'), snap => {
    aplicarEstado(snap.val() === true);
  });

  btnToggle.addEventListener('click', async () => {
    const snap  = await get(ref(db, 'config/habilitado'));
    const actual = snap.val() === true;
    if (actual) {
      const guardar = confirm(
        '¿Guardar el historial de esta actividad?\n\n' +
        'Aceptar  →  Cerrar y guardar historial\n' +
        'Cancelar →  Solo deshabilitar sin guardar'
      );
      if (guardar) await guardarHistorialActividad();
    }
    await set(ref(db, 'config/habilitado'), !actual);
  });
}

// ─── GUARDAR HISTORIAL DE ACTIVIDAD ────────────────────────────────────────
async function guardarHistorialActividad() {
  const [snapEst, snapCuotas] = await Promise.all([
    get(ref(db, 'actividad-actual/estudiantes')),
    get(ref(db, 'config/cuotas')),
  ]);
  const estudiantes = snapEst.val() || {};
  const cuotas      = snapCuotas.val() || {};
  const ahora       = new Date();
  const key = ahora.toISOString().slice(0, 19).replace(/[T:]/g, '-');
  await set(ref(db, `historial/${key}`), {
    fecha:             ahora.toLocaleDateString('es-CO'),
    hora:              ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    timestamp:         ahora.getTime(),
    totalEstudiantes:  Object.keys(estudiantes).length,
    cuotas,
    estudiantes,
  });
  // Limpiar monitor para la próxima sesión
  await set(ref(db, 'actividad-actual/estudiantes'), null);
}

// ─── MOSTRAR RESPUESTAS (MODO OLIMPIADA) ──────────────────────────────────
function iniciarMostrarRespuestas() {
  const btnToggle = document.getElementById('btn-toggle-respuestas');
  const textoEl   = document.getElementById('respuestas-estado-texto');

  function aplicar(mostrar) {
    if (mostrar) {
      btnToggle.textContent      = '🟢 Ocultar respuestas';
      btnToggle.style.background = '#c0392b';
      btnToggle.style.color      = '#fff';
      textoEl.textContent        = '✅ Los estudiantes ven si acertaron o fallaron';
      textoEl.style.color        = '#39ff14';
    } else {
      btnToggle.textContent      = '🔴 Mostrar respuestas';
      btnToggle.style.background = '#27ae60';
      btnToggle.style.color      = '#fff';
      textoEl.textContent        = '🏆 Modo olimpiada — sin retroalimentación';
      textoEl.style.color        = '#ffd600';
    }
  }

  onValue(ref(db, 'config/mostrarRespuestas'), snap => {
    aplicar(snap.val() !== false);
  });

  btnToggle.addEventListener('click', async () => {
    const snap  = await get(ref(db, 'config/mostrarRespuestas'));
    const actual = snap.val() !== false;
    await set(ref(db, 'config/mostrarRespuestas'), !actual);
  });
}

// ─── DESHABILITAR AYUDAS ──────────────────────────────────────────────────
function iniciarAyudas() {
  const btnToggle = document.getElementById('btn-toggle-ayudas');
  const textoEl   = document.getElementById('ayudas-estado-texto');

  function aplicar(activas) {
    if (activas) {
      btnToggle.textContent      = '🟢 Deshabilitar ayudas';
      btnToggle.style.background = '#c0392b';
      btnToggle.style.color      = '#fff';
      textoEl.textContent        = '✅ Los estudiantes pueden usar 🧬 ⏸️ 🔄 durante el examen';
      textoEl.style.color        = '#39ff14';
    } else {
      btnToggle.textContent      = '🔴 Habilitar ayudas';
      btnToggle.style.background = '#27ae60';
      btnToggle.style.color      = '#fff';
      textoEl.textContent        = '🏆 Modo concurso — sin ayudas ni poderes';
      textoEl.style.color        = '#ffd600';
    }
  }

  onValue(ref(db, 'config/ayudasActivas'), snap => {
    aplicar(snap.val() !== false);
  });

  btnToggle.addEventListener('click', async () => {
    const snap   = await get(ref(db, 'config/ayudasActivas'));
    const actual = snap.val() !== false;
    await set(ref(db, 'config/ayudasActivas'), !actual);
  });
}

// ─── CUOTAS POR MATERIA ────────────────────────────────────────────────────
const MATERIAS_POR_GRADO = {
  8:  ['biologia', 'fisica', 'quimica', 'cts', 'razonamiento'],
  9:  ['biologia', 'fisica', 'quimica', 'cts', 'razonamiento'],
  10: ['quimica', 'fisica', 'biologia', 'cts', 'razonamiento'],
};

function actualizarTotal(grado) {
  const total = MATERIAS_POR_GRADO[grado].reduce((s, m) => {
    return s + (parseInt(document.getElementById(`c${grado}-${m}`)?.value) || 0);
  }, 0);
  const el = document.getElementById(`c${grado}-total`);
  if (el) el.textContent = total;
}

function iniciarCuotas() {
  // Tabs de grado
  document.querySelectorAll('.cuotas-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const grado = btn.dataset.grado;
      document.querySelectorAll('.cuotas-tab').forEach(b => {
        b.style.background = b === btn ? '#39ff14' : '#333';
        b.style.color      = b === btn ? '#000'    : '#ccc';
        b.style.fontWeight = b === btn ? '700'     : '600';
      });
      document.querySelectorAll('.cuotas-panel').forEach(p => {
        p.classList.toggle('oculto', p.dataset.grado !== grado);
      });
    });
  });

  // Cargar valores desde Firebase y mantener sincronizados
  onValue(ref(db, 'config/cuotas'), snap => {
    const cuotas = snap.val() || {};
    [8, 9, 10].forEach(g => {
      const c = cuotas[`grado${g}`] || {};
      MATERIAS_POR_GRADO[g].forEach(m => {
        const inp = document.getElementById(`c${g}-${m}`);
        if (inp && c[m] !== undefined) inp.value = c[m];
      });
      actualizarTotal(g);
    });
  });

  // Inputs → actualizar total en tiempo real
  [8, 9, 10].forEach(g => {
    MATERIAS_POR_GRADO[g].forEach(m => {
      document.getElementById(`c${g}-${m}`)
        ?.addEventListener('input', () => actualizarTotal(g));
    });

    // Botón guardar
    document.getElementById(`btn-guardar-cuotas-${g}`)
      ?.addEventListener('click', async () => {
        const estadoEl = document.getElementById(`cuotas-${g}-estado`);
        const cuota    = {};
        MATERIAS_POR_GRADO[g].forEach(m => {
          cuota[m] = parseInt(document.getElementById(`c${g}-${m}`)?.value) || 0;
        });
        try {
          await set(ref(db, `config/cuotas/grado${g}`), cuota);
          estadoEl.textContent = '✅ Guardado';
          setTimeout(() => { estadoEl.textContent = ''; }, 2500);
        } catch (err) {
          estadoEl.textContent = '❌ ' + err.message;
        }
      });
  });
}

// ─── PUNTO DE ENTRADA ──────────────────────────────────────────────────────
export function adminInicializar() {
  actualizarContador();
  renderizarPreguntas();
  iniciarControlAcceso();
  iniciarMostrarRespuestas();
  iniciarAyudas();
  iniciarCuotas();

  if (listo) return;
  listo = true;

  // Tabs
  document.querySelectorAll('.admin-tab').forEach(btn =>
    btn.addEventListener('click', () => cambiarTab(btn.dataset.tab))
  );

  // Filtros
  ['admin-fil-materia', 'admin-fil-grado', 'admin-fil-activa', 'admin-fil-origen'].forEach(id =>
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

  // Imagen 1 — subida a Firebase Storage
  document.getElementById('af-imagen-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const estadoEl = document.getElementById('af-imagen-estado');
    const preview  = document.getElementById('af-imagen-preview');
    const btnQ     = document.getElementById('btn-quitar-imagen');
    estadoEl.textContent = '⏳ Subiendo…';
    try {
      const url = await subirImagenPregunta(file);
      document.getElementById('af-imagen-url').value = url;
      preview.src = url;
      preview.classList.remove('oculto');
      btnQ.style.display = 'inline-block';
      estadoEl.textContent = '✅ Imagen lista';
    } catch (err) {
      estadoEl.textContent = '❌ Error al subir: ' + err.message;
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

  // Imagen 2 — subida a Firebase Storage
  document.getElementById('af-imagen2-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const estadoEl = document.getElementById('af-imagen2-estado');
    const preview  = document.getElementById('af-imagen2-preview');
    const btnQ     = document.getElementById('btn-quitar-imagen2');
    estadoEl.textContent = '⏳ Subiendo…';
    try {
      const url = await subirImagenPregunta(file);
      document.getElementById('af-imagen2-url').value = url;
      preview.src = url;
      preview.classList.remove('oculto');
      btnQ.style.display = 'inline-block';
      estadoEl.textContent = '✅ Imagen 2 lista';
    } catch (err) {
      estadoEl.textContent = '❌ Error al subir: ' + err.message;
    }
  });

  document.getElementById('btn-quitar-imagen2').addEventListener('click', () => {
    document.getElementById('af-imagen2-url').value = '';
    document.getElementById('af-imagen2-file').value = '';
    document.getElementById('af-imagen2-preview').classList.add('oculto');
    document.getElementById('af-imagen2-preview').src = '';
    document.getElementById('btn-quitar-imagen2').style.display = 'none';
    document.getElementById('af-imagen2-estado').textContent = '';
  });

  // Restaurar banco original
  document.getElementById('btn-reset-banco').addEventListener('click', () => {
    if (!confirm('¿Sincronizar banco? Se agregarán las preguntas base que falten. Las preguntas existentes NO se eliminan.')) return;
    resetBanco();
    actualizarContador();
    renderizarPreguntas();
  });

  document.getElementById('btn-descargar-excel')
    .addEventListener('click', descargarExcel);

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

  if (tab === 'exportar')    renderizarExportar();
  if (tab === 'monitor')     iniciarMonitorTab();
  if (tab === 'historial')   renderizarHistorial();
  if (tab === 'indicadores') renderIndicadores();
}

// ─── MONITOR EN TIEMPO REAL ────────────────────────────────────────────────
let _monitorActivo = false;

function iniciarMonitorTab() {
  document.getElementById('btn-limpiar-monitor')
    ?.addEventListener('click', async () => {
      if (!confirm('¿Limpiar el monitor para empezar una nueva actividad?')) return;
      await set(ref(db, 'actividad-actual/estudiantes'), null);
    });

  if (_monitorActivo) return;
  _monitorActivo = true;
  onValue(ref(db, 'actividad-actual/estudiantes'), snap => {
    renderizarMonitor(snap.val() || {});
  });
}

function fmtTiempo(s) {
  if (!s) return '—';
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`;
}

function renderizarMonitor(obj) {
  const todos      = Object.values(obj);
  const terminados = todos.filter(e => e.estado === 'terminado');
  const jugando    = todos.filter(e => e.estado === 'jugando');

  const contEl = document.getElementById('monitor-contador');
  if (contEl) contEl.textContent =
    `${todos.length} inscritos · ${jugando.length} en examen · ${terminados.length} terminaron`;

  const lista = document.getElementById('monitor-lista');
  if (!lista) return;

  if (!todos.length) {
    lista.innerHTML = '<p class="admin-vacio">Sin estudiantes aún — esperando inscripciones…</p>';
    return;
  }

  // Agrupar por grado + curso
  const grupos = {};
  todos.forEach(e => {
    const clave = `${e.grado}-${e.curso}`;
    if (!grupos[clave]) grupos[clave] = { grado: e.grado, curso: e.curso, estudiantes: [] };
    grupos[clave].estudiantes.push(e);
  });
  const gruposOrdenados = Object.values(grupos)
    .sort((a, b) => a.grado - b.grado || String(a.curso).localeCompare(String(b.curso)));

  const meds = { 0: '🥇', 1: '🥈', 2: '🥉' };
  const css  = { 0: 'top1', 1: 'top2', 2: 'top3' };

  const fila = (e, i, conRanking) => `
    <tr class="${css[i] ?? ''}">
      <td>${conRanking ? (meds[i] ?? i + 1) : '—'}</td>
      <td>${e.nombre}</td><td>${e.avatar}</td>
      <td><span class="estado-badge ${e.estado}">${
        e.estado === 'terminado' ? '✅ Terminó' :
        e.estado === 'jugando'   ? '🎯 En examen' : '⏳ Inscrito'
      }</span></td>
      <td>${conRanking && e.puntaje != null ? Number(e.puntaje).toLocaleString('es-CO') : '—'}</td>
      <td>${conRanking && e.nota    != null ? e.nota + '/500' : '—'}</td>
      <td>${conRanking ? fmtTiempo(e.tiempo) : '—'}</td>
    </tr>`;

  lista.innerHTML = gruposOrdenados.map(g => {
    const term = g.estudiantes
      .filter(e => e.estado === 'terminado')
      .sort((a, b) => (b.puntaje || 0) - (a.puntaje || 0));
    const jug  = g.estudiantes.filter(e => e.estado === 'jugando');
    const insc = g.estudiantes.filter(e => e.estado === 'inscrito');

    return `
      <div style="margin-bottom:22px">
        <div style="font-weight:700;font-size:1rem;color:#ffd600;padding:7px 12px;background:#1a1a2e;border-radius:8px;margin-bottom:8px;display:flex;align-items:center;gap:14px;flex-wrap:wrap">
          📚 Grado ${g.grado}° &nbsp;·&nbsp; Curso ${g.curso}
          <span style="font-size:0.8rem;color:#8ab;font-weight:400">
            ${term.length} terminaron &nbsp;·&nbsp; ${jug.length} en examen &nbsp;·&nbsp; ${insc.length} inscritos
          </span>
        </div>
        <table class="ranking-tabla">
          <thead><tr>
            <th>#</th><th>Nombre</th><th>Avatar</th>
            <th>Estado</th><th>Pts</th><th>Nota</th><th>Tiempo</th>
          </tr></thead>
          <tbody>
            ${term.map((e, i) => fila(e, i, true)).join('')}
            ${jug.map(e  => fila(e, -1, false)).join('')}
            ${insc.map(e => fila(e, -1, false)).join('')}
          </tbody>
        </table>
      </div>`;
  }).join('');
}

// ─── HISTORIAL DE ACTIVIDADES ──────────────────────────────────────────────
let _historialData = {};

function renderizarHistorial() {
  const lista = document.getElementById('historial-lista');
  if (!lista) return;
  lista.innerHTML = '<p class="admin-vacio">Cargando…</p>';

  get(ref(db, 'historial')).then(snap => {
    if (!snap.exists()) {
      lista.innerHTML = '<p class="admin-vacio">Aún no hay actividades guardadas.</p>';
      return;
    }
    _historialData = {};
    const entradas = Object.entries(snap.val())
      .map(([key, val]) => ({ key, ...val }))
      .sort((a, b) => b.timestamp - a.timestamp);

    entradas.forEach(e => { _historialData[e.key] = e; });

    lista.innerHTML = entradas.map((e, i) => {
      const est      = Object.values(e.estudiantes || {});
      const term     = est.filter(s => s.estado === 'terminado');
      const notas    = term.map(s => Number(s.nota) || 0);
      const promNota = notas.length ? Math.round(notas.reduce((a, b) => a + b, 0) / notas.length) : 0;
      const maxNota  = notas.length ? Math.max(...notas) : 0;
      return `
        <div class="admin-card" style="margin-bottom:12px">
          <div class="admin-card-head" style="cursor:pointer;flex-wrap:wrap;gap:6px"
               onclick="window._toggleH('hi${i}')">
            <span class="admin-badge num">📅 ${e.fecha}</span>
            <span class="admin-badge" style="color:#00e5ff">🕐 ${e.hora}</span>
            <span class="admin-badge grado">${e.totalEstudiantes} participantes</span>
            <span class="admin-badge dif">${term.length} completaron</span>
            <span class="admin-badge" style="color:#39ff14">Prom: ${promNota}/500</span>
            <span class="admin-badge" style="color:#ffd600">Mejor: ${maxNota}/500</span>
            <span style="margin-left:auto;color:#8ab;font-size:0.82rem">▼ Ver detalle</span>
          </div>
          <div id="hi${i}" class="oculto" style="margin-top:14px">
            ${renderDetalleAct(e)}
          </div>
        </div>`;
    }).join('');

    window._toggleH = id => document.getElementById(id)?.classList.toggle('oculto');
    window._xlsAct  = key => descargarXlsActividad(key);
  });
}

function renderDetalleAct(act) {
  const terminados = Object.values(act.estudiantes || {})
    .filter(e => e.estado === 'terminado');

  const mats   = ['biologia', 'fisica', 'quimica', 'cts', 'razonamiento'];
  const emojis = { biologia: '🌿', fisica: '⚡', quimica: '⚗️', cts: '🔬', razonamiento: '🧠' };
  const meds   = { 0: '🥇', 1: '🥈', 2: '🥉' };
  const css    = { 0: 'top1', 1: 'top2', 2: 'top3' };

  // ── Estadísticas por grado (cards superiores) ──
  const porGrado = [8, 9, 10].map(g => {
    const grupo  = terminados.filter(e => e.grado === g);
    if (!grupo.length) return '';
    const notas  = grupo.map(e => Number(e.nota) || 0);
    const cuotas = act.cuotas?.[`grado${g}`] || {};
    const barras = mats.map(m => {
      const total = cuotas[m] || 0;
      if (!total) return '';
      const prom = grupo.reduce((s, e) => s + (e.aciertos?.[m] || 0), 0) / grupo.length;
      const pct  = Math.round((prom / total) * 100);
      const col  = pct >= 70 ? '#39ff14' : pct >= 40 ? '#ffd600' : '#c0392b';
      return `<div style="display:flex;align-items:center;gap:6px;margin-top:4px">
        <span style="color:#ccc;font-size:0.78rem;width:56px">${emojis[m]} ${m}</span>
        <div style="flex:1;background:#333;border-radius:4px;height:8px">
          <div style="background:${col};width:${pct}%;height:8px;border-radius:4px"></div>
        </div>
        <span style="color:#fff;font-size:0.78rem;width:34px">${pct}%</span>
      </div>`;
    }).join('');
    const promedio = Math.round(notas.reduce((a, b) => a + b, 0) / notas.length);
    const mejor    = grupo.slice().sort((a, b) => (b.puntaje || 0) - (a.puntaje || 0))[0];
    return `
      <div style="background:#0d1117;border:1px solid #333;border-radius:8px;padding:12px;flex:1;min-width:180px">
        <div style="color:#ffd600;font-weight:700;margin-bottom:8px">Grado ${g}° · ${grupo.length} estudiantes</div>
        <div style="color:#8ab;font-size:0.82rem">Nota prom: <strong style="color:#fff">${promedio}/500</strong></div>
        <div style="color:#8ab;font-size:0.82rem">Mejor nota: <strong style="color:#39ff14">${Math.max(...notas)}/500</strong></div>
        <div style="color:#8ab;font-size:0.82rem">1° lugar: <strong style="color:#fff">${mejor?.nombre || '—'}</strong></div>
        <div style="margin-top:8px">${barras}</div>
      </div>`;
  }).join('');

  // ── Ranking agrupado por curso ──
  const grupos = {};
  terminados.forEach(e => {
    const clave = `${e.grado}-${e.curso}`;
    if (!grupos[clave]) grupos[clave] = { grado: e.grado, curso: e.curso, lista: [] };
    grupos[clave].lista.push(e);
  });
  const gruposOrdenados = Object.values(grupos)
    .sort((a, b) => a.grado - b.grado || String(a.curso).localeCompare(String(b.curso)));

  const tablasPorCurso = gruposOrdenados.map(g => {
    const sorted = g.lista.slice().sort((a, b) => (b.puntaje || 0) - (a.puntaje || 0));
    const filas  = sorted.map((e, i) => `
      <tr class="${css[i] ?? ''}">
        <td>${meds[i] ?? i + 1}</td>
        <td>${e.nombre}</td><td>${e.avatar}</td>
        <td>${Number(e.puntaje || 0).toLocaleString('es-CO')}</td>
        <td>${e.nota}/500</td><td>${fmtTiempo(e.tiempo)}</td>
      </tr>`).join('');
    return `
      <div style="margin-bottom:18px">
        <div style="font-weight:700;font-size:0.95rem;color:#ffd600;padding:6px 10px;background:#1a1a2e;border-radius:6px;margin-bottom:6px">
          📚 Grado ${g.grado}° · Curso ${g.curso}
          <span style="font-size:0.78rem;color:#8ab;font-weight:400;margin-left:10px">${sorted.length} estudiantes</span>
        </div>
        <table class="ranking-tabla">
          <thead><tr><th>#</th><th>Nombre</th><th>Avatar</th><th>Pts</th><th>Nota</th><th>Tiempo</th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
      </div>`;
  }).join('');

  return `
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:18px">${porGrado}</div>
    ${tablasPorCurso}
    <div style="margin-top:12px">
      <button class="btn-accion verde chico" onclick="window._xlsAct('${act.key}')">
        📥 Descargar Excel
      </button>
    </div>`;
}

function descargarXlsActividad(key) {
  const act = _historialData[key];
  if (!act) return;
  const terminados = Object.values(act.estudiantes || {})
    .filter(e => e.estado === 'terminado')
    .sort((a, b) => (b.puntaje || 0) - (a.puntaje || 0));

  const filas = terminados.map((e, i) => ({
    '#':          i + 1,
    'Nombre':     e.nombre,
    'Avatar':     e.avatar,
    'Colegio':    e.colegio || '—',
    'Grado':      e.grado + '°',
    'Curso':      e.curso,
    'Puntaje':    Number(e.puntaje) || 0,
    'Nota /500':  Number(e.nota)    || 0,
    'Tiempo (s)': e.tiempo          || 0,
    'Bio ✓':      e.aciertos?.biologia  || 0,
    'Fis ✓':      e.aciertos?.fisica    || 0,
    'Qui ✓':      e.aciertos?.quimica   || 0,
    'CTS ✓':      e.aciertos?.cts          || 0,
    'Rzn ✓':      e.aciertos?.razonamiento || 0,
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(filas);
  ws['!cols'] = [
    {wch:4},{wch:22},{wch:8},{wch:28},{wch:7},{wch:8},
    {wch:10},{wch:10},{wch:10},{wch:8},{wch:8},{wch:8},{wch:8}
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Resultados');
  const nombre = `olimpiada-${act.fecha.replace(/\//g,'-')}-${act.hora.replace(/:/g,'h')}.xlsx`;
  XLSX.writeFile(wb, nombre);
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
  const origen  = document.getElementById('admin-fil-origen').value;

  let banco = getBanco();
  if (materia)        banco = banco.filter(p => p.materia === materia);
  if (grado) {
    const g = Number(grado);
    banco = banco.filter(p =>
      p.grado === 'todos' ||
      (Array.isArray(p.grado) ? p.grado.includes(g) : p.grado === g)
    );
  }
  if (activa === '1') banco = banco.filter(p =>  p.activa);
  if (activa === '0') banco = banco.filter(p => !p.activa);
  if (origen)         banco = banco.filter(p => (p.origen || 'normal') === origen);

  const colores = { quimica: '#39ff14', fisica: '#00e5ff', biologia: '#ff9f1c', cts: '#ff69b4', razonamiento: '#a78bfa' };
  const emojis  = { quimica: '⚗️', fisica: '⚡', biologia: '🌿', cts: '🔬', razonamiento: '🧠' };

  const lista = document.getElementById('admin-lista');
  if (!banco.length) {
    lista.innerHTML = '<p class="admin-vacio">Sin preguntas con este filtro.</p>';
    return;
  }

  lista.innerHTML = banco.map((p, idx) => {
    const col = colores[p.materia] || '#ccc';
    const emo = emojis[p.materia]  || '';
    const snippet = p.enunciado.length > 100
      ? p.enunciado.substring(0, 100) + '…'
      : p.enunciado;
    const icfesTag = p.origen === 'icfes'
      ? '<span class="admin-badge icfes">📄 ICFES</span>'
      : '';
    const gradoLabel = Array.isArray(p.grado)
      ? p.grado.map(g => `${g}°`).join('/')
      : (p.grado === 'todos' ? 'Todos' : `${p.grado}°`);
    return `
      <div class="admin-card">
        <div class="admin-card-head">
          <span class="admin-badge num">#${idx + 1}</span>
          <span class="admin-badge" style="color:${col}">${emo} ${p.materia}</span>
          <span class="admin-badge grado">G${gradoLabel}</span>
          <span class="admin-badge dif">D${p.dificultad}</span>
          ${icfesTag}
          <span class="admin-badge ${p.activa ? 'activo' : 'inactivo'}">${p.activa ? '✓ Activa' : '✗ Inactiva'}</span>
          <span class="admin-card-tema">${p.tema || ''}</span>
        </div>
        <p class="admin-card-enunciado">${snippet}</p>
        <div class="admin-card-acciones">
          <button class="btn-accion cian chico" onclick="window._adminEditar('${p.id}')">✏️ Editar</button>
          <button class="btn-accion amarillo chico" onclick="window._adminPreview('${p.id}')">👁 Vista previa</button>
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

  // Resetear área de imágenes
  document.getElementById('af-imagen-url').value = '';
  document.getElementById('af-imagen-file').value = '';
  document.getElementById('af-imagen-preview').classList.add('oculto');
  document.getElementById('af-imagen-preview').src = '';
  document.getElementById('btn-quitar-imagen').style.display = 'none';
  document.getElementById('af-imagen-estado').textContent = '';
  document.getElementById('af-imagen2-url').value = '';
  document.getElementById('af-imagen2-file').value = '';
  document.getElementById('af-imagen2-preview').classList.add('oculto');
  document.getElementById('af-imagen2-preview').src = '';
  document.getElementById('btn-quitar-imagen2').style.display = 'none';
  document.getElementById('af-imagen2-estado').textContent = '';

  if (id) {
    const p = getBanco().find(q => q.id === id);
    if (!p) return;
    titulo.textContent = '✏️ Editar pregunta';
    document.getElementById('af-id').value         = p.id;
    document.getElementById('af-materia').value    = p.materia;
    document.querySelectorAll('.af-grado-cb').forEach(cb => {
      const v = Number(cb.value);
      cb.checked = p.grado === 'todos' || (Array.isArray(p.grado) ? p.grado.includes(v) : p.grado === v);
    });
    document.getElementById('af-dificultad').value = String(p.dificultad);
    document.getElementById('af-tema').value       = p.tema || '';
    document.getElementById('af-enunciado').value  = p.enunciado;

    const tipoInteractivo = p.tipo && p.tipo !== 'seleccion';
    const ops = p.opciones || [];
    document.getElementById('af-op0').value        = ops[0] || '';
    document.getElementById('af-op1').value        = ops[1] || '';
    document.getElementById('af-op2').value        = ops[2] || '';
    document.getElementById('af-op3').value        = ops[3] || '';

    // Advertir si es tipo interactivo (las opciones no aplican)
    const avisoTipo = document.getElementById('af-aviso-tipo');
    if (avisoTipo) {
      avisoTipo.textContent = tipoInteractivo
        ? `⚠️ Tipo "${p.tipo}": solo puedes editar enunciado, materia, grado, imagen y estado.`
        : '';
      avisoTipo.style.display = tipoInteractivo ? 'block' : 'none';
    }

    const radio = form.querySelector(`input[name="af-correcta"][value="${p.correcta ?? 0}"]`);
    if (radio) radio.checked = true;
    document.getElementById('af-explicacion').value = p.explicacion || '';
    document.getElementById('af-tiempo').value      = String(p.tiempo || 30);
    document.getElementById('af-origen').value      = p.origen || 'normal';
    document.getElementById('af-activa').checked   = !!p.activa;
    if (p.imagen) {
      document.getElementById('af-imagen-url').value = p.imagen;
      const prev = document.getElementById('af-imagen-preview');
      prev.src = p.imagen;
      prev.classList.remove('oculto');
      document.getElementById('btn-quitar-imagen').style.display = 'inline-block';
      document.getElementById('af-imagen-estado').textContent = '✅ Imagen cargada';
    }
    if (p.imagen2) {
      document.getElementById('af-imagen2-url').value = p.imagen2;
      const prev2 = document.getElementById('af-imagen2-preview');
      prev2.src = p.imagen2;
      prev2.classList.remove('oculto');
      document.getElementById('btn-quitar-imagen2').style.display = 'inline-block';
      document.getElementById('af-imagen2-estado').textContent = '✅ Imagen 2 cargada';
    }
  } else {
    titulo.textContent = '➕ Nueva pregunta';
    document.getElementById('af-id').value = '';
    document.getElementById('af-origen').value = 'normal';
    document.getElementById('af-tiempo').value = '30';
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
  const gradosSel = document.querySelectorAll('.af-grado-cb:checked');
  if (!gradosSel.length) { alert('Selecciona al menos un grado.'); return; }

  // Base existente para preservar campos de tipos interactivos
  const base = id ? (getBanco().find(p => p.id === id) || {}) : {};
  const tipoInteractivo = base.tipo && base.tipo !== 'seleccion';

  const pregunta = {
    ...base,
    id:         id || `P-${Date.now()}`,
    materia:    document.getElementById('af-materia').value,
    tema:       document.getElementById('af-tema').value.trim(),
    grado:      (() => {
                  const sel = Array.from(document.querySelectorAll('.af-grado-cb:checked')).map(cb => Number(cb.value));
                  if (!sel.length) return null;
                  if (sel.length === 3) return 'todos';
                  return sel.length === 1 ? sel[0] : sel;
                })(),
    dificultad: parseInt(document.getElementById('af-dificultad').value),
    enunciado:  document.getElementById('af-enunciado').value.trim(),
    explicacion:document.getElementById('af-explicacion').value.trim(),
    tiempo:     parseInt(document.getElementById('af-tiempo').value) || 30,
    origen:     document.getElementById('af-origen').value || 'normal',
    imagen:     document.getElementById('af-imagen-url').value  || null,
    imagen2:    document.getElementById('af-imagen2-url').value || null,
    autor:      'admin',
    activa:     document.getElementById('af-activa').checked,
  };

  // Solo actualizar opciones/correcta si es tipo seleccion
  if (!tipoInteractivo) {
    pregunta.opciones = [
      document.getElementById('af-op0').value.trim(),
      document.getElementById('af-op1').value.trim(),
      document.getElementById('af-op2').value.trim(),
      document.getElementById('af-op3').value.trim(),
    ];
    pregunta.correcta = parseInt(radioChecked.value);
  }

  if (id) {
    actualizarPregunta(id, pregunta);
  } else {
    agregarPregunta(pregunta);
  }

  cerrarModal();
  actualizarContador();
  renderizarPreguntas();
}

// Exponer getBanco al preview de main.js (evita dependencia circular)
window._bancoPorAdmin = { getBanco };

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
async function renderizarRanking() {
  const lista = document.getElementById('admin-ranking-lista');
  lista.innerHTML = '<p class="admin-vacio">Cargando…</p>';

  const snap = await get(ref(db, 'historial'));
  let datos = [];

  if (snap.exists()) {
    Object.entries(snap.val()).forEach(([key, act]) => {
      Object.values(act.estudiantes || {}).forEach(e => {
        if (e.estado === 'terminado') {
          datos.push({ ...e, fechaAct: act.fecha, horaAct: act.hora });
        }
      });
    });
  }

  if (!datos.length) {
    lista.innerHTML = '<p class="admin-vacio">No hay actividades guardadas aún.</p>';
    return;
  }

  datos.sort((a, b) => Number(b.nota) - Number(a.nota));

  lista.innerHTML = `
    <p style="color:#8ab;font-size:0.85rem;margin-bottom:8px">
      ${datos.length} estudiantes en ${snap.exists() ? Object.keys(snap.val()).length : 0} actividad(es) guardada(s)
    </p>
    <table class="ranking-tabla" style="margin-top:4px">
      <thead>
        <tr>
          <th>#</th><th>Nombre</th><th>Avatar</th>
          <th>Colegio</th><th>Grado</th><th>Curso</th>
          <th>Pts</th><th>Nota</th><th>Fecha</th><th>Hora</th>
        </tr>
      </thead>
      <tbody>
        ${datos.map((r, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${r.nombre}</td>
            <td>${r.avatar}</td>
            <td style="font-size:0.75rem;max-width:140px">${r.colegio || '—'}</td>
            <td>${r.grado}°</td>
            <td>${r.curso}</td>
            <td>${Number(r.puntaje).toLocaleString('es-CO')}</td>
            <td>${r.nota}</td>
            <td>${r.fechaAct || '—'}</td>
            <td>${r.horaAct || '—'}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

async function descargarExcel() {
  // Leer de Firebase: combinar todos los estudiantes de todas las actividades del historial
  const snap = await get(ref(db, 'historial'));
  let datos = [];

  if (snap.exists()) {
    Object.values(snap.val()).forEach(act => {
      Object.values(act.estudiantes || {}).forEach(e => {
        if (e.estado === 'terminado') {
          datos.push({ ...e, fechaAct: act.fecha, horaAct: act.hora });
        }
      });
    });
  }

  // Fallback: localStorage (sesión activa sin guardar)
  if (!datos.length) {
    datos = JSON.parse(localStorage.getItem('ranking') || '[]');
  }

  if (!datos.length) { alert('No hay datos para exportar. Asegúrese de guardar la actividad al cerrarla.'); return; }

  const ordenados = [...datos].sort((a, b) => Number(b.nota) - Number(a.nota));

  const fila = (r, i) => ({
    '#':           i + 1,
    'Nombre':      r.nombre,
    'Avatar':      r.avatar,
    'Colegio':     r.colegio || '—',
    'Grado':       r.grado + '°',
    'Curso':       r.curso,
    'Puntaje':     Number(r.puntaje),
    'Nota / 500':  Number(r.nota),
    'Tiempo (s)':  r.tiempo || '—',
    'Bio ✓':       r.aciertos?.biologia     || 0,
    'Fis ✓':       r.aciertos?.fisica       || 0,
    'Qui ✓':       r.aciertos?.quimica      || 0,
    'CTS ✓':       r.aciertos?.cts          || 0,
    'Rzn ✓':       r.aciertos?.razonamiento || 0,
    'Fecha':       r.fechaAct || r.fecha || '—',
  });

  const wb = XLSX.utils.book_new();

  // Pestaña GENERAL
  const wsGeneral = XLSX.utils.json_to_sheet(ordenados.map(fila));
  aplicarEstilos(wsGeneral, ordenados.length);
  XLSX.utils.book_append_sheet(wb, wsGeneral, 'General');

  // Una pestaña por curso
  const cursos = [...new Set(ordenados.map(r => `${r.grado}°-${r.curso}`))].sort();
  cursos.forEach(clave => {
    const [grado, curso] = clave.split('-');
    const grupo = ordenados.filter(r => String(r.grado) + '°' === grado && r.curso === curso);
    const ws = XLSX.utils.json_to_sheet(grupo.map(fila));
    aplicarEstilos(ws, grupo.length);
    XLSX.utils.book_append_sheet(wb, ws, `G${grado} Curso ${curso}`.substring(0, 31));
  });

  XLSX.writeFile(wb, `ranking-iti-olimpiadas-${new Date().toISOString().slice(0,10)}.xlsx`);
}

function aplicarEstilos(ws, filas) {
  // Ancho de columnas
  ws['!cols'] = [
    { wch: 4 },  // #
    { wch: 22 }, // Nombre
    { wch: 8 },  // Avatar
    { wch: 30 }, // Colegio
    { wch: 7 },  // Grado
    { wch: 7 },  // Curso
    { wch: 10 }, // Puntaje
    { wch: 10 }, // Nota/500
    { wch: 10 }, // Tiempo
    { wch: 7 },  // Bio ✓
    { wch: 7 },  // Fis ✓
    { wch: 7 },  // Qui ✓
    { wch: 7 },  // CTS ✓
    { wch: 7 },  // Rzn ✓
    { wch: 12 }, // Fecha
  ];
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

// ─── INDICADORES ───────────────────────────────────────────────────────────
const C_IND = {
  bio:'#39ff14', fis:'#00e5ff', qui:'#ff9f1c',
  cts:'#ff69b4', rzn:'#a78bfa', gold:'#ffd600',
};
Chart.defaults.font.family = "'LiberationMono', monospace";
Chart.defaults.color       = '#6b7280';
Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';

let _indCharts   = {};
let _indSesiones = [];
let _indIdx      = 0;
let _indFiltro   = 0;

function _killCharts() {
  Object.values(_indCharts).forEach(c => c?.destroy());
  _indCharts = {};
}

function _calcSesion(act, gradoFiltro = 0) {
  const todos  = Object.values(act.estudiantes || {});
  const allTerm = todos.filter(e => e.estado === 'terminado');
  const term   = gradoFiltro ? allTerm.filter(e => +e.grado === gradoFiltro) : allTerm;
  const cuotas = act.cuotas || {};
  const mats   = ['biologia', 'fisica', 'quimica', 'cts', 'razonamiento'];
  const gradosP = [...new Set(allTerm.map(e => +e.grado))].filter(Boolean);

  // % aciertos por materia (ponderado por cantidad de estudiantes por grado)
  const pctMat = {};
  mats.forEach(m => {
    if (!term.length) { pctMat[m] = 0; return; }
    const gList = gradoFiltro ? [gradoFiltro] : gradosP;
    let totCuota = 0, totAc = 0;
    gList.forEach(g => {
      const cq  = cuotas[`grado${g}`]?.[m] || 0;
      const grp = term.filter(e => +e.grado === g);
      totCuota += cq * grp.length;
      totAc    += grp.reduce((s, e) => s + (e.aciertos?.[m] || 0), 0);
    });
    pctMat[m] = totCuota ? Math.round(totAc / totCuota * 100) : 0;
  });

  const notas    = term.map(e => Number(e.nota) || 0);
  const promNota = notas.length ? Math.round(notas.reduce((a, b) => a + b, 0) / notas.length) : 0;
  const maxNota  = notas.length ? Math.max(...notas) : 0;
  const aprobados = notas.length ? Math.round(notas.filter(n => n >= 250).length / notas.length * 100) : 0;
  const totalFilt = gradoFiltro ? todos.filter(e => +e.grado === gradoFiltro).length : todos.length;
  const compPct   = totalFilt ? Math.round(term.length / totalFilt * 100) : 0;

  // histograma 8 bins
  const bins = [0, 0, 0, 0, 0, 0, 0, 0];
  notas.forEach(n => { bins[Math.min(7, Math.floor(n / 62.5))]++; });

  // mediana y desviación estándar
  const sorted = [...notas].sort((a, b) => a - b);
  const med = sorted.length
    ? (sorted.length % 2 === 0
        ? Math.round((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2)
        : sorted[Math.floor(sorted.length / 2)])
    : 0;
  const sd = notas.length
    ? Math.round(Math.sqrt(notas.reduce((s, n) => s + (n - promNota) ** 2, 0) / notas.length))
    : 0;

  // por grado (siempre los 3)
  const porGrado = [8, 9, 10].map(g => {
    const grp = allTerm.filter(e => +e.grado === g);
    if (!grp.length) return null;
    const ns = grp.map(e => Number(e.nota) || 0);
    const pctG = {};
    mats.forEach(m => {
      const tot = cuotas[`grado${g}`]?.[m] || 0;
      pctG[m] = tot ? Math.round(grp.reduce((s, e) => s + (e.aciertos?.[m] || 0), 0) / grp.length / tot * 100) : 0;
    });
    return { g, n: grp.length, prom: Math.round(ns.reduce((a, b) => a + b, 0) / ns.length), pctMat: pctG };
  }).filter(Boolean);

  // cursos (con >= 2 estudiantes)
  const cursosMap = {};
  allTerm.forEach(e => {
    const k = `${e.grado}-${e.curso}`;
    if (!cursosMap[k]) cursosMap[k] = { grado: +e.grado, curso: e.curso, notas: [] };
    cursosMap[k].notas.push(Number(e.nota) || 0);
  });
  const cursos = Object.values(cursosMap)
    .filter(v => v.notas.length >= 2)
    .map(v => ({ grado: v.grado, curso: v.curso, n: v.notas.length, p: Math.round(v.notas.reduce((a, b) => a + b, 0) / v.notas.length) }))
    .sort((a, b) => b.p - a.p);

  const top10 = term.slice().sort((a, b) => (Number(b.nota) || 0) - (Number(a.nota) || 0)).slice(0, 10);

  return { term, notas, promNota, maxNota, aprobados, compPct, pctMat, bins, med, sd, porGrado, cursos, top10, totalAll: totalFilt };
}

function _anim(el, target, suf = '') {
  if (!el) return;
  let c = 0;
  const step = Math.max(1, Math.ceil(target / 30));
  const t = setInterval(() => { c = Math.min(c + step, target); el.textContent = c + suf; if (c >= target) clearInterval(t); }, 16);
}

function _delta(el, curr, prev, suf = '') {
  if (!el) return;
  if (prev == null) { el.className = 'ind-kpi2-delta de'; el.textContent = '— primera sesión'; return; }
  const d = curr - prev;
  el.className = 'ind-kpi2-delta ' + (d > 0 ? 'du' : d < 0 ? 'dd' : 'de');
  el.textContent = (d > 0 ? '↑ +' : d < 0 ? '↓ ' : '— ') + d + suf + ' vs sesión anterior';
}

function _podioHTML2(top3) {
  if (!top3.length) return '<p style="color:#6b7280;text-align:center;padding:30px 0">Sin datos</p>';
  const pc  = ['#ffd600', '#c0c0d0', '#cd7f32'];
  const em  = ['🥇', '🥈', '🥉'];
  const h   = [110, 80, 60];
  const sz  = [62, 48, 48];
  const ord = top3.length >= 2 ? [1, 0, 2] : [0];
  return `<div class="ind-podio2">${ord.map(o => {
    const p = top3[o]; if (!p) return '';
    const fmtT = p.tiempo ? (typeof p.tiempo === 'number' ? `${Math.floor(p.tiempo / 60)}m ${String(p.tiempo % 60).padStart(2, '0')}s` : p.tiempo) : '—';
    return `<div class="ind-pcol2">
      <div class="ind-pav2" style="border-color:${pc[o]};color:${pc[o]};box-shadow:0 0 14px ${pc[o]}40;width:${sz[o]}px;height:${sz[o]}px">${o + 1}°</div>
      <div class="ind-pname2">${p.nombre}</div>
      <div class="ind-pnota2" style="color:${pc[o]}">${p.nota}</div>
      <div class="ind-pcurso2">${p.grado}° · ${p.curso || '—'}</div>
      <div class="ind-pbase2" style="height:${h[o]}px;border-color:${pc[o]};color:${pc[o]};font-size:${o === 0 ? '1.8rem' : '1.3rem'}">${em[o]}</div>
    </div>`;
  }).join('')}</div>`;
}

function _setAn(id, txt, cls = '') {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'ind-an ' + cls;
  el.innerHTML = '<strong>Análisis:</strong> ' + txt;
}

async function renderIndicadores() {
  const cont = document.getElementById('ind-contenido');
  if (!cont) return;
  cont.innerHTML = '<p class="admin-vacio" style="padding:40px 0;text-align:center">⏳ Cargando indicadores…</p>';

  const snap = await get(ref(db, 'historial'));
  if (!snap.exists()) {
    cont.innerHTML = '<p class="admin-vacio">No hay actividades guardadas aún.</p>';
    return;
  }

  _indSesiones = Object.entries(snap.val())
    .map(([key, val]) => ({ key, ...val }))
    .sort((a, b) => a.timestamp - b.timestamp);

  _indIdx    = _indSesiones.length - 1;
  _indFiltro = 0;

  const optsHTML = _indSesiones.map((s, i) =>
    `<option value="${i}">📅 S${i + 1} · ${s.fecha} · ${s.hora} · ${s.totalEstudiantes} est.</option>`
  ).join('');

  cont.innerHTML = `
<div class="ind-header2">
  <div class="ind-header2-left">
    <h2 class="ind-title2">⚡ Indicadores</h2>
    <p class="ind-subtitle2">Reactor del Saber · I.E.M Instituto Técnico Industrial</p>
  </div>
  <div class="ind-nav2">
    <span class="ind-nav2-label">Sesión:</span>
    <button class="ind-btn-nav" id="ind-btn-prev">◀</button>
    <select class="ind-sel-sesion" id="ind-sel-sesion">${optsHTML}</select>
    <button class="ind-btn-nav" id="ind-btn-next">▶</button>
    <span class="ind-chip-live" id="ind-chip-live">🟢 EN VIVO</span>
  </div>
</div>

<div class="ind-ses-badge" id="ind-ses-badge">⚡ Cargando…</div>

<div class="ind-filtros2">
  <span class="ind-filtros2-label">Filtrar grado:</span>
  <button class="ind-fg2 activo" data-g="0">Todos</button>
  <button class="ind-fg2" data-g="8">8°</button>
  <button class="ind-fg2" data-g="9">9°</button>
  <button class="ind-fg2" data-g="10">10°</button>
</div>

<div class="ind-kpi-grid2">
  <div class="ind-kpi2" style="--c:var(--fis2)"><div class="ind-kpi2-icon">👥</div><div class="ind-kpi2-val" id="ikv-tot">—</div><div class="ind-kpi2-lbl">Participantes</div><div class="ind-kpi2-delta de" id="ikd-tot">—</div></div>
  <div class="ind-kpi2" style="--c:var(--gold2)"><div class="ind-kpi2-icon">📊</div><div class="ind-kpi2-val" id="ikv-prom">—</div><div class="ind-kpi2-lbl">Nota prom. /500</div><div class="ind-kpi2-delta de" id="ikd-prom">—</div></div>
  <div class="ind-kpi2" style="--c:var(--bio2)"><div class="ind-kpi2-icon">🏆</div><div class="ind-kpi2-val" id="ikv-mejor">—</div><div class="ind-kpi2-lbl">Mejor nota /500</div><div class="ind-kpi2-delta de" id="ikd-mejor">—</div></div>
  <div class="ind-kpi2" style="--c:var(--qui2)"><div class="ind-kpi2-icon">✅</div><div class="ind-kpi2-val" id="ikv-comp">—</div><div class="ind-kpi2-lbl">Finalización</div><div class="ind-kpi2-delta de" id="ikd-comp">—</div></div>
  <div class="ind-kpi2" style="--c:var(--rzn2)"><div class="ind-kpi2-icon">🎯</div><div class="ind-kpi2-val" id="ikv-apr">—</div><div class="ind-kpi2-lbl">Sobre 250 pts</div><div class="ind-kpi2-delta de" id="ikd-apr">—</div></div>
</div>

<div class="ind-st">🏅 Destacados de la sesión</div>
<div class="ind-grid2">
  <div class="ind-cc2">
    <div class="ind-ch2">
      <div><div class="ind-ct2">🏅 Podio — Top 3</div><div class="ind-cs2" id="ind-podio-sub">—</div></div>
      <div id="ind-podio-chips" style="display:flex;gap:5px;flex-wrap:wrap"></div>
    </div>
    <div id="ind-podio-cont" style="min-height:210px"></div>
    <div class="ind-an" id="ind-an-podio"></div>
  </div>
  <div class="ind-cc2">
    <div class="ind-ch2"><div><div class="ind-ct2">📚 Rendimiento por materia</div><div class="ind-cs2">% promedio de aciertos</div></div></div>
    <div class="ind-cw2"><canvas id="ind-ch-mat"></canvas></div>
    <div class="ind-an c" id="ind-an-mat"></div>
  </div>
</div>

<div class="ind-st">📈 Distribución y comparativos</div>
<div class="ind-grid2">
  <div class="ind-cc2">
    <div class="ind-ch2">
      <div><div class="ind-ct2">🎯 Distribución de notas</div><div class="ind-cs2">¿Cómo se distribuyó el grupo?</div></div>
      <div style="display:flex;gap:10px;font-size:.73rem;color:#6b7280">
        <span>Mediana: <strong id="ind-stat-med" style="color:#e8e8f0">—</strong></span>
        <span>σ: <strong id="ind-stat-sd" style="color:#e8e8f0">—</strong></span>
      </div>
    </div>
    <div class="ind-cw2"><canvas id="ind-ch-histo"></canvas></div>
    <div class="ind-an g" id="ind-an-histo"></div>
  </div>
  <div class="ind-cc2">
    <div class="ind-ch2"><div><div class="ind-ct2">🎓 Comparativo por grado</div><div class="ind-cs2">Nota promedio y participación</div></div></div>
    <div class="ind-cw2"><canvas id="ind-ch-grados"></canvas></div>
    <div class="ind-an v" id="ind-an-grados"></div>
  </div>
</div>

<div class="ind-st">📈 Evolución entre todas las sesiones</div>
<div class="ind-cc2 ind-cc2-full" style="margin-bottom:16px">
  <div class="ind-ch2">
    <div><div class="ind-ct2">📈 Evolución del desempeño</div><div class="ind-cs2">% de aciertos promedio por materia · sesión activa marcada</div></div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <span class="ind-chip2" style="color:#39ff14;border-color:#39ff14">🌿 Bio</span>
      <span class="ind-chip2" style="color:#00e5ff;border-color:#00e5ff">⚡ Fis</span>
      <span class="ind-chip2" style="color:#ff9f1c;border-color:#ff9f1c">⚗️ Qui</span>
      <span class="ind-chip2" style="color:#a78bfa;border-color:#a78bfa">🧠 Rzn</span>
    </div>
  </div>
  <div class="ind-cw2 ind-cw2-tall"><canvas id="ind-ch-evol"></canvas></div>
  <div class="ind-an" id="ind-an-evol"></div>
</div>

<div class="ind-st">🏫 Perfil y detalle por curso</div>
<div class="ind-grid2">
  <div class="ind-cc2">
    <div class="ind-ch2"><div><div class="ind-ct2">🕸️ Perfil de habilidades</div><div class="ind-cs2">Grado 8° · 9° · 10° comparados</div></div></div>
    <div class="ind-cw2 ind-cw2-tall"><canvas id="ind-ch-radar"></canvas></div>
    <div class="ind-an p" id="ind-an-radar"></div>
  </div>
  <div class="ind-cc2">
    <div class="ind-ch2"><div><div class="ind-ct2">🏫 Nota promedio por curso</div><div class="ind-cs2">Cursos con 2+ estudiantes</div></div></div>
    <div class="ind-cw2 ind-cw2-tall"><canvas id="ind-ch-cursos"></canvas></div>
    <div class="ind-an g" id="ind-an-cursos"></div>
  </div>
</div>

<div class="ind-st" style="margin-top:16px">📋 Participación y tabla de honor</div>
<div class="ind-grid2">
  <div class="ind-cc2">
    <div class="ind-ch2"><div><div class="ind-ct2">👥 Participación por sesión</div><div class="ind-cs2">Conectados vs. finalizaron · sesión activa resaltada</div></div></div>
    <div class="ind-cw2"><canvas id="ind-ch-part"></canvas></div>
    <div class="ind-an c" id="ind-an-part"></div>
  </div>
  <div class="ind-cc2">
    <div class="ind-ch2"><div><div class="ind-ct2">🏆 Top 10 esta sesión</div><div class="ind-cs2">Ordenado por nota /500</div></div></div>
    <table class="ind-mt"><thead><tr><th>#</th><th>Estudiante</th><th>Grado · Curso</th><th>Nota</th><th>Tiempo</th></tr></thead>
    <tbody id="ind-top10"></tbody></table>
  </div>
</div>

<div style="margin-top:16px;padding:8px 0">
  <button class="ind-btn-xls2" id="ind-btn-xls">📥 Descargar Excel de esta sesión</button>
</div>`;

  // Wiring
  document.getElementById('ind-btn-prev').addEventListener('click', () => _navInd(-1));
  document.getElementById('ind-btn-next').addEventListener('click', () => _navInd(+1));
  document.getElementById('ind-sel-sesion').addEventListener('change', e => {
    _indIdx = +e.target.value;
    _actualizarSesion();
  });
  cont.querySelectorAll('.ind-fg2').forEach(btn => {
    btn.addEventListener('click', () => {
      cont.querySelectorAll('.ind-fg2').forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      _indFiltro = +btn.dataset.g;
      _actualizarSesion();
    });
  });
  document.getElementById('ind-btn-xls').addEventListener('click', () => {
    const act = _indSesiones[_indIdx];
    if (!act) return;
    const term = Object.values(act.estudiantes || {}).filter(e => e.estado === 'terminado')
      .sort((a, b) => (b.puntaje || 0) - (a.puntaje || 0));
    const filas = term.map((e, i) => ({
      '#': i+1, 'Nombre': e.nombre, 'Avatar': e.avatar,
      'Grado': e.grado+'°', 'Curso': e.curso,
      'Puntaje': Number(e.puntaje)||0, 'Nota /500': Number(e.nota)||0,
      'Tiempo(s)': e.tiempo||0,
      'Bio✓': e.aciertos?.biologia||0, 'Fis✓': e.aciertos?.fisica||0,
      'Qui✓': e.aciertos?.quimica||0, 'CTS✓': e.aciertos?.cts||0,
      'Rzn✓': e.aciertos?.razonamiento||0,
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(filas);
    XLSX.utils.book_append_sheet(wb, ws, 'Sesión');
    XLSX.writeFile(wb, `sesion-${act.fecha.replace(/\//g,'-')}-${act.hora.replace(/:/g,'h')}.xlsx`);
  });

  _actualizarSesion();
}

function _navInd(dir) {
  _indIdx = Math.max(0, Math.min(_indSesiones.length - 1, _indIdx + dir));
  document.getElementById('ind-sel-sesion').value = _indIdx;
  _actualizarSesion();
}

function _actualizarSesion() {
  _killCharts();
  const act  = _indSesiones[_indIdx];
  const prev = _indIdx > 0 ? _indSesiones[_indIdx - 1] : null;
  const n    = _indSesiones.length;
  const d    = _calcSesion(act, _indFiltro);
  const dp   = prev ? _calcSesion(prev, _indFiltro) : null;

  // Nav
  const btnP = document.getElementById('ind-btn-prev');
  const btnN = document.getElementById('ind-btn-next');
  if (btnP) btnP.disabled = _indIdx === 0;
  if (btnN) btnN.disabled = _indIdx === n - 1;

  const chip = document.getElementById('ind-chip-live');
  if (chip) {
    const live = _indIdx === n - 1;
    chip.textContent    = live ? '🟢 EN VIVO' : `📁 Histórico · S${_indIdx + 1}`;
    chip.style.color       = live ? '#39ff14' : '#6b7280';
    chip.style.borderColor = live ? '#39ff14' : '#2a2a45';
  }

  const badge = document.getElementById('ind-ses-badge');
  if (badge) badge.textContent = `⚡ Sesión ${_indIdx + 1} de ${n}  ·  📅 ${act.fecha}  ·  🕐 ${act.hora}  ·  👥 ${act.totalEstudiantes} participantes`;

  // KPIs
  _anim(document.getElementById('ikv-tot'),   d.totalAll);
  _anim(document.getElementById('ikv-prom'),  d.promNota);
  _anim(document.getElementById('ikv-mejor'), d.maxNota);
  _anim(document.getElementById('ikv-comp'),  d.compPct, '%');
  _anim(document.getElementById('ikv-apr'),   d.aprobados, '%');
  _delta(document.getElementById('ikd-tot'),   d.totalAll,  dp?.totalAll,  ' est.');
  _delta(document.getElementById('ikd-prom'),  d.promNota,  dp?.promNota,  ' pts');
  _delta(document.getElementById('ikd-mejor'), d.maxNota,   dp?.maxNota,   ' pts');
  const compEl = document.getElementById('ikd-comp');
  if (compEl) { compEl.className = 'ind-kpi2-delta du'; compEl.textContent = `${d.term.length} de ${d.totalAll} finalizaron`; }
  _delta(document.getElementById('ikd-apr'),   d.aprobados, dp?.aprobados, '%');

  // Podio
  const podioSub   = document.getElementById('ind-podio-sub');
  if (podioSub) podioSub.textContent = `${act.fecha} · ${act.hora}`;
  const podioChips = document.getElementById('ind-podio-chips');
  if (podioChips) {
    const gC = { 8: C_IND.fis, 9: C_IND.qui, 10: C_IND.bio };
    podioChips.innerHTML = d.porGrado.map(g =>
      `<span class="ind-chip2" style="color:${gC[g.g]};border-color:${gC[g.g]}">Grado ${g.g}°</span>`
    ).join('');
  }
  const podioCont = document.getElementById('ind-podio-cont');
  if (podioCont) podioCont.innerHTML = _podioHTML2(d.top10.slice(0, 3));

  const medEl = document.getElementById('ind-stat-med');
  const sdEl  = document.getElementById('ind-stat-sd');
  if (medEl) medEl.textContent = d.med;
  if (sdEl)  sdEl.textContent  = d.sd;

  // Top 10
  const top10El = document.getElementById('ind-top10');
  const gC = { 8: C_IND.fis, 9: C_IND.qui, 10: C_IND.bio };
  if (top10El) top10El.innerHTML = d.top10.map((e, i) => {
    const medal  = i < 3 ? ['🥇','🥈','🥉'][i] : i + 1;
    const mcolor = i < 3 ? ['#ffd600','#c0c0d0','#cd7f32'][i] : '#6b7280';
    const fmtT   = e.tiempo ? (typeof e.tiempo === 'number' ? `${Math.floor(e.tiempo/60)}m${String(e.tiempo%60).padStart(2,'0')}s` : e.tiempo) : '—';
    return `<tr>
      <td style="color:${mcolor}">${medal}</td>
      <td style="font-weight:600">${e.nombre}</td>
      <td><span class="ind-bm" style="color:${gC[e.grado]||'#8ab'}">${e.grado}° · ${e.curso||'—'}</span></td>
      <td style="color:#ffd600;font-weight:700">${e.nota}</td>
      <td style="color:#6b7280">${fmtT}</td>
    </tr>`;
  }).join('');

  // Análisis automático
  const leader = Object.entries(d.pctMat).sort((a, b) => b[1] - a[1])[0];
  const matNm  = { biologia:'Biología', fisica:'Física', quimica:'Química', cts:'C.T.S.', razonamiento:'Razonamiento' };
  _setAn('ind-an-podio', d.top10[0] ? `${d.top10[0].nombre} lidera con ${d.top10[0].nota} pts. ${d.term.length} estudiantes completaron la sesión.` : 'Sin datos.', '');
  _setAn('ind-an-mat',   `${matNm[leader?.[0]]||'—'} lidera con ${leader?.[1]||0}% de aciertos. Razonamiento en ${d.pctMat.razonamiento}%.`, 'c');
  _setAn('ind-an-histo', `Mediana: ${d.med}. El ${d.aprobados}% superó los 250 puntos.`, 'g');
  _setAn('ind-an-grados', d.porGrado.length ? `Grado ${d.porGrado[d.porGrado.length-1].g}° lidera con ${d.porGrado[d.porGrado.length-1].prom} pts de promedio.` : 'Sin datos por grado.', 'v');
  _setAn('ind-an-radar', 'Comparativo de habilidades por materia y grado.', 'p');
  _setAn('ind-an-cursos', d.cursos.length ? `Curso ${d.cursos[0].curso} (G${d.cursos[0].grado}°) lidera con ${d.cursos[0].p} pts promedio.` : 'Datos insuficientes por curso.', 'g');
  _setAn('ind-an-part',  `${d.term.length} de ${d.totalAll} finalizaron (${d.compPct}%).`, 'c');

  _renderCharts(d, act);
}

function _renderCharts(d, act) {
  const mats   = ['biologia', 'fisica', 'quimica', 'cts', 'razonamiento'];
  const matLbl = ['🌿 Biología', '⚡ Física', '⚗️ Química', '🔬 C.T.S.', '🧠 Razón.'];
  const matCol = [C_IND.bio, C_IND.fis, C_IND.qui, C_IND.cts, C_IND.rzn];

  // MATERIAS
  const cMat = document.getElementById('ind-ch-mat');
  if (cMat) _indCharts.mat = new Chart(cMat, {
    type: 'bar',
    data: { labels: matLbl, datasets: [{ data: mats.map(m => d.pctMat[m]),
      backgroundColor: matCol.map(c => c + 'b0'), borderColor: matCol,
      borderWidth: 2, borderRadius: 6, borderSkipped: false }] },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.raw}%` } } },
      scales: { x: { max: 100, grid: { color: 'rgba(255,255,255,.05)' }, ticks: { callback: v => v + '%', font: { size: 10 } } },
                y: { grid: { display: false }, ticks: { font: { size: 11 } } } } }
  });

  // HISTOGRAMA
  const hLbl   = ['0-62','63-125','126-187','188-250','251-312','313-375','376-437','438-500'];
  const cHisto = document.getElementById('ind-ch-histo');
  if (cHisto) _indCharts.histo = new Chart(cHisto, {
    type: 'bar',
    data: { labels: hLbl, datasets: [{ label: 'Estudiantes', data: d.bins,
      backgroundColor: d.bins.map((_, i) => `hsla(${200 - i/7*160},100%,55%,.75)`),
      borderColor:      d.bins.map((_, i) => `hsl(${200 - i/7*160},100%,65%)`),
      borderWidth: 2, borderRadius: 5, borderSkipped: false }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
      scales: { x: { grid: { display: false }, ticks: { font: { size: 9 } } },
                y: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { stepSize: 1, font: { size: 10 } } } } }
  });

  // GRADOS
  const cGrados = document.getElementById('ind-ch-grados');
  const gCmap   = { 8: C_IND.fis, 9: C_IND.qui, 10: C_IND.bio };
  if (cGrados && d.porGrado.length) _indCharts.grados = new Chart(cGrados, {
    type: 'bar',
    data: { labels: d.porGrado.map(g => `Grado ${g.g}° (${g.n} est.)`),
      datasets: [
        { label: 'Nota promedio', data: d.porGrado.map(g => g.prom), yAxisID: 'y',
          backgroundColor: d.porGrado.map(g => gCmap[g.g] + 'b0'), borderColor: d.porGrado.map(g => gCmap[g.g]),
          borderWidth: 2, borderRadius: 8, borderSkipped: false },
        { label: 'Participantes', data: d.porGrado.map(g => g.n), type: 'line', yAxisID: 'y2',
          borderColor: C_IND.gold, backgroundColor: 'rgba(255,214,0,.1)',
          pointBackgroundColor: C_IND.gold, pointRadius: 6, borderWidth: 2, tension: .3, fill: false }
      ] },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#8ab', boxWidth: 12, font: { size: 10 } } } },
      scales: { y:  { position: 'left',  max: 500, grid: { color: 'rgba(255,255,255,.05)' }, ticks: { font: { size: 10 } } },
                y2: { position: 'right', grid: { display: false }, ticks: { color: C_IND.gold, font: { size: 10 } } } } }
  });

  // EVOLUCIÓN
  const cEvol = document.getElementById('ind-ch-evol');
  if (cEvol) {
    const sesLabels = _indSesiones.map((s, i) => `S${i+1} · ${s.fecha.slice(0,5)}`);
    const evolData = (matKey) => _indSesiones.map(s => {
      const t = Object.values(s.estudiantes || {}).filter(e => e.estado === 'terminado');
      if (!t.length) return 0;
      const cq = s.cuotas || {};
      const gp = [...new Set(t.map(e => +e.grado))].filter(Boolean);
      let totC = 0, totA = 0;
      gp.forEach(g => {
        const q = cq[`grado${g}`]?.[matKey] || 0;
        const grp = t.filter(e => +e.grado === g);
        totC += q * grp.length;
        totA += grp.reduce((s2, e) => s2 + (e.aciertos?.[matKey] || 0), 0);
      });
      return totC ? Math.round(totA / totC * 100) : 0;
    });

    const sesLinePlugin = { id: 'sesLine',
      afterDraw(chart) {
        const { ctx, chartArea: { top, bottom }, scales: { x } } = chart;
        const xp = x.getPixelForValue(_indIdx);
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1.5; ctx.setLineDash([5,4]);
        ctx.beginPath(); ctx.moveTo(xp, top); ctx.lineTo(xp, bottom); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.font = 'bold 9px LiberationMono'; ctx.textAlign = 'center';
        ctx.fillText(`S${_indIdx+1}`, xp, top - 6);
        ctx.restore();
      }
    };
    const mkDS = (mk, color, dash = []) => ({
      label: { biologia:'🌿 Bio', fisica:'⚡ Fis', quimica:'⚗️ Qui', razonamiento:'🧠 Rzn' }[mk],
      data: evolData(mk), borderColor: color, backgroundColor: 'transparent',
      pointBackgroundColor: _indSesiones.map((_, i) => i === _indIdx ? '#fff' : color),
      pointRadius:          _indSesiones.map((_, i) => i === _indIdx ? 8 : 4),
      pointBorderColor:     _indSesiones.map((_, i) => i === _indIdx ? color : 'transparent'),
      pointBorderWidth:     _indSesiones.map((_, i) => i === _indIdx ? 3 : 0),
      borderWidth: 2, tension: .4, fill: false, borderDash: dash,
    });
    _indCharts.evol = new Chart(cEvol, {
      type: 'line',
      data: { labels: sesLabels, datasets: [mkDS('biologia', C_IND.bio), mkDS('fisica', C_IND.fis), mkDS('quimica', C_IND.qui), mkDS('razonamiento', C_IND.rzn, [4,3])] },
      options: { responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#8ab', boxWidth: 12, padding: 14 } },
          tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.raw}%` } } },
        scales: { x: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { font: { size: 9 } } },
          y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,.05)' }, ticks: { callback: v => v + '%', font: { size: 10 } } } } },
      plugins: [sesLinePlugin]
    });

    if (_indSesiones.length > 1) {
      const d0 = _calcSesion(_indSesiones[0], 0), dN = _calcSesion(_indSesiones[_indSesiones.length-1], 0);
      const bd = dN.pctMat.biologia - d0.pctMat.biologia;
      const qd = dN.pctMat.quimica  - d0.pctMat.quimica;
      const rd = dN.pctMat.razonamiento - d0.pctMat.razonamiento;
      _setAn('ind-an-evol', `En ${_indSesiones.length} sesiones: Biología ${bd >= 0 ? '+' : ''}${bd}%, Química ${qd >= 0 ? '+' : ''}${qd}%, Razonamiento ${rd >= 0 ? '+' : ''}${rd}%.`, '');
    } else {
      _setAn('ind-an-evol', 'Con más sesiones aquí aparecerá la evolución histórica.', '');
    }
  }

  // RADAR
  const cRadar = document.getElementById('ind-ch-radar');
  if (cRadar && d.porGrado.length) {
    const rLbls = ['Biología', 'Física', 'Química', 'C.T.S.', 'Razonamiento'];
    const datasets = d.porGrado.map(g => ({
      label: `Grado ${g.g}°`,
      data: mats.map(m => g.pctMat[m] || 0),
      borderColor: gCmap[g.g], backgroundColor: gCmap[g.g] + '18',
      pointBackgroundColor: gCmap[g.g], pointRadius: 4, borderWidth: 2
    }));
    _indCharts.radar = new Chart(cRadar, {
      type: 'radar',
      data: { labels: rLbls, datasets },
      options: { responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#8ab', boxWidth: 12 } } },
        scales: { r: { min: 0, max: 100,
          ticks: { stepSize: 25, backdropColor: 'transparent', callback: v => v + '%', color: '#6b7280', font: { size: 9 } },
          grid: { color: 'rgba(255,255,255,.06)' }, pointLabels: { color: '#8ab', font: { size: 10 } } } } }
    });
  }

  // CURSOS
  const cCursos = document.getElementById('ind-ch-cursos');
  if (cCursos && d.cursos.length) _indCharts.cursos = new Chart(cCursos, {
    type: 'bar',
    data: { labels: d.cursos.map(c => `G${c.grado}° C${c.curso}`),
      datasets: [{ label: 'Nota promedio', data: d.cursos.map(c => c.p),
        backgroundColor: d.cursos.map(c => (gCmap[c.grado] || '#8ab') + 'b0'),
        borderColor:     d.cursos.map(c => gCmap[c.grado] || '#8ab'),
        borderWidth: 2, borderRadius: 6, borderSkipped: false }] },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false },
        tooltip: { callbacks: { label: c => ` ${c.raw} pts · ${d.cursos[c.dataIndex].n} est.` } } },
      scales: { x: { min: 0, max: 500, grid: { color: 'rgba(255,255,255,.05)' }, ticks: { font: { size: 9 } } },
                y: { grid: { display: false }, ticks: { font: { size: 9 } } } } }
  });

  // PARTICIPACIÓN
  const cPart = document.getElementById('ind-ch-part');
  if (cPart) {
    const allTodos = _indSesiones.map(s => Object.values(s.estudiantes || {}).length);
    const allTerm  = _indSesiones.map(s => Object.values(s.estudiantes || {}).filter(e => e.estado === 'terminado').length);
    _indCharts.part = new Chart(cPart, {
      type: 'bar',
      data: { labels: _indSesiones.map((_, i) => `S${i+1}`),
        datasets: [
          { label: 'Conectados',  data: allTodos,
            backgroundColor: _indSesiones.map((_, i) => i === _indIdx ? 'rgba(0,229,255,.85)' : 'rgba(0,229,255,.22)'),
            borderColor:     _indSesiones.map((_, i) => i === _indIdx ? C_IND.fis : 'transparent'),
            borderWidth: 2, borderRadius: 4, borderSkipped: false },
          { label: 'Finalizaron', data: allTerm,
            backgroundColor: _indSesiones.map((_, i) => i === _indIdx ? 'rgba(57,255,20,.85)' : 'rgba(57,255,20,.22)'),
            borderColor:     _indSesiones.map((_, i) => i === _indIdx ? C_IND.bio : 'transparent'),
            borderWidth: 2, borderRadius: 4, borderSkipped: false }
        ] },
      options: { responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#8ab', boxWidth: 12 } } },
        scales: { x: { grid: { display: false }, ticks: { font: { size: 9 } } },
                  y: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { font: { size: 10 } } } } }
    });
  }
}

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
