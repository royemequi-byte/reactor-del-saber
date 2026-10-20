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
const _indCharts = {};   // key → [Chart, Chart, ...]
const C_IND = {
  bio: '#39ff14', fis: '#00e5ff', qui: '#ff9f1c',
  cts: '#ff69b4', rzn: '#a78bfa', gold: '#ffd600',
};

function _killCharts(key) {
  (_indCharts[key] || []).forEach(c => c?.destroy());
  delete _indCharts[key];
}

function _calcAct(act) {
  const term   = Object.values(act.estudiantes || {}).filter(e => e.estado === 'terminado');
  const cuotas = act.cuotas || {};
  const mats   = ['biologia', 'fisica', 'quimica', 'cts', 'razonamiento'];

  // % aciertos por materia
  const pctMat = {};
  mats.forEach(m => {
    const total = [8, 9, 10].reduce((s, g) => s + (cuotas[`grado${g}`]?.[m] || 0), 0) / 3;
    if (!total) { pctMat[m] = 0; return; }
    const prom = term.length ? term.reduce((s, e) => s + (e.aciertos?.[m] || 0), 0) / term.length : 0;
    pctMat[m] = Math.round((prom / total) * 100);
  });

  // notas
  const notas = term.map(e => Number(e.nota) || 0);
  const promNota = notas.length ? Math.round(notas.reduce((a, b) => a + b, 0) / notas.length) : 0;

  // histograma 8 bins (0-500)
  const bins = [0, 0, 0, 0, 0, 0, 0, 0];
  notas.forEach(n => {
    const i = Math.min(7, Math.floor(n / 62.5));
    bins[i]++;
  });

  // por grado
  const porGrado = [8, 9, 10].map(g => {
    const grupo = term.filter(e => +e.grado === g);
    if (!grupo.length) return null;
    const ns = grupo.map(e => Number(e.nota) || 0);
    const pctG = {};
    mats.forEach(m => {
      const tot = cuotas[`grado${g}`]?.[m] || 0;
      pctG[m] = tot ? Math.round((grupo.reduce((s, e) => s + (e.aciertos?.[m] || 0), 0) / grupo.length / tot) * 100) : 0;
    });
    return { g, n: grupo.length, prom: Math.round(ns.reduce((a, b) => a + b, 0) / ns.length), pctMat: pctG };
  }).filter(Boolean);

  // top 3
  const top3 = term.slice().sort((a, b) => Number(b.nota) - Number(a.nota)).slice(0, 3);

  return { term, notas, promNota, pctMat, bins, porGrado, top3 };
}

function _podioHTML(top3) {
  if (!top3.length) return '<p style="color:#6b7280;text-align:center;padding:20px">Sin datos</p>';
  const pc = ['#ffd600', '#c0c0d0', '#cd7f32'];
  const em = ['🥇', '🥈', '🥉'];
  const h  = [110, 80, 60];
  const ord = top3.length >= 2 ? [1, 0, 2] : [0];
  return `<div class="ind-podio">${ord.map(o => {
    const p = top3[o]; if (!p) return '';
    return `<div class="ind-pcol">
      <div class="ind-pav" style="border-color:${pc[o]};color:${pc[o]};box-shadow:0 0 12px ${pc[o]}40">${o + 1}°</div>
      <div class="ind-pname">${p.nombre}</div>
      <div class="ind-pnota" style="color:${pc[o]}">${p.nota}/500</div>
      <div class="ind-pcurso">${p.grado}° · ${p.curso || '—'}</div>
      <div class="ind-pbase" style="height:${h[o]}px;border-color:${pc[o]};color:${pc[o]}">${em[o]}</div>
    </div>`;
  }).join('')}</div>`;
}

function _renderActCharts(key, d) {
  const charts = [];
  const mats = ['biologia', 'fisica', 'quimica', 'cts', 'razonamiento'];
  const matLbl = ['🌿 Bio', '⚡ Fís', '⚗️ Qui', '🔬 CTS', '🧠 Rzn'];
  const matCol = [C_IND.bio, C_IND.fis, C_IND.qui, C_IND.cts, C_IND.rzn];

  // Chart 1: barras materias
  const cMat = document.getElementById(`ind-ch-mat-${key}`);
  if (cMat) charts.push(new Chart(cMat, {
    type: 'bar',
    data: {
      labels: matLbl,
      datasets: [{ data: mats.map(m => d.pctMat[m]),
        backgroundColor: matCol.map(c => c + 'bb'),
        borderColor: matCol, borderWidth: 2, borderRadius: 6, borderSkipped: false }]
    },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.raw}%` } } },
      scales: { x: { max: 100, ticks: { callback: v => v + '%' }, grid: { color: 'rgba(255,255,255,.06)' } }, y: { grid: { display: false } } }
    }
  }));

  // Chart 2: histograma notas
  const cHisto = document.getElementById(`ind-ch-histo-${key}`);
  const hLbl = ['0-62', '63-125', '126-187', '188-250', '251-312', '313-375', '376-437', '438-500'];
  if (cHisto) charts.push(new Chart(cHisto, {
    type: 'bar',
    data: {
      labels: hLbl,
      datasets: [{ label: 'Estudiantes', data: d.bins,
        backgroundColor: d.bins.map((_, i) => `hsla(${200 - i / 7 * 160},100%,55%,.75)`),
        borderColor: d.bins.map((_, i) => `hsl(${200 - i / 7 * 160},100%,65%)`),
        borderWidth: 2, borderRadius: 5, borderSkipped: false }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(255,255,255,.06)' }, ticks: { stepSize: 1 } } }
    }
  }));

  // Chart 3: comparativo grados
  const cGrados = document.getElementById(`ind-ch-grados-${key}`);
  if (cGrados && d.porGrado.length) {
    const gColors = { 8: C_IND.fis, 9: C_IND.qui, 10: C_IND.bio };
    charts.push(new Chart(cGrados, {
      type: 'bar',
      data: {
        labels: d.porGrado.map(g => `Grado ${g.g}° (${g.n})`),
        datasets: [
          { label: 'Nota prom.', data: d.porGrado.map(g => g.prom), yAxisID: 'y',
            backgroundColor: d.porGrado.map(g => gColors[g.g] + 'bb'),
            borderColor: d.porGrado.map(g => gColors[g.g]),
            borderWidth: 2, borderRadius: 8, borderSkipped: false },
          { label: 'Estudiantes', data: d.porGrado.map(g => g.n),
            type: 'line', yAxisID: 'y2',
            borderColor: C_IND.gold, backgroundColor: C_IND.gold + '18',
            pointBackgroundColor: C_IND.gold, pointRadius: 6, borderWidth: 2, tension: .3, fill: false }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#8ab', boxWidth: 12, font: { family: 'LiberationMono' } } } },
        scales: {
          y:  { position: 'left',  max: 500, grid: { color: 'rgba(255,255,255,.06)' } },
          y2: { position: 'right', grid: { display: false }, ticks: { color: C_IND.gold } }
        }
      }
    }));
  }

  _indCharts[key] = charts;
}

function _actCardHTML(act, i, d) {
  const maxNota = d.notas.length ? Math.max(...d.notas) : 0;
  const term    = d.term.length;
  return `
    <div class="ind-card" style="margin-bottom:12px">
      <div class="ind-card-head" onclick="window._togInd('${act.key}')">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;flex:1">
          <span style="font-family:'LiberationMono',monospace;font-weight:bold;color:#ffd600;font-size:.95rem">📅 ${act.fecha}</span>
          <span style="color:#00e5ff;font-size:.82rem">🕐 ${act.hora}</span>
          <span class="admin-badge grado">${act.totalEstudiantes} participantes</span>
          <span class="admin-badge dif">${term} completaron</span>
          <span class="admin-badge" style="color:#39ff14">Prom: ${d.promNota}/500</span>
          <span class="admin-badge" style="color:#ffd600">Mejor: ${maxNota}/500</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-left:auto">
          <button class="btn-accion verde chico" style="font-size:.75rem;padding:5px 10px;font-family:'LiberationMono',monospace"
            onclick="event.stopPropagation();window._xlsActInd('${act.key}')">📥 Excel</button>
          <span id="ind-arr-${act.key}" style="color:#8ab;font-size:.82rem">▼</span>
        </div>
      </div>
      <div id="ind-panel-${act.key}" class="${i === 0 ? '' : 'oculto'}" style="margin-top:14px">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:16px">

          <!-- Podio -->
          <div class="ind-chart-card" style="display:flex;flex-direction:column">
            <div class="ind-chart-title">🏅 Podio · Top 3</div>
            ${_podioHTML(d.top3)}
          </div>

          <!-- Materias -->
          <div class="ind-chart-card">
            <div class="ind-chart-title">📚 Aciertos por materia</div>
            <div style="position:relative;height:170px"><canvas id="ind-ch-mat-${act.key}"></canvas></div>
          </div>

          <!-- Grados -->
          <div class="ind-chart-card">
            <div class="ind-chart-title">🎓 Por grado</div>
            <div style="position:relative;height:170px"><canvas id="ind-ch-grados-${act.key}"></canvas></div>
          </div>

        </div>

        <!-- Histograma full width -->
        <div class="ind-chart-card" style="margin-bottom:0">
          <div class="ind-chart-title">🎯 Distribución de notas</div>
          <div style="position:relative;height:150px"><canvas id="ind-ch-histo-${act.key}"></canvas></div>
        </div>
      </div>
    </div>`;
}

async function renderIndicadores() {
  const cont = document.getElementById('ind-contenido');
  if (!cont) return;
  cont.innerHTML = '<p class="admin-vacio">Cargando indicadores…</p>';

  const snap = await get(ref(db, 'historial'));
  if (!snap.exists()) {
    cont.innerHTML = '<p class="admin-vacio">No hay actividades guardadas aún. Guarda una actividad desde el panel de control.</p>';
    return;
  }

  const actividades = Object.entries(snap.val())
    .map(([key, val]) => ({ key, ...val }))
    .sort((a, b) => b.timestamp - a.timestamp);

  // calcular datos de cada actividad
  const datos = actividades.map(a => ({ act: a, d: _calcAct(a) }));

  // Gráfico evolución global (promedio por sesión)
  const evolLabels = actividades.map(a => a.fecha + '\n' + a.hora).reverse();
  const evolData   = datos.map(({ d }) => d.promNota).reverse();

  cont.innerHTML = `
    <style>
      #ind-contenido { font-family: 'LiberationMono', monospace; }
      .ind-card { background:#1a1a2e; border:1px solid #2a2a45; border-radius:14px; overflow:hidden; }
      .ind-card-head { display:flex; align-items:center; padding:12px 16px; cursor:pointer;
        background:#12121e; border-bottom:1px solid #2a2a45; gap:8px;
        transition:background .15s; }
      .ind-card-head:hover { background:#1e1e38; }
      .ind-chart-card { background:#12121e; border:1px solid #2a2a45; border-radius:10px;
        padding:14px 16px; }
      .ind-chart-title { font-family:'LiberationMono',monospace; font-weight:bold;
        font-size:.82rem; color:#e8e8f0; margin-bottom:10px; }
      .ind-podio { display:flex; align-items:flex-end; justify-content:center;
        gap:8px; padding:10px 4px 4px; height:160px; }
      .ind-pcol { display:flex; flex-direction:column; align-items:center; gap:4px;
        flex:1; max-width:90px; }
      .ind-pav { width:42px; height:42px; border-radius:50%; display:flex;
        align-items:center; justify-content:center; font-weight:900; font-size:.85rem;
        border:2px solid; background:rgba(255,255,255,.05); }
      .ind-pname { font-size:.65rem; font-weight:700; text-align:center; color:#e8e8f0;
        font-family:'LiberationMono',monospace; }
      .ind-pnota { font-size:.75rem; font-weight:800; font-family:'LiberationMono',monospace; }
      .ind-pcurso { font-size:.6rem; color:#6b7280; }
      .ind-pbase { border-radius:6px 6px 0 0; width:100%; display:flex;
        align-items:center; justify-content:center; font-size:1.2rem; font-weight:900;
        border:1px solid; border-bottom:none;
        background:linear-gradient(180deg,rgba(255,255,255,.08),transparent); }
      .ind-evol-card { background:#1a1a2e; border:1px solid #2a2a45; border-radius:14px;
        padding:16px 18px; margin-bottom:14px; }
      .ind-evol-title { font-family:'LiberationMono',monospace; font-weight:bold;
        font-size:.9rem; color:#39ff14; margin-bottom:6px; }
      .ind-evol-sub { font-size:.75rem; color:#6b7280; margin-bottom:12px; }
      @media(max-width:800px){
        #ind-contenido [style*="grid-template-columns:1fr 1fr 1fr"]{
          grid-template-columns:1fr !important; }
      }
    </style>

    ${actividades.length > 1 ? `
    <div class="ind-evol-card">
      <div class="ind-evol-title">📈 Evolución del promedio general</div>
      <div class="ind-evol-sub">${actividades.length} sesión(es) guardadas · nota promedio /500</div>
      <div style="position:relative;height:160px"><canvas id="ind-ch-evol"></canvas></div>
    </div>` : ''}

    ${datos.map(({ act, d }, i) => _actCardHTML(act, i, d)).join('')}
  `;

  // Render evolución
  if (actividades.length > 1) {
    const evolEl = document.getElementById('ind-ch-evol');
    if (evolEl) new Chart(evolEl, {
      type: 'line',
      data: {
        labels: evolLabels,
        datasets: [{ label: 'Nota prom.', data: evolData,
          borderColor: C_IND.bio, backgroundColor: C_IND.bio + '18',
          pointBackgroundColor: C_IND.bio, pointRadius: 5, borderWidth: 2, tension: .4, fill: true }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false },
          tooltip: { callbacks: { label: c => ` Prom: ${c.raw}/500` } } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { font: { family: 'LiberationMono', size: 10 } } },
          y: { min: 0, max: 500, grid: { color: 'rgba(255,255,255,.06)' },
            ticks: { font: { family: 'LiberationMono' } } }
        }
      }
    });
  }

  // Render charts de la primera actividad abierta
  if (datos.length) _renderActCharts(datos[0].act.key, datos[0].d);

  // Toggle acordeón
  window._togInd = key => {
    const panel = document.getElementById(`ind-panel-${key}`);
    const arr   = document.getElementById(`ind-arr-${key}`);
    const open  = !panel.classList.contains('oculto');
    if (open) {
      panel.classList.add('oculto');
      arr && (arr.textContent = '▼');
      _killCharts(key);
    } else {
      panel.classList.remove('oculto');
      arr && (arr.textContent = '▲');
      const d = datos.find(x => x.act.key === key)?.d;
      if (d) _renderActCharts(key, d);
    }
  };

  // Excel por actividad
  window._xlsActInd = key => descargarXlsActividad(key);
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
