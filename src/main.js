// main.js — arranque y navegación entre pantallas
import { estado, resetearEstado } from './estado.js';

// --- Navegación: solo una pantalla visible a la vez ---
export function irA(id) {
  document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
  const pantalla = document.getElementById(id);
  if (pantalla) pantalla.classList.add('activa');

  // Mostrar widget de volumen solo durante el examen
  const widget = document.getElementById('volumen-widget');
  if (widget) {
    widget.classList.toggle('oculto', id !== 'pantalla-examen');
  }
}

// --- PORTADA ---
document.getElementById('btn-entrar').addEventListener('click', () => {
  irA('pantalla-registro');
});

// --- REGISTRO ---
const formRegistro = document.getElementById('form-registro');

// Selección de avatar
document.querySelectorAll('.avatar-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.avatar-btn').forEach(b => b.classList.remove('seleccionado'));
    btn.classList.add('seleccionado');
    document.getElementById('inp-avatar').value = btn.dataset.elemento;
  });
});

formRegistro.addEventListener('submit', (e) => {
  e.preventDefault();

  const nombre = document.getElementById('inp-nombre').value.trim();
  const grado  = parseInt(document.getElementById('inp-grado').value);
  const curso  = document.getElementById('inp-curso').value.trim();
  const avatar = document.getElementById('inp-avatar').value;

  if (!avatar) {
    alert('Por favor elige tu elemento avatar ⚗️');
    return;
  }

  // Guardar datos del estudiante en el estado global
  estado.estudiante = { nombre, grado, curso, avatar };

  // Ir al examen
  irA('pantalla-examen');

  // Actualizar contador inicial
  document.getElementById('num-pregunta').textContent = '1';
  document.getElementById('reloj').textContent = '30';
  document.getElementById('reactor-bar').style.width = '0%';
  document.getElementById('racha-display').textContent = '';
  document.getElementById('enunciado').textContent =
    '⚗️ Las preguntas se cargan en la Fase 2. ¡El motor está listo!';
  document.getElementById('opciones-grid').innerHTML =
    '<p style="color:var(--cian);grid-column:1/-1;text-align:center">Banco de preguntas en construcción...</p>';
  document.getElementById('tipo-pregunta').textContent = 'Química';
});

// --- RETROALIMENTACIÓN → siguiente pregunta ---
document.getElementById('btn-siguiente-pregunta').addEventListener('click', () => {
  irA('pantalla-examen');
});

// --- RESULTADOS ---
document.getElementById('btn-ver-podio').addEventListener('click', () => {
  irA('pantalla-podio');
  renderizarPodio();
});
document.getElementById('btn-nuevo-intento').addEventListener('click', () => {
  resetearEstado();
  irA('pantalla-registro');
});

// --- PODIO / RANKING ---
document.getElementById('btn-volver-portada').addEventListener('click', () => {
  irA('pantalla-portada');
});

// Filtros del ranking
document.querySelectorAll('.btn-filtro').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('activo'));
    btn.classList.add('activo');
    renderizarTablaRanking(btn.dataset.filtro);
  });
});

// --- ADMIN: acceso por Ctrl+Shift+A ---
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'A') {
    e.preventDefault();
    irA('pantalla-admin');
    document.getElementById('admin-panel').classList.add('oculto');
    document.getElementById('admin-login').style.display = 'flex';
    document.getElementById('admin-error').classList.add('oculto');
    document.getElementById('inp-admin-pass').value = '';
  }
});

document.getElementById('btn-admin-entrar').addEventListener('click', async () => {
  const pass = document.getElementById('inp-admin-pass').value;
  const correcto = await verificarAdmin(pass);
  if (correcto) {
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-panel').classList.remove('oculto');
  } else {
    document.getElementById('admin-error').classList.remove('oculto');
  }
});

document.getElementById('btn-admin-salir').addEventListener('click', () => {
  irA('pantalla-portada');
});

// Control de volumen
document.getElementById('ctrl-volumen').addEventListener('input', (e) => {
  estado.volumen = parseFloat(e.target.value);
  // En Fase 5 esto controlará el motor de audio
});

// --- Funciones de soporte ---

// Verifica contraseña admin comparando hash SHA-256
async function verificarAdmin(pass) {
  const hashGuardado = localStorage.getItem('adminHash');

  if (!hashGuardado) {
    // Primera vez: crear contraseña
    const nueva = prompt('Primera vez: crea tu contraseña de super admin');
    if (!nueva || nueva.length < 4) return false;
    const hash = await sha256(nueva);
    localStorage.setItem('adminHash', hash);
    return (await sha256(pass)) === hash;
  }

  return (await sha256(pass)) === hashGuardado;
}

async function sha256(texto) {
  const data = new TextEncoder().encode(texto);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2,'0')).join('');
}

// Renderiza el podio con los datos del ranking guardados
function renderizarPodio() {
  const datos = JSON.parse(localStorage.getItem('ranking') || '[]');
  const top3 = datos.slice(0, 3);
  const medallas = ['🥇', '🥈', '🥉'];
  const clases   = ['primer', 'segundo', 'tercero'];
  const contenedor = document.getElementById('podio-top3');

  // Orden visual: 2° izquierda, 1° centro, 3° derecha
  const orden = top3.length >= 3 ? [1, 0, 2] : top3.map((_, i) => i);
  contenedor.innerHTML = orden.map(i => {
    const p = top3[i];
    if (!p) return '';
    return `
      <div class="podio-lugar ${clases[i]}">
        <div class="podio-medalla">${medallas[i]}</div>
        <div class="podio-elemento">${p.avatar}</div>
        <div class="podio-nombre">${p.nombre}</div>
        <div class="podio-pts">${p.puntaje} pts</div>
        <div class="podio-nota">${p.nota}/5.0</div>
      </div>`;
  }).join('');

  renderizarTablaRanking('todos');
}

function renderizarTablaRanking(filtro) {
  const datos = JSON.parse(localStorage.getItem('ranking') || '[]');
  const filtrados = filtro === 'todos' ? datos : datos.filter(p => String(p.grado) === String(filtro));

  const topClases = ['top1', 'top2', 'top3'];
  const tbody = document.getElementById('ranking-tbody');
  tbody.innerHTML = filtrados.map((p, i) => `
    <tr class="${topClases[i] || ''}">
      <td>${i + 1}</td>
      <td>${p.nombre}</td>
      <td>${p.avatar}</td>
      <td>${p.grado}°</td>
      <td>${p.curso}</td>
      <td>${p.puntaje}</td>
      <td>${p.nota}</td>
    </tr>`).join('');

  if (!filtrados.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#8ab">Sin resultados aún</td></tr>';
  }
}
