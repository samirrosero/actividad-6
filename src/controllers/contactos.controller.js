// Controlador de contactos: lee req, valida, llama al modelo y elige el código de estado.
const Contacto = require('../models/contacto.model');

const CAMPOS = ['nombre', 'apellido', 'telefono', 'email', 'ciudad'];
const esTextoNoVacio = (valor) => typeof valor === 'string' && valor.trim() !== '';

// Revisa los campos de un contacto. Devuelve el mensaje de error o null.
// esNuevo = true (POST): nombre y telefono son obligatorios.
// esNuevo = false (PUT): solo se validan los campos que se envían.
function validar(datos, esNuevo) {
  const { nombre, apellido, telefono, email, ciudad } = datos;

  if (esNuevo && nombre === undefined) return 'Falta el campo obligatorio: nombre';
  if (esNuevo && telefono === undefined) return 'Falta el campo obligatorio: telefono';

  if (nombre !== undefined && !esTextoNoVacio(nombre)) return 'nombre debe ser un texto no vacío';
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

// Toma solo los campos conocidos (así un "id" o campos de más en el body se ignoran)
function limpiar(datos) {
  const limpio = {};
  for (const campo of CAMPOS) {
    if (datos[campo] !== undefined) limpio[campo] = datos[campo].trim();
  }
  return limpio;
}

async function listar(req, res) {
  const contactos = await Contacto.obtenerTodos();
  res.json(contactos);
}

async function obtener(req, res) {
  const contacto = await Contacto.obtenerPorId(Number(req.params.id));
  if (!contacto) {
    return res.status(404).json({ error: 'Contacto no encontrado' });
  }
  res.json(contacto);
}

async function crear(req, res) {
  const datos = req.body ?? {};
  const error = validar(datos, true);
  if (error) {
    return res.status(400).json({ error });
  }
  const nuevo = await Contacto.crear(limpiar(datos));
  res.status(201).json(nuevo);
}

async function actualizar(req, res) {
  const datos = req.body ?? {};
  const error = validar(datos, false);
  if (error) {
    return res.status(400).json({ error });
  }
  const contacto = await Contacto.actualizar(Number(req.params.id), limpiar(datos));
  if (!contacto) {
    return res.status(404).json({ error: 'Contacto no encontrado' });
  }
  res.json(contacto);
}

async function eliminar(req, res) {
  const eliminado = await Contacto.eliminar(Number(req.params.id));
  if (!eliminado) {
    return res.status(404).json({ error: 'Contacto no encontrado' });
  }
  res.status(204).send();
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
