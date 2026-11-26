# API REST de Tareas y Contactos con Node.js, Express y SQLite

**Autor:** Samir Rosero
**Asignatura:** Fundamentos Web – Grupo 611
**Institución:** Institución Universitaria Antonio José Camacho (UNIAJC)

---

## Descripción

API REST hecha con **Node.js** y **Express** que maneja dos recursos: **tareas** (`/tareas`) y **contactos** (`/contactos`), cada uno con los métodos **GET, POST, PUT y DELETE**.

- El código está organizado en **rutas, controladores y modelos**.
- Los datos se guardan en una base de datos **SQLite** (`data/app.db`), así que **no se pierden al reiniciar el servidor**.
- El mismo servidor muestra un **frontend** (HTML, CSS y JavaScript con manipulación del DOM) que consume la API: una lista de tareas y una lista de contactos.

---

## Cómo ejecutarlo

**Requisito:** Node.js **22.13 o superior** (trae SQLite incorporado). Revisa con `node -v`.

```bash
npm install      # instala las dependencias
npm start        # inicia la API en http://localhost:3000
npm run dev      # igual, pero nodemon reinicia el servidor al guardar cambios
npm test         # corre las pruebas automáticas (detén antes npm start / npm run dev)
npm run sql      # ejecuta la práctica de SQL (docs/sql/practica.sql)
```

Con el servidor corriendo:

| Qué | URL |
| --- | --- |
| Lista de tareas (frontend) | <http://localhost:3000> |
| Lista de contactos (frontend) | <http://localhost:3000/contactos.html> |
| API de tareas | <http://localhost:3000/tareas> |
| API de contactos | <http://localhost:3000/contactos> |

- La base de datos se crea sola en `data/app.db` la primera vez, con 3 tareas y 3 contactos de ejemplo. **No se sube a GitHub** (está en `.gitignore`).
- Para empezar con la base de datos limpia: detén el servidor y borra la carpeta `data/`.
- `npm test` crea datos de prueba en la base de datos. Para no mezclarlos con los tuyos, puedes usar otro archivo con la variable `DB_ARCHIVO` (por ejemplo, en Git Bash: `DB_ARCHIVO=data/pruebas.db npm test`).

---

## Endpoints

Todas las respuestas son JSON. Los errores siempre tienen la forma `{ "error": "mensaje" }`.

### Tareas: `/tareas`

Recurso: `{ "id": 1, "titulo": "Aprender Express", "fecha": "2026-11-25", "completada": false }`

| Método | Ruta | Qué hace | Respuesta OK | Errores |
| --- | --- | --- | --- | --- |
| `GET` | `/tareas` | Lista todas las tareas | `200` + arreglo | — |
| `GET` | `/tareas/:id` | Obtiene una tarea por id | `200` + objeto | `404` |
| `POST` | `/tareas` | Crea una tarea | `201` + tarea creada | `400` si falta `titulo` o no es texto, o la `fecha` no es `AAAA-MM-DD` |
| `PUT` | `/tareas/:id` | Actualiza `titulo`, `fecha` y/o `completada` (solo lo que se envía) | `200` + tarea actualizada | `400` si `completada` no es booleano o `titulo` está vacío · `404` |
| `DELETE` | `/tareas/:id` | Elimina una tarea | `204` sin cuerpo | `404` |

### Contactos: `/contactos`

Recurso: `{ "id": 1, "nombre": "Ana", "apellido": "Gómez", "telefono": "3001234567", "email": "ana@correo.com", "ciudad": "Cali" }`

| Método | Ruta | Qué hace | Respuesta OK | Errores |
| --- | --- | --- | --- | --- |
| `GET` | `/contactos` | Lista todos los contactos | `200` + arreglo | — |
| `GET` | `/contactos/:id` | Obtiene un contacto por id | `200` + objeto | `404` |
| `POST` | `/contactos` | Crea un contacto | `201` + contacto creado | `400` (dice qué campo falla) |
| `PUT` | `/contactos/:id` | Actualiza los campos que se envían | `200` + contacto actualizado | `400` · `404` |
| `DELETE` | `/contactos/:id` | Elimina un contacto | `204` sin cuerpo | `404` |

**Validaciones de contactos:** `nombre` y `telefono` son obligatorios; `telefono` debe tener solo dígitos, entre 7 y 10; `email` es opcional, pero si viene debe contener `@`; `apellido` y `ciudad` son opcionales. El `id` lo genera la base de datos: si el cliente lo envía, se ignora.

### Otros casos

| Caso | Respuesta |
| --- | --- |
| Ruta que no existe (`GET /no-existe`) | `404` `{ "error": "No existe la ruta GET /no-existe" }` |
| `POST`/`PUT` sin body | `400`, nunca `500` |
| JSON mal escrito en el body | `400` |
| Id que no es número (`/tareas/1abc`) | `404` |

### Probar la API

[`api.http`](api.http) tiene **36 peticiones** (casos de éxito y de error para cada endpoint). Se ejecutan con la extensión **REST Client** de VS Code: inicia el servidor y pulsa *Send Request* encima de cada una.

---

## Estructura del proyecto

```text
.
├── api.http                     # Pruebas manuales de la API (REST Client)
├── data/app.db                  # Base de datos SQLite (se crea sola, no se sube)
├── docs/
│   ├── modelo-datos.md          # Diseño de las tablas
│   ├── respuestas.md            # Respuestas a las preguntas de la Parte 1
│   ├── sql/practica.sql         # Práctica de SQL (npm run sql)
│   └── ...                      # Guías del curso
├── public/                      # Frontend servido por Express
│   ├── index.html               # Lista de tareas
│   ├── contactos.html           # Lista de contactos
│   ├── css/styles.css
│   └── js/                      # todo.js, contactos.js, confirmar.js (modal)
├── src/
│   ├── server.js                # Crea la app, middlewares, monta las rutas
│   ├── routes/                  # Verbo + URL → función del controlador
│   ├── controllers/             # Leen req, validan, eligen el código de estado
│   ├── models/                  # Único lugar que lee y escribe los datos (SQL)
│   └── db/
│       ├── schema.sql           # CREATE TABLE de tareas y contactos
│       └── connection.js        # Abre la base de datos y crea las tablas
└── tests/                       # Pruebas automáticas del curso (npm test)
```

**Flujo de una petición:** `Ruta → Controlador → Modelo → SQLite`. Gracias a esta separación, para pasar de archivos JSON a SQLite **solo se reescribieron los modelos**; rutas y controladores no cambiaron.

---

## Aprendizajes

### Qué aprendí

1. **REST:** cada recurso tiene una URL en plural (`/tareas`) y el verbo HTTP dice la acción. El verbo nunca va en la URL (`/borrarTarea` está mal).
2. **Códigos de estado:** `201` al crear, `204` al eliminar (sin cuerpo), `400` cuando el cliente manda datos inválidos, `404` cuando no existe. Un `500` solo debería salir por un error de mi código, nunca por datos mal enviados.
3. **Rutas, controladores y modelos:** cada capa tiene un solo trabajo. Lo comprobé en la práctica: al conectar SQLite no toqué ni una línea de los controladores.
4. **SQL básico:** `CREATE TABLE`, `INSERT`, `SELECT` con `WHERE` y `ORDER BY`, `UPDATE`, `DELETE` y `COUNT(*)`. `UPDATE` y `DELETE` siempre llevan `WHERE`.
5. **Inyección SQL:** nunca pegar en el SQL texto que viene del usuario; siempre usar `?`. Probé `DELETE /tareas/1 OR 1=1` y no borró nada.
6. **Validar en el servidor y en la base de datos:** el controlador responde `400` con un mensaje claro, y `NOT NULL` en la tabla es una última protección.
7. **Manipulación del DOM:** crear elementos con `createElement`, usar `textContent` en lugar de `innerHTML` para evitar XSS y volver a dibujar la lista cuando cambian los datos.
8. **Pruebas:** `npm test` revisa la API automáticamente, y `api.http` documenta los casos que pruebo a mano.

### Qué se me dificultó y cómo lo resolví

| Dificultad | Cómo la resolví |
| --- | --- |
| Al traer las pruebas del curso, fallaban las 27 | Mi API usaba rutas `/api/tareas` y las pruebas esperan `/tareas`. Cambié las rutas (y las URLs del frontend) y fui completando parte por parte hasta que todas pasaron. |
| Los contactos no cumplían la guía | Tenían todos los campos obligatorios y no había `email`. Ajusté las validaciones: solo `nombre` y `telefono` obligatorios, teléfono de 7 a 10 dígitos y `email` con `@`. |
| Un teléfono válido salía como inválido | La expresión regular había quedado como `d{7,10}` en lugar de `\d{7,10}` (se perdió la barra invertida). Las pruebas automáticas lo detectaron y lo corregí. |
| SQLite no tiene booleanos | El modelo convierte `true`/`false` a `1`/`0` al guardar y al revés al leer, para que la API siga respondiendo booleanos. |
| `npm test` llenaba mi base de datos con datos de prueba | Agregué la variable `DB_ARCHIVO` para usar otro archivo de base de datos al probar. |
| nodemon reiniciaba el servidor cada vez que la API guardaba datos | Configuré `nodemonConfig.ignore` en `package.json` para que no vigile `data/` ni `public/`. |
| Los botones al editar una tarea se veían amontonados en el celular | Cambié la fila en modo edición a columna (campos arriba, botones abajo) y usé CSS Grid para los campos. |

---

## Uso de IA

**Herramienta:** **Claude** (Anthropic), usado desde la extensión **Claude Code** en VS Code.

### Para qué la usé

- **Revisar el código** y encontrar errores (rutas mal escritas, validaciones que faltaban, código que permitía XSS).
- **Explicar conceptos** de las preguntas de la Parte 1 (la diferencia entre `??` y `||`, por qué `204` no lleva cuerpo, `parseInt` contra `Number`) y de la guía de base de datos (inyección SQL).
- **Generar código** a partir de la guía del curso: la separación en rutas/controladores/modelos, la conexión a SQLite y los casos de `api.http`.
- **Mejorar el frontend:** modal de confirmación al eliminar, diseño responsive y paleta de colores propia.
- **Redactar la documentación** (este README, `docs/modelo-datos.md` y `docs/respuestas.md`), que después revisé.

### Ejemplos de lo que le pedí

- *"Que los botones de eliminar tengan un modal de confirmación."*
- *"Cuando le dé editar, que los botones queden debajo o darle más espacio porque está montado, no tiene un buen responsive."*
- *"Actualiza los colores y no pongas los mismos de mi compañero."*
- *"Agrega que los datos se guarden en JSON para que no se borren al reiniciar."* (Luego lo cambiamos por SQLite para el bonus.)
- Le pasé las instrucciones de esta entrega y la guía del docente para organizar la API en rutas, controladores y modelos, hacer el onboarding de base de datos y conectar SQLite.

### Qué corregí o verifiqué

- **Probé todo:** `npm test` (27 de 27 pruebas pasan), cada petición de `api.http` (36, todas con el código esperado), y la "prueba de fuego" de la guía: crear una tarea, reiniciar el servidor y comprobar que sigue ahí.
- **Errores en el código generado:** la IA escribió las expresiones regulares del teléfono y de la fecha sin la barra invertida (`d{7,10}` en vez de `\d{7,10}`). Las pruebas fallaron con un teléfono válido y se corrigió.
- **Diseño:** al abrir la página vi que al editar los botones quedaban amontonados y lo pedí corregir. La primera corrección dejaba espacio de más en pantallas grandes, así que se revisó con capturas en celular y en escritorio hasta que quedó bien.
- **Seguridad:** comprobé que el intento de inyección SQL de la guía no borra datos y que el texto que escribe el usuario no se interpreta como HTML.
- **Decisiones mías:** la paleta de colores, mantener la fecha opcional en las tareas, guardar los datos (primero en JSON y luego en SQLite) y qué incluir en este README.

> La IA puede equivocarse (como pasó con las expresiones regulares), así que revisé y probé cada cambio para poder explicar el código que entrego.
