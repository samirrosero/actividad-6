// Modelo de contactos: el ÚNICO lugar que lee y escribe los datos de contactos.
// Usa SQLite con las mismas funciones que la versión anterior.
const db = require('../db/connection');

async function obtenerTodos() {
  return db.prepare('SELECT * FROM contactos ORDER BY id').all();
}

async function obtenerPorId(id) {
  return db.prepare('SELECT * FROM contactos WHERE id = ?').get(id) ?? null;
}

async function crear({ nombre, apellido = '', telefono, email = '', ciudad = '' }) {
  const resultado = db
    .prepare('INSERT INTO contactos (nombre, apellido, telefono, email, ciudad) VALUES (?, ?, ?, ?, ?)')
    .run(nombre, apellido, telefono, email, ciudad);
  return obtenerPorId(Number(resultado.lastInsertRowid));
}

// Devuelve el contacto actualizado, o null si no existe
async function actualizar(id, cambios) {
  const actual = await obtenerPorId(id);
  if (!actual) return null;

  db.prepare(
    'UPDATE contactos SET nombre = ?, apellido = ?, telefono = ?, email = ?, ciudad = ? WHERE id = ?'
  ).run(
    cambios.nombre ?? actual.nombre,
    cambios.apellido ?? actual.apellido,
    cambios.telefono ?? actual.telefono,
    cambios.email ?? actual.email,
    cambios.ciudad ?? actual.ciudad,
    id
  );
  return obtenerPorId(id);
}

// Devuelve true si lo eliminó, false si no existía
async function eliminar(id) {
  const resultado = db.prepare('DELETE FROM contactos WHERE id = ?').run(id);
  return resultado.changes > 0;
}

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };
