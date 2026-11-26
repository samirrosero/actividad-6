// Controlador de tareas: lee req, valida, llama al modelo y elige el código de estado.
// No sabe dónde se guardan los datos: eso es trabajo del modelo.
const Tarea = require('../models/tarea.model');

const esTextoNoVacio = (valor) => typeof valor === 'string' && valor.trim() !== '';
// La fecha es opcional; si viene debe ser "AAAA-MM-DD" o vacía
const esFechaValida = (valor) => typeof valor === 'string' && /^(\d{4}-\d{2}-\d{2})?$/.test(valor);

async function listar(req, res) {
  const tareas = await Tarea.obtenerTodas();
  res.json(tareas);
}

async function obtener(req, res) {
  // req.params.id llega como texto: Number('1abc') da NaN y no coincide con nada
  const tarea = await Tarea.obtenerPorId(Number(req.params.id));
  if (!tarea) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }
  res.json(tarea);
}

async function crear(req, res) {
  // Express 5 deja req.body en undefined si no llega JSON: ?? {} evita un 500
  const { titulo, fecha = '' } = req.body ?? {};
  if (!esTextoNoVacio(titulo)) {
    return res.status(400).json({ error: 'El título es obligatorio y debe ser texto' });
  }
  if (!esFechaValida(fecha)) {
    return res.status(400).json({ error: 'La fecha debe tener el formato AAAA-MM-DD' });
  }
  const nueva = await Tarea.crear({ titulo: titulo.trim(), fecha });
  res.status(201).json(nueva);
}

async function actualizar(req, res) {
  const { titulo, fecha, completada } = req.body ?? {};
  if (titulo !== undefined && !esTextoNoVacio(titulo)) {
    return res.status(400).json({ error: 'El título debe ser un texto no vacío' });
  }
  if (completada !== undefined && typeof completada !== 'boolean') {
    return res.status(400).json({ error: 'completada debe ser true o false' });
  }
  if (fecha !== undefined && !esFechaValida(fecha)) {
    return res.status(400).json({ error: 'La fecha debe tener el formato AAAA-MM-DD' });
  }

  const tarea = await Tarea.actualizar(Number(req.params.id), {
    titulo: titulo?.trim(),
    fecha,
    completada
  });
  if (!tarea) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }
  res.json(tarea);
}

async function eliminar(req, res) {
  const eliminada = await Tarea.eliminar(Number(req.params.id));
  if (!eliminada) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }
  res.status(204).send(); // 204: éxito sin cuerpo
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
