// Conexión a SQLite: se abre UNA sola vez al arrancar el servidor y todos
// los modelos reutilizan la misma conexión.
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite'); // viene con Node 22.13 o superior

// Por defecto la BD vive en <raíz del proyecto>/data/app.db.
// La variable de entorno DB_ARCHIVO permite usar otro archivo (por ejemplo,
// para correr pruebas sin mezclar sus datos con los tuyos).
const archivo = process.env.DB_ARCHIVO ?? path.join(__dirname, '..', '..', 'data', 'app.db');
fs.mkdirSync(path.dirname(archivo), { recursive: true }); // crea la carpeta si no existe

const db = new DatabaseSync(archivo);

// ¿Ya existía la tabla? (sqlite_master es el "índice" interno de SQLite)
const existeTabla = (nombre) =>
  db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(nombre) !== undefined;

const existiaTareas = existeTabla('tareas');
const existiaContactos = existeTabla('contactos');

// Crear las tablas (si no existen) leyendo schema.sql
db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

// Datos iniciales: SOLO cuando la tabla se acaba de crear.
// (Si revisáramos "tabla vacía", al borrar todo por la API y reiniciar,
//  los ejemplos volverían a aparecer.)
if (!existiaTareas) {
  const insertar = db.prepare('INSERT INTO tareas (titulo, fecha, completada) VALUES (?, ?, ?)');
  insertar.run('Aprender Express', '2026-11-25', 1);
  insertar.run('Crear una API REST', '2026-11-26', 1);
  insertar.run('Conectar una base de datos', '2026-11-29', 0);
}

if (!existiaContactos) {
  // Contactos inventados (no son personas reales)
  const insertar = db.prepare(
    'INSERT INTO contactos (nombre, apellido, telefono, email, ciudad) VALUES (?, ?, ?, ?, ?)'
  );
  insertar.run('Ana', 'Gómez', '3001234567', 'ana@correo.com', 'Cali');
  insertar.run('Carlos', 'Ruiz', '3109876543', '', 'Palmira');
  insertar.run('Laura', 'Mejía', '6024455667', 'laura@correo.com', 'Cali');
}

module.exports = db;
