// main.js — arranque, navegación y lógica de pantallas
import { estado, resetearEstado } from './estado.js';
import { armarExamen, guardarHistorial } from './examen.js';
import { iniciarAudio, setVolumen, toggleSilencio, setMateria, setRacha, setProgreso, setTiempoRestante } from './audio/motor-audio.js';
import { tocarAcierto, tocarError, tocarRacha, tocarPoder, tocarFanfarra, tocarIntro } from './audio/efectos.js';
import confetti from 'canvas-confetti';
import { adminInicializar } from './admin.js';

// ─── NAVEGACIÓN ────────────────────────────────────────────────────────────
export function irA(id) {
  document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
  const pantalla = document.getElementById(id);
  if (pantalla) pantalla.classList.add('activa');

  const widget = document.getElementById('volumen-widget');
  if (widget) widget.classList.toggle('oculto', id !== 'pantalla-examen');
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

// ─── PORTADA ───────────────────────────────────────────────────────────────
document.getElementById('btn-entrar').addEventListener('click', () => {
  iniciarAudio();
  setTimeout(() => tocarIntro(), 120); // pequeño delay para que el contexto arranque
  irA('pantalla-registro');
});

// ─── REGISTRO ──────────────────────────────────────────────────────────────
const inpAvatar     = document.getElementById('inp-avatar');
const avatarPreview = document.getElementById('avatar-preview');

inpAvatar.addEventListener('input', () => {
  inpAvatar.value = inpAvatar.value.toUpperCase();
  avatarPreview.textContent = inpAvatar.value.slice(0, 3) || '⚗️';
});

document.getElementById('form-registro').addEventListener('submit', (e) => {
  e.preventDefault();

  const nombre = document.getElementById('inp-nombre').value.trim();
  const grado  = parseInt(document.getElementById('inp-grado').value);
  const curso  = document.getElementById('inp-curso').value.trim();
  const avatar = inpAvatar.value.trim().toUpperCase();

  if (!avatar) { alert('Por favor escribe tu apodo de científico ⚗️'); return; }

  estado.estudiante = { nombre, grado, curso, avatar };
  iniciarExamen();
});

// ─── INICIO DEL EXAMEN ─────────────────────────────────────────────────────
function iniciarExamen() {
  resetearEstado();
  estado.preguntas = armarExamen(estado.estudiante);
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
  const etiquetas = { quimica: '⚗️ Química', fisica: '⚡ Física', biologia: '🌿 Biología', razonamiento: '🧠 Razonamiento' };
  document.getElementById('tipo-pregunta').textContent = etiquetas[p.materia] || p.materia;

  // Enunciado
  document.getElementById('enunciado').textContent = p.enunciado;

  // Opciones
  const grid = document.getElementById('opciones-grid');
  grid.innerHTML = '';
  const letras = ['A', 'B', 'C', 'D'];
  p.opciones.forEach((op, i) => {
    const btn = document.createElement('button');
    btn.className = 'opcion-btn';
    btn.innerHTML = `<strong>${letras[i]}.</strong> ${op}`;
    btn.addEventListener('click', () => responder(i));
    grid.appendChild(btn);
  });

  // Barra del reactor
  const progreso = (estado.preguntaActual / 29) * 100;
  document.getElementById('reactor-bar').style.width = progreso + '%';

  // Audio: timbre según materia y BPM según progreso
  setMateria(p.materia);
  setProgreso(estado.preguntaActual + 1);

  // Racha
  actualizarRacha();

  // Reiniciar reloj
  reiniciarReloj();
}

// ─── RESPONDER ─────────────────────────────────────────────────────────────
function responder(indiceElegido) {
  detenerReloj();
  const p = estado.preguntas[estado.preguntaActual];
  const correcta = indiceElegido === p.correcta;

  // Deshabilitar todas las opciones
  document.querySelectorAll('.opcion-btn').forEach((btn, i) => {
    btn.disabled = true;
    if (i === p.correcta)    btn.classList.add('correcta');
    if (i === indiceElegido && !correcta) btn.classList.add('incorrecta');
  });

  // Calcular puntaje
  let pts = 0;
  if (correcta) {
    pts = 100;
    const bonusVelocidad = Math.round((estado.tiempoRestante / 30) * 50);
    pts += bonusVelocidad;
    pts = Math.round(pts * estado.multiplicador);

    tocarAcierto();
    estado.racha++;
    if      (estado.racha >= 8) estado.multiplicador = 3;
    else if (estado.racha >= 5) estado.multiplicador = 2;
    else if (estado.racha >= 3) estado.multiplicador = 1.5;
    else                        estado.multiplicador = 1;

    // Sonido de racha al alcanzar hitos
    if (estado.racha === 3) tocarRacha(1);
    if (estado.racha === 5) tocarRacha(2);
    if (estado.racha === 8) tocarRacha(3);

    // Audio: actualizar capa de energía
    setRacha(estado.racha);

    // Contar aciertos por bloque
    if (p.materia === 'razonamiento') estado.aciertos.razonamiento++;
    else estado.aciertos.ciencias++; // química + física + biología
  } else {
    tocarError();
    estado.racha = 0;
    estado.multiplicador = 1;
    setRacha(0);
  }

  estado.puntaje += pts;
  estado.respuestas.push({ correcta, puntaje: pts });

  // Ir a retroalimentación después de 600ms (para ver el color)
  setTimeout(() => mostrarRetro(correcta, pts, p.explicacion), 600);
}

// ─── RETROALIMENTACIÓN ─────────────────────────────────────────────────────
function mostrarRetro(correcta, pts, explicacion) {
  irA('pantalla-retro');

  document.getElementById('retro-icono').textContent  = correcta ? '✔' : '✖';
  const titulo = document.getElementById('retro-titulo');
  titulo.textContent = correcta ? '¡Correcto!' : 'Incorrecto';
  titulo.className = 'retro-titulo ' + (correcta ? 'correcto' : 'incorrecto');
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
  estado.tiempoRestante = 30;
  actualizarDisplayReloj();
  intervaloReloj = setInterval(() => {
    estado.tiempoRestante--;
    estado.tiempoTotal++;
    setTiempoRestante(estado.tiempoRestante);
    actualizarDisplayReloj();
    if (estado.tiempoRestante <= 0) {
      detenerReloj();
      responder(-1); // -1 = tiempo agotado (ninguna opción)
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
  estado.poderes.catalizador = false;
  document.getElementById('poder-catalizador').disabled = true;
  tocarPoder('catalizador');

  const p = estado.preguntas[estado.preguntaActual];
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
  irA('pantalla-resultados');
}

function calcularNota() {
  const pctC = estado.aciertos.ciencias / 19;
  const pctR = estado.aciertos.razonamiento / 10;
  const nota = (pctC * 0.8 + pctR * 0.2) * 5;
  estado.notaFinal = Math.round(nota * 10) / 10;
  return estado.notaFinal;
}

function mostrarResultados(nota) {
  const e = estado.estudiante;
  document.getElementById('res-estudiante').textContent =
    `${e.nombre} · ${e.avatar} · Grado ${e.grado}° · Curso ${e.curso}`;

  document.getElementById('res-puntaje').textContent = estado.puntaje.toLocaleString('es-CO');
  document.getElementById('res-nota').textContent = nota.toFixed(1);

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
    nombre:  estado.estudiante.nombre,
    avatar:  estado.estudiante.avatar,
    grado:   estado.estudiante.grado,
    curso:   estado.estudiante.curso,
    puntaje: estado.puntaje,
    nota:    nota.toFixed(1),
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
