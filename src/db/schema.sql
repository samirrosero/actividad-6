-- Esquema de la base de datos (diseño en docs/modelo-datos.md).
-- IF NOT EXISTS: se ejecuta cada vez que arranca el servidor sin error
-- si las tablas ya existen.

CREATE TABLE IF NOT EXISTS tareas (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo     TEXT    NOT NULL,
  fecha      TEXT    NOT NULL DEFAULT '',
  completada INTEGER NOT NULL DEFAULT 0 CHECK (completada IN (0, 1))
);

CREATE TABLE IF NOT EXISTS contactos (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre   TEXT NOT NULL,
  apellido TEXT NOT NULL DEFAULT '',
  telefono TEXT NOT NULL,
  email    TEXT NOT NULL DEFAULT '',
  ciudad   TEXT NOT NULL DEFAULT ''
);
