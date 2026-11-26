# Modelo de datos

Base de datos **SQLite** en el archivo `data/app.db`, con dos tablas independientes (no tienen relación entre sí). El esquema real que usa la API está en [`src/db/schema.sql`](../src/db/schema.sql).

## Tabla: tareas

| Columna    | Tipo    | Obligatoria | Notas                                                         |
| ---------- | ------- | ----------- | ------------------------------------------------------------- |
| id         | INTEGER | sí          | PRIMARY KEY, AUTOINCREMENT (lo genera la base de datos)       |
| titulo     | TEXT    | sí          | NOT NULL. La API exige texto no vacío.                        |
| fecha      | TEXT    | no          | Formato `AAAA-MM-DD`. Si no se envía se guarda `''` (DEFAULT) |
| completada | INTEGER | sí          | 0 = pendiente, 1 = completada. DEFAULT 0. CHECK (0 o 1)       |

> SQLite no tiene tipo booleano: la API recibe y responde `true`/`false`, y el modelo lo convierte a `1`/`0` al guardar y al revés al leer.

## Tabla: contactos

| Columna  | Tipo    | Obligatoria | Notas                                                          |
| -------- | ------- | ----------- | -------------------------------------------------------------- |
| id       | INTEGER | sí          | PRIMARY KEY, AUTOINCREMENT. Si el cliente envía un id, se ignora |
| nombre   | TEXT    | sí          | NOT NULL. La API exige texto no vacío.                         |
| apellido | TEXT    | no          | DEFAULT `''`                                                   |
| telefono | TEXT    | sí          | NOT NULL. Solo dígitos, entre 7 y 10 (lo valida la API)        |
| email    | TEXT    | no          | DEFAULT `''`. Si viene, debe contener `@`                      |
| ciudad   | TEXT    | no          | DEFAULT `''`                                                   |

## Decisiones de diseño

- **`telefono` es `TEXT` y no `INTEGER`:** un teléfono no se usa para hacer cuentas, y como número perdería los ceros a la izquierda (`0321...` → `321...`).
- **Campos opcionales con `DEFAULT ''` en vez de `NULL`:** así la API siempre responde texto en esos campos y el frontend no tiene que distinguir entre `null` y vacío.
- **Validación en dos niveles:** el controlador responde `400` con un mensaje claro si faltan datos, y además la base de datos tiene `NOT NULL` y `CHECK` como última protección (ver el TODO 9 de [`sql/practica.sql`](sql/practica.sql)).
- **Fecha como `TEXT` `AAAA-MM-DD`:** es el formato que usa el `<input type="date">` del navegador y se puede ordenar alfabéticamente igual que por fecha.

## Equivalencia con la API

| Operación de la API      | SQL                                                  |
| ------------------------ | ---------------------------------------------------- |
| `GET /tareas`            | `SELECT * FROM tareas ORDER BY id`                   |
| `GET /tareas/:id`        | `SELECT * FROM tareas WHERE id = ?`                  |
| `POST /tareas`           | `INSERT INTO tareas (titulo, fecha) VALUES (?, ?)`   |
| `PUT /tareas/:id`        | `UPDATE tareas SET titulo = ?, fecha = ?, completada = ? WHERE id = ?` |
| `DELETE /tareas/:id`     | `DELETE FROM tareas WHERE id = ?`                    |

Contactos usa las mismas sentencias sobre la tabla `contactos`. Todas llevan `?` (parámetros) en lugar de pegar valores en el texto, para evitar la inyección SQL.
