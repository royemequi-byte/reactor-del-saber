// storage.js — subida de imágenes a Cloudinary (upload directo desde el navegador)
const CLOUD_NAME    = 'fvhbzcoh';
const UPLOAD_PRESET = 'reactor_unsigned';

export async function subirImagenPregunta(file) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', UPLOAD_PRESET);
  fd.append('folder', 'reactor-del-saber/preguntas');

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: fd }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.secure_url;
}
