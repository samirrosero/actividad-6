// ============================================================
//  API REST - Lista de Tareas + Lista de Contactos
//  Node.js + Express (métodos GET, POST, PUT y DELETE)
// ============================================================
const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para entender JSON en el cuerpo de las peticiones
app.use(express.json());

// Servir el frontend (HTML, CSS y JS) desde la carpeta /public
app.use(express.static(path.join(__dirname, '..', 'public')));

// ------------------------------------------------------------
//  Persistencia en archivos JSON (carpeta /data)
//  Los datos se leen al iniciar y se guardan después de cada
//  POST, PUT o DELETE, así no se pierden al reiniciar el servidor.
// ------------------------------------------------------------
const CARPETA_DATOS = path.join(__dirname, '..', 'data');

function guardar(nombreArchivo, datos) {
  fs.mkdirSync(CARPETA_DATOS, { recursive: true });
  fs.writeFileSync(path.join(CARPETA_DATOS, nombreArchivo), JSON.stringify(datos, null, 2));
}

// Lee un archivo JSON; si no existe, lo crea con los datos iniciales
function cargar(nombreArchivo, datosIniciales) {
  const ruta = path.join(CARPETA_DATOS, nombreArchivo);
  if (!fs.existsSync(ruta)) {
    guardar(nombreArchivo, datosIniciales);
    return datosIniciales;
  }
  try {
    return JSON.parse(fs.readFileSync(ruta, 'utf8'));
  } catch (error) {
    // No se sobrescribe el archivo para no perder datos: hay que corregirlo a mano
    console.error(`El archivo data/${nombreArchivo} no tiene un JSON válido: ${error.message}`);
    process.exit(1);
  }
}

// El siguiente id es el mayor id guardado + 1
const calcularSiguienteId = (lista) => lista.reduce((max, item) => Math.max(max, item.id), 0) + 1;

let tareas = cargar('tareas.json', [
  { id: 1, titulo: 'Aprender Express', fecha: '2026-11-25', completada: false },
  { id: 2, titulo: 'Crear una API REST', fecha: '2026-11-25', completada: true },
  { id: 3, titulo: 'Subir el taller a GitHub', fecha: '', completada: false }
]);
let siguienteIdTarea = calcularSiguienteId(tareas);
const guardarTareas = () => guardar('tareas.json', tareas);

// Contactos de ejemplo inventados (no son personas reales)
let contactos = cargar('contactos.json', [
  { id: 1, nombre: 'Ana', apellido: 'Gómez', telefono: '3001234567', email: 'ana@correo.com', ciudad: 'Cali' },
  { id: 2, nombre: 'Carlos', apellido: 'Ruiz', telefono: '3109876543', email: '', ciudad: 'Palmira' },
  { id: 3, nombre: 'Laura', apellido: 'Mejía', telefono: '6024455667', email: 'laura@correo.com', ciudad: 'Cali' }
]);
let siguienteIdContacto = calcularSiguienteId(contactos);
const guardarContactos = () => guardar('contactos.json', contactos);

// Utilidad: convierte el :id de la URL a número
const leerId = (req) => Number(req.params.id);

// Utilidad: valida que un texto exista y no esté vacío
const textoValido = (valor) => typeof valor === 'string' && valor.trim() !== '';

// Utilidad: la fecha es opcional; si viene debe ser "AAAA-MM-DD" o vacía
const fechaValida = (valor) => typeof valor === 'string' && /^(\d{4}-\d{2}-\d{2})?$/.test(valor);

// ============================================================
//  RUTAS: TAREAS  (/tareas)
// ============================================================

// GET - Obtener todas las tareas
app.get('/tareas', (req, res) => {
  res.json(tareas);
});

// GET - Obtener una tarea por id
app.get('/tareas/:id', (req, res) => {
  const tarea = tareas.find((t) => t.id === leerId(req));
  if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.json(tarea);
});

// POST - Crear una tarea
app.post('/tareas', (req, res) => {
  // Express 5 deja req.body en undefined si no llega JSON: ?? {} evita el error 500
  const { titulo, fecha = '' } = req.body ?? {};
  if (!textoValido(titulo)) {
    return res.status(400).json({ error: 'El título es obligatorio y debe ser texto' });
  }
  if (!fechaValida(fecha)) {
    return res.status(400).json({ error: 'La fecha debe tener el formato AAAA-MM-DD' });
  }
  const nueva = { id: siguienteIdTarea++, titulo: titulo.trim(), fecha, completada: false };
  tareas.push(nueva);
  guardarTareas();
  res.status(201).json(nueva);
});

// PUT - Actualizar una tarea (título, fecha y/o completada)
app.put('/tareas/:id', (req, res) => {
  const tarea = tareas.find((t) => t.id === leerId(req));
  if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });

  const { titulo, fecha, completada } = req.body ?? {};
  if (titulo !== undefined && !textoValido(titulo)) {
    return res.status(400).json({ error: 'El título debe ser un texto no vacío' });
  }
  if (completada !== undefined && typeof completada !== 'boolean') {
    return res.status(400).json({ error: 'completada debe ser true o false' });
  }
  if (fecha !== undefined && !fechaValida(fecha)) {
    return res.status(400).json({ error: 'La fecha debe tener el formato AAAA-MM-DD' });
  }

  // ?? conserva el valor actual si el campo no se envió (no usar ||: false se perdería)
  tarea.titulo = titulo?.trim() ?? tarea.titulo;
  tarea.fecha = fecha ?? tarea.fecha;
  tarea.completada = completada ?? tarea.completada;

  guardarTareas();
  res.json(tarea);
});

// DELETE - Eliminar una tarea
app.delete('/tareas/:id', (req, res) => {
  const indice = tareas.findIndex((t) => t.id === leerId(req));
  if (indice === -1) return res.status(404).json({ error: 'Tarea no encontrada' });
  tareas.splice(indice, 1);
  guardarTareas();
  res.status(204).send();
});

// ============================================================
//  RUTAS: CONTACTOS  (/contactos)
// ============================================================

// Revisa los campos de un contacto. Devuelve el mensaje de error o null.
// esNuevo = true (POST): nombre y telefono son obligatorios.
// esNuevo = false (PUT): solo se validan los campos que se envían.
function validarContacto(datos, esNuevo) {
  const { nombre, apellido, telefono, email, ciudad } = datos;

  if (esNuevo && nombre === undefined) return 'Falta el campo obligatorio: nombre';
  if (esNuevo && telefono === undefined) return 'Falta el campo obligatorio: telefono';

  if (nombre !== undefined && !textoValido(nombre)) return 'nombre debe ser un texto no vacío';
  if (telefono !== undefined && (typeof telefono !== 'string' || !/^\d{7,10}$/.test(telefono))) {
    return 'telefono debe tener solo dígitos, entre 7 y 10';
  }
  if (email !== undefined && (typeof email !== 'string' || (email !== '' && !email.includes('@')))) {
    return 'email debe contener @';
  }
  if (apellido !== undefined && typeof apellido !== 'string') return 'apellido debe ser texto';
  if (ciudad !== undefined && typeof ciudad !== 'string') return 'ciudad debe ser texto';
  return null;
}

// GET - Obtener todos los contactos
app.get('/contactos', (req, res) => {
  res.json(contactos);
});

// GET - Obtener un contacto por id
app.get('/contactos/:id', (req, res) => {
  const contacto = contactos.find((c) => c.id === leerId(req));
  if (!contacto) return res.status(404).json({ error: 'Contacto no encontrado' });
  res.json(contacto);
});

// POST - Crear un contacto (si el body trae un id, se ignora: lo genera el servidor)
app.post('/contactos', (req, res) => {
  const datos = req.body ?? {};
  const error = validarContacto(datos, true);
  if (error) return res.status(400).json({ error });

  const nuevo = {
    id: siguienteIdContacto++,
    nombre: datos.nombre.trim(),
    apellido: datos.apellido?.trim() ?? '',
    telefono: datos.telefono,
    email: datos.email?.trim() ?? '',
    ciudad: datos.ciudad?.trim() ?? ''
  };
  contactos.push(nuevo);
  guardarContactos();
  res.status(201).json(nuevo);
});

// PUT - Actualizar un contacto (solo cambia los campos que se envían)
app.put('/contactos/:id', (req, res) => {
  const contacto = contactos.find((c) => c.id === leerId(req));
  if (!contacto) return res.status(404).json({ error: 'Contacto no encontrado' });

  const datos = req.body ?? {};
  const error = validarContacto(datos, false);
  if (error) return res.status(400).json({ error });

  for (const campo of ['nombre', 'apellido', 'telefono', 'email', 'ciudad']) {
    if (datos[campo] !== undefined) contacto[campo] = datos[campo].trim();
  }
  guardarContactos();
  res.json(contacto);
});

// DELETE - Eliminar un contacto
app.delete('/contactos/:id', (req, res) => {
  const indice = contactos.findIndex((c) => c.id === leerId(req));
  if (indice === -1) return res.status(404).json({ error: 'Contacto no encontrado' });
  contactos.splice(indice, 1);
  guardarContactos();
  res.status(204).send();
});

// Cualquier ruta que no exista → 404 en JSON (va de última)
app.use((req, res) => {
  res.status(404).json({ error: `No existe la ruta ${req.method} ${req.originalUrl}` });
});

// Errores: JSON mal escrito en el body → 400; cualquier otro → 500 (siempre en JSON)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
