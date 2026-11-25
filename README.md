# Taller DOM + API REST con Node.js y Express

**Autor:** _[Tu nombre completo]_
**Asignatura:** Electiva – Desarrollo de Aplicaciones Web
**Institución:** Institución Universitaria Antonio José Camacho (UNIAJC)

---

## Descripción

Este repositorio integra dos aplicaciones web, una **Lista de Tareas (To-Do List)** y una **Lista de Contactos**, conectadas a una **API REST** hecha con **Node.js** y **Express**.

- El **frontend** (HTML, CSS y JavaScript sin frameworks) arma la interfaz manipulando el **DOM** y usa `fetch` para hablar con la API.
- El **backend** expone los métodos HTTP **GET, POST, PUT y DELETE** para cada recurso. También sirve los archivos del frontend, así que todo corre desde un solo servidor.

---

## Estructura del proyecto

```text
.
├── public/                  # Frontend (servido por Express con express.static)
│   ├── index.html           # Vista de la Lista de Tareas
│   ├── contactos.html       # Vista de la Lista de Contactos
│   ├── css/
│   │   └── styles.css       # Estilos compartidos
│   └── js/
│       ├── todo.js          # DOM + consumo de la API de tareas
│       └── contactos.js     # DOM + consumo de la API de contactos
├── src/
│   └── server.js            # Servidor Express con las rutas CRUD
├── .gitignore               # Excluye node_modules
├── package.json             # Dependencias y scripts
└── README.md
```

---

## Cómo ejecutarlo

Requisitos: [Node.js](https://nodejs.org/) 18 o superior.

```bash
# 1. Clonar el repositorio
git clone <url-de-este-repositorio>
cd <carpeta-del-repositorio>

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor
npm start        # modo normal
npm run dev      # modo desarrollo: nodemon reinicia el servidor al guardar cambios
```

Luego abre en el navegador:

- Lista de tareas: <http://localhost:3000>
- Lista de contactos: <http://localhost:3000/contactos.html>

> Los datos se guardan **en memoria**, así que se reinician cada vez que se reinicia el servidor.

---

## Endpoints de la API

### Tareas: `/api/tareas`

| Método | Ruta               | Descripción                    | Cuerpo (JSON)                                   | Respuesta |
|--------|--------------------|--------------------------------|-------------------------------------------------|-----------|
| GET    | `/api/tareas`      | Lista todas las tareas         | —                                               | `200`     |
| GET    | `/api/tareas/:id`  | Obtiene una tarea              | —                                               | `200` / `404` |
| POST   | `/api/tareas`      | Crea una tarea                 | `{ "titulo": "Estudiar", "fecha": "2026-11-25" }` | `201` / `400` |
| PUT    | `/api/tareas/:id`  | Actualiza título, fecha o estado | `{ "titulo"?, "fecha"?, "completada"? }`      | `200` / `400` / `404` |
| DELETE | `/api/tareas/:id`  | Elimina una tarea              | —                                               | `204` / `404` |

### Contactos: `/api/contactos`

| Método | Ruta                  | Descripción              | Cuerpo (JSON)                                                         | Respuesta |
|--------|-----------------------|--------------------------|-----------------------------------------------------------------------|-----------|
| GET    | `/api/contactos`      | Lista todos los contactos | —                                                                    | `200`     |
| GET    | `/api/contactos/:id`  | Obtiene un contacto      | —                                                                     | `200` / `404` |
| POST   | `/api/contactos`      | Crea un contacto         | `{ "nombre", "apellido", "telefono", "ciudad" }` (todos obligatorios) | `201` / `400` |
| PUT    | `/api/contactos/:id`  | Actualiza un contacto    | Cualquiera de los campos anteriores                                   | `200` / `400` / `404` |
| DELETE | `/api/contactos/:id`  | Elimina un contacto      | —                                                                     | `204` / `404` |

### Ejemplos con `curl`

```bash
# Crear una tarea
curl -X POST http://localhost:3000/api/tareas \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Repasar Express","fecha":"2026-11-30"}'

# Marcarla como completada
curl -X PUT http://localhost:3000/api/tareas/4 \
  -H "Content-Type: application/json" \
  -d '{"completada":true}'

# Eliminarla
curl -X DELETE http://localhost:3000/api/tareas/4
```

También se pueden probar con Postman, Thunder Client o la extensión REST Client de VS Code.

---

## Funcionalidades

**Lista de tareas**
- Agregar tareas con fecha opcional (POST).
- Marcar o desmarcar como completada con el checkbox (PUT).
- Editar el título y la fecha directamente en la lista (PUT). `Enter` guarda y `Esc` cancela.
- Eliminar tareas (DELETE).

**Lista de contactos**
- Registrar contactos con nombre, apellido, teléfono y ciudad (POST).
- Editar un contacto: sus datos se cargan en el mismo formulario (PUT).
- Eliminar contactos (DELETE).

**Ambas**
- Se cargan desde la API al abrir la página (GET).
- Validación de campos en el cliente y en el servidor, con mensajes de error en pantalla.
- Navegación entre las dos listas con una barra superior.

---

## Aprendizajes

1. **Cómo funciona una API REST.** Cada recurso (`tareas`, `contactos`) tiene una URL, y el método HTTP indica la acción: GET lee, POST crea, PUT actualiza y DELETE elimina.
2. **Express y middlewares.** `express.json()` convierte el cuerpo de la petición en un objeto (`req.body`), y `express.static()` sirve el HTML, CSS y JS sin escribir una ruta para cada archivo.
3. **Parámetros de ruta.** `req.params.id` llega como texto, así que hay que convertirlo a número (`Number(...)`) antes de compararlo con los ids guardados.
4. **Códigos de estado HTTP.** Responder con el código correcto (`201` creado, `204` sin contenido, `400` datos inválidos, `404` no encontrado) le permite al cliente saber qué pasó sin adivinar.
5. **Validar en los dos lados.** La validación del frontend mejora la experiencia, pero el servidor también debe validar, porque cualquiera puede llamar a la API directamente con `curl` o Postman.
6. **Manipulación del DOM.** Crear elementos con `document.createElement`, armarlos con `append` y volver a dibujar la lista (`render()`) cada vez que cambian los datos.
7. **Seguridad básica (XSS).** Usar `textContent` en lugar de `innerHTML` para mostrar lo que escribe el usuario evita que se inyecte HTML o scripts en la página.
8. **`fetch` y `async/await`.** Las peticiones son asíncronas, y `try/catch` permite mostrar un mensaje si la API falla o el servidor está apagado.
9. **Mismo origen y CORS.** Si Express sirve el frontend, la página y la API comparten origen (`localhost:3000`), así que no hace falta configurar CORS y las URLs pueden ser relativas (`/api/tareas`).
10. **Herramientas de desarrollo.** `nodemon` reinicia el servidor al guardar cambios, los scripts de `package.json` estandarizan cómo se ejecuta el proyecto y `.gitignore` evita subir `node_modules`.

---

## Uso de Inteligencia Artificial

Durante el taller se usó **Claude (Anthropic)** como asistente de programación, a través de la extensión Claude Code en VS Code. Se usó para:

- **Revisar el código base del taller** y encontrar errores. Por ejemplo: la ruta del CSS de la lista de tareas estaba mal (`css/styles.css` desde la carpeta `html/`), había un comentario inválido (`#...`) al inicio del CSS que anulaba la primera regla, faltaban los scripts `start`/`dev` en `package.json` y el DELETE respondía "eliminado" aunque el id no existiera.
- **Reorganizar el proyecto** siguiendo la estructura del repositorio de ejemplo de la clase (`src/server.js` y scripts con `nodemon`), y servir el frontend desde Express.
- **Agregar validaciones y códigos de estado HTTP** correctos en la API.
- **Mejorar el frontend:** quitar `alert`/`prompt`, hacer la edición en la misma página, mostrar mensajes de error y reemplazar `innerHTML` por `textContent` para evitar XSS.
- **Redactar esta documentación.**

**Reflexión:** la IA aceleró la revisión y ayudó a detectar errores que a simple vista no se notaban. Aun así, cada cambio se revisó y se probó (cada endpoint con `curl` y cada acción de las dos páginas) para entender qué hace el código y por qué, porque la IA puede equivocarse y la responsabilidad del resultado es de quien entrega el trabajo.
