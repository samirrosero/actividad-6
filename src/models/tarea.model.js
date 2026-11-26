// Modelo de tareas: el ÚNICO lugar que lee y escribe los datos de tareas.
// No conoce req ni res. Las funciones son async para que, al cambiar el
// almacenamiento (por ejemplo a una base de datos), el controlador no cambie.
const { cargar, guardar, siguienteId } = require('./archivo-json');

const ARCHIVO = 'tareas.json';

let tareas = cargar(ARCHIVO, [
  { id: 1, titulo: 'Aprender Express', fecha: '2026-11-25', completada: false },
  { id: 2, titulo: 'Crear una API REST', fecha: '2026-11-25', completada: true },
  { id: 3, titulo: 'Conectar una base de datos', fecha: '', completada: false }
]);
let proximoId = siguienteId(tareas);

async function obtenerTodas() {
  return tareas;
}

async function obtenerPorId(id) {
  return tareas.find((t) => t.id === id) ?? null;
}

async function crear({ titulo, fecha = '' }) {
  const nueva = { id: proximoId++, titulo, fecha, completada: false };
  tareas.push(nueva);
  guardar(ARCHIVO, tareas);
  return nueva;
}

// Devuelve la tarea actualizada, o null si no existe
async function actualizar(id, { titulo, fecha, completada }) {
  const tarea = tareas.find((t) => t.id === id);
  if (!tarea) return null;

  // ?? conserva el valor actual si el campo no se envió
  tarea.titulo = titulo ?? tarea.titulo;
  tarea.fecha = fecha ?? tarea.fecha;
  tarea.completada = completada ?? tarea.completada;

  guardar(ARCHIVO, tareas);
  return tarea;
}

// Devuelve true si la eliminó, false si no existía
async function eliminar(id) {
  const indice = tareas.findIndex((t) => t.id === id);
  if (indice === -1) return false;
  tareas.splice(indice, 1);
  guardar(ARCHIVO, tareas);
  return true;
}

module.exports = { obtenerTodas, obtenerPorId, crear, actualizar, eliminar };
