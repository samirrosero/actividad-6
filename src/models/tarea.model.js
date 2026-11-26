// Modelo de tareas: el ÚNICO lugar que lee y escribe los datos de tareas.
// Ahora usa SQLite. Tiene las MISMAS funciones, parámetros y retornos que la
// versión anterior (archivos JSON), por eso el controlador no cambió.
// Todas las consultas usan ? para evitar la inyección SQL.
const db = require('../db/connection');

// SQLite guarda completada como 0/1; la API responde true/false
function aTarea(fila) {
  if (!fila) return null;
  return { id: fila.id, titulo: fila.titulo, fecha: fila.fecha, completada: fila.completada === 1 };
}

async function obtenerTodas() {
  return db.prepare('SELECT * FROM tareas ORDER BY id').all().map(aTarea);
}

async function obtenerPorId(id) {
  return aTarea(db.prepare('SELECT * FROM tareas WHERE id = ?').get(id));
}

async function crear({ titulo, fecha = '' }) {
  const resultado = db.prepare('INSERT INTO tareas (titulo, fecha) VALUES (?, ?)').run(titulo, fecha);
  return obtenerPorId(Number(resultado.lastInsertRowid));
}

// Devuelve la tarea actualizada, o null si no existe
async function actualizar(id, { titulo, fecha, completada }) {
  const actual = await obtenerPorId(id);
  if (!actual) return null;

  // ?? conserva el valor actual si el campo no se envió
  db.prepare('UPDATE tareas SET titulo = ?, fecha = ?, completada = ? WHERE id = ?').run(
    titulo ?? actual.titulo,
    fecha ?? actual.fecha,
    (completada ?? actual.completada) ? 1 : 0, // booleano → 0/1
    id
  );
  return obtenerPorId(id);
}

// Devuelve true si la eliminó, false si no existía
async function eliminar(id) {
  const resultado = db.prepare('DELETE FROM tareas WHERE id = ?').run(id);
  return resultado.changes > 0;
}

module.exports = { obtenerTodas, obtenerPorId, crear, actualizar, eliminar };
