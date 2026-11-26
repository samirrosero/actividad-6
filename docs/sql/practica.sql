-- =====================================================================
-- Práctica de SQL: onboarding de bases de datos (Fundamentos Web 611)
-- Ejecuta este archivo con:   npm run sql
-- Guía: docs/GUIA_BASE_DE_DATOS.md (Parte A)
-- Regla del playground: termina cada sentencia con ; al final de la línea.
-- =====================================================================


-- ---------------------------------------------------------------------
-- PARTE 1 · TAREAS (ejemplo resuelto: léelo, ejecútalo y modifícalo)
-- ---------------------------------------------------------------------

-- 1. Crear la tabla
CREATE TABLE tareas (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo     TEXT    NOT NULL,
  completada INTEGER NOT NULL DEFAULT 0
);

-- 2. Insertar filas (no enviamos el id: lo genera la base de datos)
INSERT INTO tareas (titulo) VALUES ('Aprender Express');
INSERT INTO tareas (titulo) VALUES ('Crear una API REST');
INSERT INTO tareas (titulo, completada) VALUES ('Probar la API', 1);

-- 3. Leer todas las filas
SELECT * FROM tareas;

-- 4. Leer con filtro: solo las pendientes
SELECT id, titulo FROM tareas WHERE completada = 0;

-- 5. Actualizar UNA fila (¡siempre con WHERE!)
UPDATE tareas SET completada = 1 WHERE id = 1;

-- 6. Eliminar UNA fila (¡siempre con WHERE!)
DELETE FROM tareas WHERE id = 2;

-- 7. Ver cómo quedó
SELECT * FROM tareas;

-- 8. Esta falla a propósito: titulo es NOT NULL. Lee el mensaje de error.
INSERT INTO tareas (completada) VALUES (0);


-- ---------------------------------------------------------------------
-- PARTE 2 · CONTACTOS (te toca a ti: escribe el SQL debajo de cada TODO)
-- ---------------------------------------------------------------------

-- TODO 1. Crea la tabla contactos con las columnas:
--         id (clave primaria autoincremental), nombre (obligatorio),
--         apellido, telefono (obligatorio), email, ciudad.
CREATE TABLE contactos (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre   TEXT NOT NULL,
  apellido TEXT,
  telefono TEXT NOT NULL,
  email    TEXT,
  ciudad   TEXT
);
-- telefono es TEXT y no INTEGER: un número como 0321... perdería el 0 inicial,
-- y nunca se hacen cuentas con un teléfono.

-- TODO 2. Inserta 5 contactos inventados, al menos 2 de la ciudad 'Cali'.
INSERT INTO contactos (nombre, apellido, telefono, email, ciudad) VALUES ('Ana', 'Gómez', '3001234567', 'ana@correo.com', 'Cali');
INSERT INTO contactos (nombre, apellido, telefono, email, ciudad) VALUES ('Carlos', 'Ruiz', '3109876543', NULL, 'Palmira');
INSERT INTO contactos (nombre, apellido, telefono, email, ciudad) VALUES ('Laura', 'Mejía', '6024455667', 'laura@correo.com', 'Cali');
INSERT INTO contactos (nombre, apellido, telefono, email, ciudad) VALUES ('Diego', 'Arango', '3157778899', 'diego@correo.com', 'Jamundí');
INSERT INTO contactos (nombre, apellido, telefono, email, ciudad) VALUES ('Sofía', 'Castro', '3201112233', NULL, 'Bogotá');

-- TODO 3. Lista todos los contactos.
SELECT * FROM contactos;

-- TODO 4. Lista solo nombre y telefono de los contactos de 'Cali'.
SELECT nombre, telefono FROM contactos WHERE ciudad = 'Cali';

-- TODO 5. Lista todos los contactos ordenados por apellido (ORDER BY).
SELECT * FROM contactos ORDER BY apellido;

-- TODO 6. Cambia el teléfono del contacto con id 3.
UPDATE contactos SET telefono = '3009990000' WHERE id = 3;

-- TODO 7. Elimina el contacto con id 5.
DELETE FROM contactos WHERE id = 5;

-- TODO 8. Cuenta cuántos contactos quedan (pista: SELECT COUNT(*) ...).
SELECT COUNT(*) AS total FROM contactos;

-- TODO 9. Intenta insertar un contacto SIN telefono. ¿Qué error sale y por qué?
--         Escribe la explicación como comentario debajo de tu INSERT.
INSERT INTO contactos (nombre, ciudad) VALUES ('Sin Teléfono', 'Cali');
-- Error: "NOT NULL constraint failed: contactos.telefono".
-- Sale porque al crear la tabla la columna telefono se declaró NOT NULL
-- (obligatoria). Como el INSERT no envía telefono, SQLite intenta guardarlo
-- como NULL y rechaza la fila completa: la base de datos protege los datos
-- aunque la API no hubiera validado antes. Por eso en la API también
-- respondemos 400 si falta el teléfono, para que nunca llegue a este punto.
