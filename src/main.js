// main.js — arranque, navegación y lógica de pantallas
import { estado, resetearEstado } from './estado.js';
import { armarExamen, guardarHistorial } from './examen.js';
import { initBanco } from './banco.js';
import { iniciarAudio, setVolumen, toggleSilencio, setMateria, setRacha, setProgreso, setTiempoRestante } from './audio/motor-audio.js';
import { tocarAcierto, tocarError, tocarRacha, tocarPoder, tocarFanfarra, tocarIntro } from './audio/efectos.js';
import confetti from 'canvas-confetti';
import { adminInicializar } from './admin.js';
import {
  crearSala, unirseASala, iniciarJuego,
  reportarResultado, escucharEstudiantes,
  escucharEstadoSala, cerrarSala, obtenerGradoSala
} from './sala.js';
import { renderRelacionar } from './tipos/relacionar.js';
import { renderOrdenar }    from './tipos/ordenar.js';
import { renderCrucigrama } from './tipos/crucigrama.js';
import { renderClasifica }  from './tipos/clasifica.js';
import { db } from './firebase.js';
import { ref, get, onValue } from 'firebase/database';

// ─── NAVEGACIÓN ────────────────────────────────────────────────────────────
// Pantallas donde el alumno está en medio del examen — se bloquea recarga
const PANTALLAS_EXAMEN = new Set(['pantalla-examen', 'pantalla-retro']);

function _onBeforeUnload(e) {
  e.preventDefault();
  e.returnValue = '';
}

function _onKeydown(e) {
  const esRecarga = e.key === 'F5' ||
    (e.ctrlKey && (e.key === 'r' || e.key === 'R')) ||
    (e.ctrlKey && e.shiftKey && (e.key === 'r' || e.key === 'R'));
  if (esRecarga) e.preventDefault();
}

let antiRecargaActivo = false;

function activarAntiRecarga() {
  if (antiRecargaActivo) return;
  antiRecargaActivo = true;
  window.addEventListener('beforeunload', _onBeforeUnload);
  window.addEventListener('keydown', _onKeydown);
}

function desactivarAntiRecarga() {
  if (!antiRecargaActivo) return;
  antiRecargaActivo = false;
  window.removeEventListener('beforeunload', _onBeforeUnload);
  window.removeEventListener('keydown', _onKeydown);
}

export function irA(id) {
  document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
  const pantalla = document.getElementById(id);
  if (pantalla) pantalla.classList.add('activa');

  if (PANTALLAS_EXAMEN.has(id)) {
    activarAntiRecarga();
  } else {
    desactivarAntiRecarga();
  }

  const widget = document.getElementById('volumen-widget');
  if (widget) widget.classList.toggle('oculto', id !== 'pantalla-examen');
}

// ─── ESTADO DE SALA ───────────────────────────────────────────────────────
const sala = {
  modo:      'solo',   // 'solo' | 'sala'
  rol:       null,     // 'profesor' | 'estudiante'
  codigo:    null,
  uid:       null,     // Firebase key del estudiante
  gradoSala: null,     // 8 | 9 | 10 | 'final'
  unsub:     [],       // funciones de cleanup de listeners
};

function salaLimpiar() {
  sala.unsub.forEach(fn => { try { fn(); } catch {} });
  sala.unsub = [];
}

// ─── PARTÍCULAS DE FONDO ───────────────────────────────────────────────────
(function generarParticulas() {
  const cont = document.getElementById('particulas-fondo');
  if (!cont) return;
  const colores = ['#00e5ff', '#ffd600', '#39ff14', '#ff00c8', '#c0392b'];
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'particula';
    p.style.cssText = `
      left:${Math.random() * 100}%;
      --dur:${6 + Math.random() * 10}s;
      --delay:${Math.random() * 10}s;
      background:${colores[Math.floor(Math.random() * colores.length)]};
      width:${2 + Math.random() * 5}px;
      height:${2 + Math.random() * 5}px;
      box-shadow:0 0 6px currentColor;
    `;
    cont.appendChild(p);
  }
})();

// ─── INICIALIZAR BANCO DESDE FIREBASE ─────────────────────────────────────
await initBanco();

// ─── PORTADA ───────────────────────────────────────────────────────────────
document.getElementById('btn-entrar').addEventListener('click', async () => {
  const snap = await get(ref(db, 'config/habilitado'));
  if (snap.val() !== true) {
    irA('pantalla-bloqueada');
    // Escuchar hasta que el admin habilite, luego volver a portada
    const unsub = onValue(ref(db, 'config/habilitado'), s => {
      if (s.val() === true) {
        unsub();
        irA('pantalla-portada');
      }
    });
    return;
  }
  iniciarAudio();
  setTimeout(() => tocarIntro(), 120);
  sala.modo      = 'solo';
  sala.gradoSala = null;
  document.getElementById('aviso-grado-sala').classList.add('oculto');
  irA('pantalla-registro');
});

document.getElementById('btn-sala').addEventListener('click', () => {
  iniciarAudio();
  irA('pantalla-sala-rol');
});

// ─── VOLVER AL INICIO (registro y admin login) ─────────────────────────────
document.getElementById('btn-volver-registro').addEventListener('click', () => irA('pantalla-portada'));
document.getElementById('btn-volver-admin-login').addEventListener('click', () => irA('pantalla-portada'));

// ─── ELEGIR ROL ────────────────────────────────────────────────────────────
document.getElementById('btn-volver-portada-sala').addEventListener('click', () => irA('pantalla-portada'));

document.getElementById('btn-rol-profesor').addEventListener('click', () => {
  sala.modo = 'sala';
  sala.rol  = 'profesor';
  document.getElementById('inp-prof-user').value = '';
  document.getElementById('inp-prof-pass').value = '';
  document.getElementById('prof-login-error').classList.add('oculto');
  irA('pantalla-login-profesor');
});

document.getElementById('btn-volver-rol-login').addEventListener('click', () => irA('pantalla-sala-rol'));

document.getElementById('btn-prof-entrar').addEventListener('click', async () => {
  const user = document.getElementById('inp-prof-user').value.trim();
  const pass = document.getElementById('inp-prof-pass').value;
  const errEl = document.getElementById('prof-login-error');
  if (await verificarAdmin(user, pass)) {
    errEl.classList.add('oculto');
    irA('pantalla-elegir-grado');
  } else {
    errEl.classList.remove('oculto');
  }
});

// Permitir Enter en la pantalla de login profesor
document.getElementById('inp-prof-pass').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btn-prof-entrar').click();
});

document.getElementById('btn-volver-a-rol').addEventListener('click', () => irA('pantalla-sala-rol'));

document.querySelectorAll('.btn-grado-sel').forEach(btn => {
  btn.addEventListener('click', async () => {
    const grado = btn.dataset.grado === 'final' ? 'final' : parseInt(btn.dataset.grado);
    sala.gradoSala = grado;
    const labelGrado = grado === 'final' ? '🏆 Final Olimpiadas' : `Grado ${grado}°`;
    try {
      const codigo = await crearSala(grado);
      sala.codigo  = codigo;
      document.getElementById('sala-codigo-display').textContent = codigo;
      document.getElementById('sala-grado-badge').textContent = labelGrado;
      document.getElementById('sala-contador').textContent = '0 estudiantes conectados';
      document.getElementById('sala-lista-profesor').innerHTML = '<p style="color:#8ab;padding:20px">Esperando que se conecten…</p>';
      document.getElementById('btn-sala-iniciar').disabled = true;
      irA('pantalla-crear-sala');
      const unsub = escucharEstudiantes(codigo, actualizarLobbyProfesor);
      sala.unsub.push(unsub);
    } catch (err) {
      alert('Error al crear sala. Verifica la configuración de Firebase.\n' + err.message);
    }
  });
});

document.getElementById('btn-rol-estudiante').addEventListener('click', () => {
  sala.modo = 'sala';
  sala.rol  = 'estudiante';
  document.getElementById('inp-codigo-sala').value = '';
  document.getElementById('sala-error-codigo').classList.add('oculto');
  irA('pantalla-unirse');
});

// ─── LOBBY PROFESOR ────────────────────────────────────────────────────────
function actualizarLobbyProfesor(lista) {
  const cont = document.getElementById('sala-contador');
  const listEl = document.getElementById('sala-lista-profesor');
  const btnStart = document.getElementById('btn-sala-iniciar');

  cont.textContent = `${lista.length} estudiante${lista.length !== 1 ? 's' : ''} conectado${lista.length !== 1 ? 's' : ''}`;
  btnStart.disabled = lista.length === 0;

  if (!lista.length) {
    listEl.innerHTML = '<p style="color:#8ab;padding:20px">Esperando que se conecten…</p>';
    return;
  }
  listEl.innerHTML = lista.map(e => `
    <div class="sala-card-estudiante">
      <div class="sala-card-avatar">${e.avatar || '⚗️'}</div>
      <div class="sala-card-info">
        <div class="sala-card-nombre">${e.nombre}</div>
        <div class="sala-card-grado">Grado ${e.grado}° · ${e.curso}</div>
        <div class="sala-card-estado ${e.estado}">${estadoLabel(e.estado)}</div>
      </div>
    </div>`).join('');
}

function estadoLabel(s) {
  return s === 'esperando' ? '⏳ En sala' : s === 'jugando' ? '🎯 En examen' : '✅ Terminó';
}

document.getElementById('btn-sala-iniciar').addEventListener('click', async () => {
  try {
    await iniciarJuego(sala.codigo);
    document.getElementById('btn-sala-iniciar').disabled = true;
    document.getElementById('btn-sala-iniciar').textContent = '✅ Examen en curso…';
  } catch (err) {
    alert('Error al iniciar. ' + err.message);
  }
});

document.getElementById('btn-cancelar-sala').addEventListener('click', async () => {
  if (!confirm('¿Cancelar la sala? Se desconectarán todos los estudiantes.')) return;
  salaLimpiar();
  if (sala.codigo) { try { await cerrarSala(sala.codigo); } catch {} }
  sala.codigo = null;
  irA('pantalla-portada');
});

// ─── UNIRSE A SALA (ESTUDIANTE) ────────────────────────────────────────────
document.getElementById('inp-codigo-sala').addEventListener('input', (e) => {
  e.target.value = e.target.value.toUpperCase();
});

document.getElementById('btn-volver-rol').addEventListener('click', () => irA('pantalla-sala-rol'));

document.getElementById('btn-validar-codigo').addEventListener('click', async () => {
  const codigo = document.getElementById('inp-codigo-sala').value.trim().toUpperCase();
  if (codigo.length < 4) return;
  const errEl = document.getElementById('sala-error-codigo');
  errEl.classList.add('oculto');

  try {
    const res = await obtenerGradoSala(codigo);
    if (res.error) {
      errEl.textContent = res.error;
      errEl.classList.remove('oculto');
      return;
    }
    sala.codigo    = codigo;
    sala.gradoSala = res.grado;

    // Mostrar aviso de grado en el formulario de registro
    const aviso = document.getElementById('aviso-grado-sala');
    if (res.grado === 'final') {
      aviso.innerHTML = '🏆 <strong>Final Olimpiadas</strong> — Se usarán las preguntas de tu grado';
    } else {
      aviso.innerHTML = `⚠️ Esta sala es para <strong>Grado ${res.grado}°</strong> — Selecciónalo en el formulario`;
    }
    aviso.classList.remove('oculto');

    irA('pantalla-registro');
  } catch (err) {
    errEl.textContent = 'Error de conexión. Intenta de nuevo.';
    errEl.classList.remove('oculto');
  }
});

// ─── REGISTRO ──────────────────────────────────────────────────────────────
const inpAvatar     = document.getElementById('inp-avatar');
const avatarPreview = document.getElementById('avatar-preview');

inpAvatar.addEventListener('input', () => {
  inpAvatar.value = inpAvatar.value.toUpperCase();
  avatarPreview.textContent = inpAvatar.value.slice(0, 3) || '⚗️';
});

document.getElementById('form-registro').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre   = document.getElementById('inp-nombre').value.trim();
  const grado    = parseInt(document.getElementById('inp-grado').value);
  const colegio  = document.getElementById('inp-colegio').value;
  const curso    = document.getElementById('inp-curso').value.trim();
  const avatar   = inpAvatar.value.trim().toUpperCase();

  if (!avatar) { alert('Por favor escribe tu apodo de científico ⚗️'); return; }

  // Validar grado contra sala
  const errGrado = document.getElementById('error-grado-sala');
  if (sala.modo === 'sala' && sala.gradoSala !== 'final' && sala.gradoSala !== null) {
    if (grado !== Number(sala.gradoSala)) {
      errGrado.textContent = `Esta sala es para Grado ${sala.gradoSala}°. Selecciona el grado correcto para continuar.`;
      errGrado.classList.remove('oculto');
      return;
    }
  }
  errGrado.classList.add('oculto');

  estado.estudiante = { nombre, grado, colegio, curso, avatar };

  if (sala.modo === 'sala') {
    // Unirse a Firebase y esperar al profesor
    try {
      const res = await unirseASala(sala.codigo, estado.estudiante);
      if (res.error) { alert(res.error); return; }
      sala.uid = res.uid;
      // Mostrar sala de espera
      document.getElementById('espera-codigo-display').textContent = sala.codigo;
      document.getElementById('espera-mi-avatar').textContent = avatar.slice(0, 3);
      irA('pantalla-espera');
      // Escuchar compañeros
      const unsubE = escucharEstudiantes(sala.codigo, actualizarListaEspera);
      sala.unsub.push(unsubE);
      // Escuchar estado → arrancar cuando el profe diga
      const unsubS = escucharEstadoSala(sala.codigo, (estado_) => {
        if (estado_ === 'jugando') {
          salaLimpiar();
          iniciarExamen();
        }
      });
      sala.unsub.push(unsubS);
    } catch (err) {
      alert('Error al conectar: ' + err.message);
    }
  } else {
    iniciarExamen();
  }
});

// ─── INICIO DEL EXAMEN ─────────────────────────────────────────────────────
function iniciarExamen() {
  const estudianteGuardado = { ...estado.estudiante };
  resetearEstado();
  estado.estudiante = estudianteGuardado;
  estado.preguntas = armarExamen(estado.estudiante, sala.gradoSala);
  guardarHistorial(estado.estudiante, estado.preguntas);
  estado.preguntaActual = 0;

  irA('pantalla-examen');
  tocarIntro();
  mostrarPregunta();
  iniciarReloj();
}

// ─── MOSTRAR PREGUNTA ──────────────────────────────────────────────────────
function mostrarPregunta() {
  const p = estado.preguntas[estado.preguntaActual];
  if (!p) { finalizarExamen(); return; }

  // Contador
  document.getElementById('num-pregunta').textContent = estado.preguntaActual + 1;

  // Etiqueta de tipo
  const etiquetas = { quimica: '⚗️ Química', fisica: '⚡ Física', biologia: '🌿 Biología', cts: '🔬 C.T.S.', razonamiento: '🧠 Razonamiento' };
  document.getElementById('tipo-pregunta').textContent = etiquetas[p.materia] || p.materia;

  // Etiqueta de formato si no es selección clásica
  const tipoLabel = document.getElementById('tipo-formato-label');
  const formatoLabel = {
    relacionar:  '🔗 Relacionar',
    ordenar:     '🔢 Ordenar',
    crucigrama:  '📝 Crucigrama',
    clasifica:   '📂 Clasificar',
  };
  if (tipoLabel) {
    const fmt = formatoLabel[p.tipo];
    tipoLabel.textContent = fmt || '';
    tipoLabel.classList.toggle('oculto', !fmt);
  }

  // Enunciado
  document.getElementById('enunciado').textContent = p.enunciado;

  // Imágenes (opcionales)
  const imgEl = document.getElementById('img-pregunta');
  if (p.imagen) {
    imgEl.src = p.imagen.startsWith('http') ? p.imagen : (import.meta.env.BASE_URL + p.imagen);
    imgEl.classList.remove('oculto');
  } else {
    imgEl.src = '';
    imgEl.classList.add('oculto');
  }
  const imgEl2 = document.getElementById('img-pregunta2');
  if (p.imagen2) {
    imgEl2.src = p.imagen2.startsWith('http') ? p.imagen2 : (import.meta.env.BASE_URL + p.imagen2);
    imgEl2.classList.remove('oculto');
  } else {
    imgEl2.src = '';
    imgEl2.classList.add('oculto');
  }

  // Área de interacción
  const grid = document.getElementById('opciones-grid');
  grid.innerHTML = '';
  grid.className = 'opciones-grid';

  const tipo = p.tipo || 'seleccion';
  const INTERACTIVOS = new Set(['relacionar', 'ordenar', 'crucigrama', 'clasifica']);

  if (!INTERACTIVOS.has(tipo)) {
    const letras = ['A', 'B', 'C', 'D'];
    p.opciones.forEach((op, i) => {
      const btn = document.createElement('button');
      btn.className = 'opcion-btn';
      btn.innerHTML = `<strong>${letras[i]}.</strong> ${op}`;
      btn.addEventListener('click', () => responder(i));
      grid.appendChild(btn);
    });
  } else {
    grid.classList.add('tipo-interactivo');
    const renderFn = { relacionar: renderRelacionar, ordenar: renderOrdenar,
                       crucigrama: renderCrucigrama, clasifica: renderClasifica }[tipo];
    if (renderFn) renderFn(p, grid, procesarRespuesta);
  }

  // Barra del reactor
  const progreso = (estado.preguntaActual / 29) * 100;
  document.getElementById('reactor-bar').style.width = progreso + '%';

  setMateria(p.materia);
  setProgreso(estado.preguntaActual + 1);
  actualizarRacha();
  reiniciarReloj();
}

// ─── RESPONDER (selección múltiple) ────────────────────────────────────────
function responder(indiceElegido) {
  detenerReloj();
  const p = estado.preguntas[estado.preguntaActual];
  const correcta = indiceElegido === p.correcta;

  document.querySelectorAll('.opcion-btn').forEach((btn, i) => {
    btn.disabled = true;
    if (i === p.correcta)    btn.classList.add('correcta');
    if (i === indiceElegido && !correcta) btn.classList.add('incorrecta');
  });

  procesarRespuesta(correcta);
}

// ─── PROCESAR RESPUESTA (todos los tipos) ─────────────────────────────────
function procesarRespuesta(esCorrecta) {
  detenerReloj();
  const p = estado.preguntas[estado.preguntaActual];
  const tipo = p?.tipo || 'seleccion';

  let pts = 0;
  if (esCorrecta) {
    pts = 100;
    // Bonus de velocidad solo en selección múltiple
    if (tipo === 'seleccion') {
      const tiempoBase = p?.tiempo || 30;
      pts += Math.round((estado.tiempoRestante / tiempoBase) * 50);
    }
    pts = Math.round(pts * estado.multiplicador);

    tocarAcierto();
    estado.racha++;
    if      (estado.racha >= 8) estado.multiplicador = 3;
    else if (estado.racha >= 5) estado.multiplicador = 2;
    else if (estado.racha >= 3) estado.multiplicador = 1.5;
    else                        estado.multiplicador = 1;

    if (estado.racha === 3) tocarRacha(1);
    if (estado.racha === 5) tocarRacha(2);
    if (estado.racha === 8) tocarRacha(3);

    setRacha(estado.racha);

    if (p.materia === 'razonamiento') estado.aciertos.razonamiento++;
    else estado.aciertos.ciencias++;
  } else {
    tocarError();
    estado.racha = 0;
    estado.multiplicador = 1;
    setRacha(0);
  }

  estado.puntaje += pts;
  estado.respuestas.push({ correcta: esCorrecta, puntaje: pts });

  // Texto de la respuesta correcta (solo para selección múltiple cuando falla)
  const INTERACTIVOS_RESP = new Set(['relacionar', 'ordenar', 'crucigrama', 'clasifica']);
  let respCorrecta = null;
  if (!esCorrecta && !INTERACTIVOS_RESP.has(tipo) && p?.opciones && p.correcta != null) {
    respCorrecta = p.opciones[p.correcta];
  }

  // Más tiempo para ver la correcta resaltada antes de pasar a retro
  const demora = esCorrecta ? 600 : 1400;
  setTimeout(() => mostrarRetro(esCorrecta, pts, p?.explicacion || '', respCorrecta), demora);
}

// ─── RETROALIMENTACIÓN ─────────────────────────────────────────────────────
function mostrarRetro(correcta, pts, explicacion, respCorrecta = null) {
  irA('pantalla-retro');

  document.getElementById('retro-icono').textContent  = correcta ? '✔' : '✖';
  const titulo = document.getElementById('retro-titulo');
  titulo.textContent = correcta ? '¡Correcto!' : 'Incorrecto';
  titulo.className = 'retro-titulo ' + (correcta ? 'correcto' : 'incorrecto');

  // Mostrar la respuesta correcta cuando falló
  const retroCorrecta = document.getElementById('retro-correcta');
  if (!correcta && respCorrecta) {
    retroCorrecta.innerHTML = `✅ La respuesta correcta era:<br><strong>${respCorrecta}</strong>`;
    retroCorrecta.classList.remove('oculto');
  } else {
    retroCorrecta.classList.add('oculto');
  }

  document.getElementById('retro-explicacion').textContent = explicacion;
  document.getElementById('retro-puntos').textContent = correcta
    ? `+${pts} pts ${estado.multiplicador > 1 ? '🔥 x' + estado.multiplicador : ''}`
    : '0 pts';
}

document.getElementById('btn-siguiente-pregunta').addEventListener('click', () => {
  estado.preguntaActual++;
  irA('pantalla-examen');
  mostrarPregunta();
});

// ─── RELOJ ─────────────────────────────────────────────────────────────────
let intervaloReloj = null;

function iniciarReloj() {
  estado.tiempoRestante = 30;
  actualizarDisplayReloj();
}

function reiniciarReloj() {
  detenerReloj();
  const p = estado.preguntas[estado.preguntaActual];
  estado.tiempoRestante = p?.tiempo || 30;
  actualizarDisplayReloj();
  intervaloReloj = setInterval(() => {
    estado.tiempoRestante--;
    estado.tiempoTotal++;
    setTiempoRestante(estado.tiempoRestante);
    actualizarDisplayReloj();
    if (estado.tiempoRestante <= 0) {
      detenerReloj();
      const tipoActual = estado.preguntas[estado.preguntaActual]?.tipo || 'seleccion';
      const INTERACTIVOS = new Set(['relacionar', 'ordenar', 'crucigrama', 'clasifica']);
      if (!INTERACTIVOS.has(tipoActual)) {
        responder(-1); // tiempo agotado → incorrecto
      } else {
        // Deshabilitar controles de tipos interactivos
        document.querySelectorAll('.rel-item, .ord-item, .clas-item, .tipo-confirmar').forEach(el => { el.disabled = true; });
        procesarRespuesta(false);
      }
    }
  }, 1000);
}

function detenerReloj() {
  clearInterval(intervaloReloj);
}

function actualizarDisplayReloj() {
  const el = document.getElementById('reloj');
  el.textContent = estado.tiempoRestante;
  el.parentElement.classList.toggle('reloj-urgente', estado.tiempoRestante <= 10);
}

// ─── PODERES ───────────────────────────────────────────────────────────────
document.getElementById('poder-catalizador').addEventListener('click', () => {
  if (!estado.poderes.catalizador) return;
  const p = estado.preguntas[estado.preguntaActual];
  if (new Set(['relacionar', 'ordenar', 'crucigrama', 'clasifica']).has(p?.tipo)) return; // solo para selección múltiple
  estado.poderes.catalizador = false;
  document.getElementById('poder-catalizador').disabled = true;
  tocarPoder('catalizador');

  const botones = document.querySelectorAll('.opcion-btn:not(:disabled)');
  let eliminados = 0;
  botones.forEach((btn, i) => {
    if (eliminados < 2 && i !== p.correcta) {
      btn.disabled = true;
      btn.style.opacity = '0.2';
      eliminados++;
    }
  });
});

document.getElementById('poder-reposo').addEventListener('click', () => {
  if (!estado.poderes.reposo) return;
  estado.poderes.reposo = false;
  document.getElementById('poder-reposo').disabled = true;
  tocarPoder('reposo');
  detenerReloj();
  setTimeout(() => reiniciarReloj(), 15000);
});

document.getElementById('poder-isotopo').addEventListener('click', () => {
  if (!estado.poderes.isotopo) return;
  estado.poderes.isotopo = false;
  document.getElementById('poder-isotopo').disabled = true;
  tocarPoder('isotopo');
  // Cambiar por otra pregunta del mismo tema (si existe)
  const actual = estado.preguntas[estado.preguntaActual];
  const candidatos = estado.preguntas.filter(
    (p, i) => i !== estado.preguntaActual && p.tema === actual.tema && i > estado.preguntaActual
  );
  if (candidatos.length) {
    const idx = estado.preguntas.indexOf(candidatos[0]);
    [estado.preguntas[estado.preguntaActual], estado.preguntas[idx]] =
    [estado.preguntas[idx], estado.preguntas[estado.preguntaActual]];
  }
  reiniciarReloj();
  mostrarPregunta();
});

// ─── SILENCIO / VOLUMEN ────────────────────────────────────────────────────
document.getElementById('btn-silencio').addEventListener('click', () => {
  const ahora = toggleSilencio();
  estado.silencio = ahora;
  document.getElementById('btn-silencio').textContent = ahora ? '🔇' : '🔊';
});

document.getElementById('ctrl-volumen').addEventListener('input', (e) => {
  const v = parseFloat(e.target.value);
  estado.volumen = v;
  setVolumen(v);
});

// ─── FINALIZAR EXAMEN ──────────────────────────────────────────────────────
function finalizarExamen() {
  detenerReloj();
  const nota = calcularNota();
  guardarEnRanking(nota);       // primero guardar para que el badge lo lea
  mostrarResultados(nota);
  const ranking = JSON.parse(localStorage.getItem('ranking') || '[]');
  const puesto = ranking.findIndex(r =>
    r.nombre === estado.estudiante.nombre && String(r.puntaje) === String(estado.puntaje)
  ) + 1;
  tocarFanfarra(puesto >= 1 && puesto <= 3 ? puesto : 0);

  // En modo sala, reportar resultado a Firebase
  if (sala.modo === 'sala' && sala.codigo && sala.uid) {
    reportarResultado(sala.codigo, sala.uid, estado.puntaje, String(nota)).catch(() => {});
  }

  irA('pantalla-resultados');
}

function calcularNota() {
  const pctC = estado.aciertos.ciencias / 19;
  const pctR = estado.aciertos.razonamiento / 10;
  // Escala ICFES: máximo 500 puntos (ciencias 80 %, razonamiento 20 %)
  const nota = Math.round((pctC * 0.8 + pctR * 0.2) * 500);
  estado.notaFinal = nota;
  return nota;
}

function mostrarResultados(nota) {
  const e = estado.estudiante;
  document.getElementById('res-estudiante').textContent =
    `${e.nombre} · ${e.avatar} · Grado ${e.grado}° · Curso ${e.curso} · ${e.colegio || ''}`;

  document.getElementById('res-puntaje').textContent = estado.puntaje.toLocaleString('es-CO');
  document.getElementById('res-nota').textContent = nota;

  const pctC = (estado.aciertos.ciencias / 19) * 100;
  const pctR = (estado.aciertos.razonamiento / 10) * 100;
  document.getElementById('barra-ciencias').style.width = pctC + '%';
  document.getElementById('barra-razon').style.width    = pctR + '%';
  document.getElementById('txt-ciencias').textContent   = `${estado.aciertos.ciencias}/19`;
  document.getElementById('txt-razon').textContent      = `${estado.aciertos.razonamiento}/10`;

  // Badge de posición en el ranking
  const badge = document.getElementById('tu-posicion-badge');
  if (badge) {
    const ranking = JSON.parse(localStorage.getItem('ranking') || '[]');
    const puesto = ranking.findIndex(r =>
      r.nombre === estado.estudiante.nombre && String(r.puntaje) === String(estado.puntaje)
    ) + 1;
    if (puesto > 0) {
      const emojis = { 1: '🥇', 2: '🥈', 3: '🥉' };
      const emoji  = emojis[puesto] || '🎓';
      badge.innerHTML = `${emoji} Posición <strong>#${puesto}</strong> en el ranking`;
      badge.className = `tu-posicion-badge puesto-${Math.min(puesto, 4)}`;
    }
  }
}

function guardarEnRanking(nota) {
  const ranking = JSON.parse(localStorage.getItem('ranking') || '[]');
  const entrada = {
    nombre:   estado.estudiante.nombre,
    avatar:   estado.estudiante.avatar,
    grado:    estado.estudiante.grado,
    colegio:  estado.estudiante.colegio || '',
    curso:    estado.estudiante.curso,
    puntaje: estado.puntaje,
    nota:    String(nota),
    tiempo:  estado.tiempoTotal,
    fecha:   new Date().toLocaleDateString('es-CO')
  };
  ranking.push(entrada);
  // Ordenar: 1° puntaje desc, 2° aciertos desc (sumados), 3° tiempo asc
  ranking.sort((a, b) =>
    b.puntaje - a.puntaje ||
    parseFloat(b.nota) - parseFloat(a.nota) ||
    a.tiempo - b.tiempo
  );
  localStorage.setItem('ranking', JSON.stringify(ranking));
}

// ─── RESULTADOS → PODIO ────────────────────────────────────────────────────
document.getElementById('btn-ver-podio').addEventListener('click', () => {
  irA('pantalla-podio');
  renderizarPodio();
});

document.getElementById('btn-nuevo-intento').addEventListener('click', () => {
  resetearEstado();
  irA('pantalla-registro');
});

// ─── PODIO / RANKING ───────────────────────────────────────────────────────
document.getElementById('btn-volver-portada').addEventListener('click', () => {
  irA('pantalla-portada');
});

document.querySelectorAll('.btn-filtro').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('activo'));
    btn.classList.add('activo');
    renderizarTablaRanking(btn.dataset.filtro);
  });
});

function renderizarPodio() {
  const datos = JSON.parse(localStorage.getItem('ranking') || '[]');
  const top3 = datos.slice(0, 3);
  const medallas = ['🥇', '🥈', '🥉'];
  const clases   = ['primer', 'segundo', 'tercero'];
  const contenedor = document.getElementById('podio-top3');

  const orden = top3.length >= 3 ? [1, 0, 2] : top3.map((_, i) => i);
  contenedor.innerHTML = orden.map(i => {
    const p = top3[i];
    if (!p) return '';
    const esMio = p.nombre === estado.estudiante.nombre && String(p.puntaje) === String(estado.puntaje);
    return `
      <div class="podio-lugar ${clases[i]}${esMio ? ' es-mio' : ''}">
        <div class="podio-medalla">${medallas[i]}</div>
        <div class="podio-elemento">${p.avatar}</div>
        <div class="podio-nombre">${p.nombre}</div>
        <div class="podio-grado">Grado ${p.grado}° · ${p.curso}</div>
        <div class="podio-pts">${Number(p.puntaje).toLocaleString('es-CO')} pts</div>
        <div class="podio-nota">${p.nota}/5.0</div>
        <div class="podio-plataforma">${i + 1}</div>
      </div>`;
  }).join('');

  renderizarTablaRanking('todos');

  // Confetti según posición del estudiante actual
  const miPuesto = datos.findIndex(r =>
    r.nombre === estado.estudiante.nombre && String(r.puntaje) === String(estado.puntaje)
  ) + 1;
  if      (miPuesto === 1) lanzarConfettiEpico();
  else if (miPuesto <= 3)  lanzarConfettiMedio();
  else                     lanzarConfettiSuave();
}

function renderizarTablaRanking(filtro) {
  const datos = JSON.parse(localStorage.getItem('ranking') || '[]');
  const filtrados = filtro === 'todos' ? datos : datos.filter(p => String(p.grado) === String(filtro));
  const topClases = ['top1', 'top2', 'top3'];
  const prefijos  = ['🥇 ', '🥈 ', '🥉 '];
  const tbody = document.getElementById('ranking-tbody');
  tbody.innerHTML = filtrados.map((p, i) => {
    const esMio = p.nombre === estado.estudiante.nombre && String(p.puntaje) === String(estado.puntaje);
    return `
    <tr class="${topClases[i] || ''}${esMio ? ' mi-fila' : ''}">
      <td>${(prefijos[i] || '') + (i + 1)}</td>
      <td>${p.nombre}${esMio ? ' ◀' : ''}</td>
      <td>${p.avatar}</td>
      <td>${p.grado}°</td>
      <td>${p.curso}</td>
      <td>${Number(p.puntaje).toLocaleString('es-CO')}</td>
      <td>${p.nota}</td>
    </tr>`;
  }).join('');

  if (!filtrados.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#8ab">Sin resultados aún</td></tr>';
  }
}

// ─── SALA DE ESPERA (estudiante) ───────────────────────────────────────────
function actualizarListaEspera(lista) {
  const listEl = document.getElementById('sala-lista-estudiante');
  listEl.innerHTML = lista.map(e => `
    <div class="sala-card-estudiante">
      <div class="sala-card-avatar">${e.avatar || '⚗️'}</div>
      <div class="sala-card-info">
        <div class="sala-card-nombre">${e.nombre}</div>
        <div class="sala-card-grado">Grado ${e.grado}°</div>
      </div>
    </div>`).join('');
}

// ─── CONFETTI ──────────────────────────────────────────────────────────────
function lanzarConfettiEpico() {
  const colores = ['#ffd600', '#ff00c8', '#00e5ff', '#39ff14', '#ffffff'];
  // Explosión central inicial
  confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 }, colors: colores });
  // Lluvia lateral continua 3.5s
  const fin = Date.now() + 3500;
  (function bucle() {
    confetti({ particleCount: 4, angle: 60,  spread: 55, origin: { x: 0 }, colors: colores });
    confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors: colores });
    if (Date.now() < fin) requestAnimationFrame(bucle);
  }());
}

function lanzarConfettiMedio() {
  confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 },
    colors: ['#c0c0c0', '#00e5ff', '#ffffff', '#39ff14'] });
}

function lanzarConfettiSuave() {
  confetti({ particleCount: 35, spread: 55, origin: { y: 0.7 } });
}

// ─── RACHA DISPLAY ─────────────────────────────────────────────────────────
function actualizarRacha() {
  const el = document.getElementById('racha-display');
  if (estado.racha >= 3) {
    const emojis = { 1.5: '🔥', 2: '🔥🔥', 3: '🔥🔥🔥' };
    el.textContent = `Racha x${estado.multiplicador} ${emojis[estado.multiplicador] || ''}  — ${estado.racha} aciertos seguidos`;
  } else {
    el.textContent = '';
  }
}

// ─── ADMIN (Ctrl+Shift+A) ──────────────────────────────────────────────────
function abrirPantallaAdmin() {
  irA('pantalla-admin');
  document.getElementById('admin-panel').classList.add('oculto');
  document.getElementById('admin-login-box').classList.remove('oculto');
  document.getElementById('admin-login').style.display = 'flex';
  document.getElementById('admin-error').classList.add('oculto');
  document.getElementById('inp-admin-user').value = '';
  document.getElementById('inp-admin-pass').value = '';
}

document.getElementById('btn-ir-admin').addEventListener('click', abrirPantallaAdmin);

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'A') {
    e.preventDefault();
    abrirPantallaAdmin();
  }
});

document.getElementById('btn-admin-entrar').addEventListener('click', async () => {
  const user = document.getElementById('inp-admin-user').value.trim();
  const pass = document.getElementById('inp-admin-pass').value;
  if (await verificarAdmin(user, pass)) {
    document.getElementById('admin-login-box').classList.add('oculto');
    document.getElementById('admin-panel').classList.remove('oculto');
    adminInicializar();
  } else {
    document.getElementById('admin-error').classList.remove('oculto');
  }
});

document.getElementById('btn-admin-salir').addEventListener('click', () => irA('pantalla-portada'));

const ADMIN_USER = 'admin';
const ADMIN_HASH = '31e99cad92af26174febd9dae33f155187521845fe00b294824909150afee575'; // iti2026

async function verificarAdmin(user, pass) {
  if (user.toLowerCase() !== ADMIN_USER) return false;
  return (await sha256(pass)) === ADMIN_HASH;
}

async function sha256(texto) {
  const data   = new TextEncoder().encode(texto);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── VISTA PREVIA ADMIN ────────────────────────────────────────────────────
let _preguntaPreview = null;

document.getElementById('btn-cerrar-preview').addEventListener('click', () => {
  irA('pantalla-admin');
});

document.getElementById('btn-preview-volver').addEventListener('click', () => {
  irA('pantalla-admin');
});

document.getElementById('btn-preview-retry').addEventListener('click', () => {
  if (_preguntaPreview) iniciarPreview(_preguntaPreview);
});

function autoRellenarCrucigrama(p, area) {
  if (!p.palabras) return;
  p.palabras.forEach(palabra => {
    for (let k = 0; k < palabra.texto.length; k++) {
      const f = palabra.dir === 'H' ? palabra.fila : palabra.fila + k;
      const c = palabra.dir === 'H' ? palabra.col + k : palabra.col;
      const inp = area.querySelector(`input[data-f="${f}"][data-c="${c}"]`);
      if (inp && !inp.disabled) {
        inp.value = palabra.texto[k];
        inp.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  });
}

function iniciarPreview(p) {
  _preguntaPreview = p;

  const etiquetas = { quimica: '⚗️ Química', fisica: '⚡ Física', biologia: '🌿 Biología', cts: '🔬 C.T.S.', razonamiento: '🧠 Razonamiento' };
  document.getElementById('preview-materia').textContent = etiquetas[p.materia] || p.materia;

  const formatoLabel = { relacionar: '🔗 Relacionar', ordenar: '🔢 Ordenar', crucigrama: '📝 Crucigrama', clasifica: '📂 Clasificar' };
  const fmtEl = document.getElementById('preview-formato');
  fmtEl.textContent = formatoLabel[p.tipo] || '';
  fmtEl.classList.toggle('oculto', !p.tipo || p.tipo === 'seleccion');

  document.getElementById('preview-enunciado').textContent = p.enunciado;

  const imgEl = document.getElementById('preview-img');
  if (p.imagen) {
    imgEl.src = p.imagen.startsWith('http') ? p.imagen : (import.meta.env.BASE_URL + p.imagen);
    imgEl.classList.remove('oculto');
  } else {
    imgEl.src = '';
    imgEl.classList.add('oculto');
  }
  const imgEl2p = document.getElementById('preview-img2');
  if (p.imagen2) {
    imgEl2p.src = p.imagen2.startsWith('http') ? p.imagen2 : (import.meta.env.BASE_URL + p.imagen2);
    imgEl2p.classList.remove('oculto');
  } else {
    imgEl2p.src = '';
    imgEl2p.classList.add('oculto');
  }

  // Ocultar feedback anterior
  document.getElementById('preview-feedback').classList.add('oculto');

  // Renderizar opciones / tipo interactivo
  const area = document.getElementById('preview-opciones');
  area.innerHTML = '';
  area.className = 'opciones-grid';

  const tipo = p.tipo || 'seleccion';

  // Botón de autorellenar (solo crucigrama)
  const btnResolver = document.getElementById('btn-preview-resolver');
  btnResolver.classList.toggle('oculto', tipo !== 'crucigrama');
  btnResolver.onclick = null; // limpiar listener previo

  const onRespuesta = (esCorrecta) => mostrarPreviewFeedback(p, esCorrecta);

  if (tipo === 'seleccion') {
    const letras = ['A', 'B', 'C', 'D'];
    p.opciones.forEach((op, i) => {
      const btn = document.createElement('button');
      btn.className = 'opcion-btn';
      btn.innerHTML = `<strong>${letras[i]}.</strong> ${op}`;
      btn.addEventListener('click', () => {
        area.querySelectorAll('.opcion-btn').forEach((b, j) => {
          b.disabled = true;
          if (j === p.correcta)              b.classList.add('correcta');
          if (j === i && i !== p.correcta)   b.classList.add('incorrecta');
        });
        setTimeout(() => onRespuesta(i === p.correcta), 1000);
      });
      area.appendChild(btn);
    });
  } else {
    area.classList.add('tipo-interactivo');
    const renderFn = { relacionar: renderRelacionar, ordenar: renderOrdenar,
                       crucigrama: renderCrucigrama, clasifica: renderClasifica }[tipo];
    if (renderFn) renderFn(p, area, onRespuesta);
  }

  // Conectar autorellenar DESPUÉS de que el renderer haya creado los inputs
  if (tipo === 'crucigrama') {
    btnResolver.onclick = () => autoRellenarCrucigrama(p, area);
  }

  irA('pantalla-preview');
  // Scroll al inicio
  document.getElementById('pantalla-preview').scrollTo(0, 0);
}

function mostrarPreviewFeedback(p, esCorrecta) {
  const titulo = document.getElementById('preview-fb-titulo');
  titulo.textContent = esCorrecta ? '✅ ¡Correcto!' : '❌ Incorrecto';
  titulo.className   = 'preview-fb-titulo ' + (esCorrecta ? 'fb-ok' : 'fb-mal');

  const correctaBox = document.getElementById('preview-correcta-box');
  const tipo = p.tipo || 'seleccion';
  if (!esCorrecta && tipo === 'seleccion' && p.opciones && p.correcta != null) {
    correctaBox.innerHTML = `La respuesta correcta era:<br><strong>${p.opciones[p.correcta]}</strong>`;
    correctaBox.classList.remove('oculto');
  } else {
    correctaBox.classList.add('oculto');
  }

  document.getElementById('preview-explicacion').textContent = p.explicacion || '(sin explicación)';

  const fb = document.getElementById('preview-feedback');
  fb.classList.remove('oculto');
  fb.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Exponer al admin.js (evita dependencia circular)
window._adminPreview = (id) => {
  const { getBanco } = window._bancoPorAdmin || {};
  if (!getBanco) return;
  const p = getBanco().find(q => q.id === id);
  if (p) iniciarPreview(p);
};
