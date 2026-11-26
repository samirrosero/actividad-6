// Modelo de contactos: el ÚNICO lugar que lee y escribe los datos de contactos.
const { cargar, guardar, siguienteId } = require('./archivo-json');

const ARCHIVO = 'contactos.json';

// Contactos de ejemplo inventados (no son personas reales)
let contactos = cargar(ARCHIVO, [
  { id: 1, nombre: 'Ana', apellido: 'Gómez', telefono: '3001234567', email: 'ana@correo.com', ciudad: 'Cali' },
  { id: 2, nombre: 'Carlos', apellido: 'Ruiz', telefono: '3109876543', email: '', ciudad: 'Palmira' },
  { id: 3, nombre: 'Laura', apellido: 'Mejía', telefono: '6024455667', email: 'laura@correo.com', ciudad: 'Cali' }
]);
let proximoId = siguienteId(contactos);

async function obtenerTodos() {
  return contactos;
}

async function obtenerPorId(id) {
  return contactos.find((c) => c.id === id) ?? null;
}

async function crear({ nombre, apellido = '', telefono, email = '', ciudad = '' }) {
  const nuevo = { id: proximoId++, nombre, apellido, telefono, email, ciudad };
  contactos.push(nuevo);
  guardar(ARCHIVO, contactos);
  return nuevo;
}

// Devuelve el contacto actualizado, o null si no existe
async function actualizar(id, cambios) {
  const contacto = contactos.find((c) => c.id === id);
  if (!contacto) return null;

  for (const campo of ['nombre', 'apellido', 'telefono', 'email', 'ciudad']) {
    contacto[campo] = cambios[campo] ?? contacto[campo];
  }
  guardar(ARCHIVO, contactos);
  return contacto;
}

// Devuelve true si lo eliminó, false si no existía
async function eliminar(id) {
  const indice = contactos.findIndex((c) => c.id === id);
  if (indice === -1) return false;
  contactos.splice(indice, 1);
  guardar(ARCHIVO, contactos);
  return true;
}

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };
