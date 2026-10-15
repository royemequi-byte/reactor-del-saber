// index.js — coordina los 6 generadores y arma las 10 preguntas de razonamiento
// Regla: los 6 tipos deben aparecer al menos una vez; al menos 5 de los 7 contenidos.

import { generarSecuencia }     from './secuencias.js';
import { generarAbstracto }     from './abstracto.js';
import { generarEmparejamiento } from './emparejamiento.js';
import { generarRompecabezas }  from './rompecabezas.js';
import { generarCodigo }        from './codigos.js';
import { generarCrucigrama }    from './crucigrama.js';
import { barajar }              from '../azar.js';

const GENERADORES = {
  secuencias:     generarSecuencia,
  abstracto:      generarAbstracto,
  emparejamiento: generarEmparejamiento,
  rompecabezas:   generarRompecabezas,
  codigos:        generarCodigo,
  crucigrama:     generarCrucigrama,
};

const TIPOS = Object.keys(GENERADORES); // 6 tipos

export function generarPreguntas10() {
  // Garantizar 1 pregunta de cada tipo (6 preguntas obligatorias)
  const obligatorias = TIPOS.map(tipo => GENERADORES[tipo]());

  // Las 4 restantes se generan de tipos aleatorios (barajados)
  const tiposExtra = barajar([...TIPOS, ...TIPOS]).slice(0, 4);
  const extras = tiposExtra.map(tipo => GENERADORES[tipo]());

  // Mezclar todo y devolver 10
  return barajar([...obligatorias, ...extras]);
}
