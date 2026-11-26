// ===== Lista de contactos: manipulación del DOM + consumo de la API =====
const API_URL = '/contactos';
const CAMPOS = ['nombre', 'apellido', 'telefono', 'email', 'ciudad'];
let contactos = [];
let idEditando = null; // null = creando, número = editando ese contacto

const form = document.getElementById('contact-form');
const lista = document.getElementById('contact-list');
const mensaje = document.getElementById('mensaje');
const btnGuardar = document.getElementById('btn-guardar');
const btnCancelar = document.getElementById('btn-cancelar');
const inputs = Object.fromEntries(
  CAMPOS.map((campo) => [campo, document.getElementById(`contact-${campo}`)])
);

async function pedir(url, opciones = {}) {
  const respuesta = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones
  });
  if (!respuesta.ok) {
    const datos = await respuesta.json().catch(() => ({}));
    throw new Error(datos.error || `Error ${respuesta.status}`);
  }
  return respuesta.status === 204 ? null : respuesta.json();
}

function mostrarMensaje(texto) {
  mensaje.textContent = texto;
}

// GET: cargar contactos
async function cargarContactos() {
  try {
    contactos = await pedir(API_URL);
    mostrarMensaje('');
    render();
  } catch (error) {
    mostrarMensaje('No se pudo conectar con la API. ¿Está corriendo el servidor?');
  }
}

// Lee los valores del formulario
function leerFormulario() {
  const datos = {};
  CAMPOS.forEach((campo) => (datos[campo] = inputs[campo].value.trim()));
  return datos;
}

// Vuelve el formulario al modo "crear"
function salirDeEdicion() {
  idEditando = null;
  form.reset();
  btnGuardar.textContent = 'Guardar contacto';
  btnCancelar.hidden = true;
}

// Carga un contacto en el formulario para editarlo
function entrarEnEdicion(contacto) {
  idEditando = contacto.id;
  CAMPOS.forEach((campo) => (inputs[campo].value = contacto[campo] ?? ''));
  btnGuardar.textContent = 'Actualizar contacto';
  btnCancelar.hidden = false;
  inputs.nombre.focus();
}

btnCancelar.addEventListener('click', salirDeEdicion);

// POST (crear) o PUT (actualizar) según el modo
form.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const datos = leerFormulario();
  // Mismas reglas que valida la API (la API también las revisa)
  if (datos.nombre === '' || datos.telefono === '') {
    mostrarMensaje('El nombre y el teléfono son obligatorios.');
    return;
  }
  if (!/^\d{7,10}$/.test(datos.telefono)) {
    mostrarMensaje('El teléfono debe tener solo dígitos, entre 7 y 10.');
    return;
  }
  if (datos.email !== '' && !datos.email.includes('@')) {
    mostrarMensaje('El correo debe contener @.');
    return;
  }
  try {
    if (idEditando === null) {
      await pedir(API_URL, { method: 'POST', body: JSON.stringify(datos) });
    } else {
      await pedir(`${API_URL}/${idEditando}`, { method: 'PUT', body: JSON.stringify(datos) });
    }
    salirDeEdicion();
    cargarContactos();
  } catch (error) {
    mostrarMensaje(error.message);
  }
});

// DELETE: eliminar contacto (pide confirmación con el modal)
async function eliminarContacto(contacto) {
  const confirmado = await confirmar(
    `¿Eliminar a ${contacto.nombre} ${contacto.apellido} de tus contactos?`
  );
  if (!confirmado) return;
  try {
    await pedir(`${API_URL}/${contacto.id}`, { method: 'DELETE' });
    if (idEditando === contacto.id) salirDeEdicion();
    cargarContactos();
  } catch (error) {
    mostrarMensaje(error.message);
  }
}

function crearBoton(texto, clase, accion) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.textContent = texto;
  boton.className = clase;
  boton.addEventListener('click', accion);
  return boton;
}

// Dibuja las tarjetas de contacto en el DOM
function render() {
  lista.innerHTML = '';

  if (contactos.length === 0) {
    const vacio = document.createElement('p');
    vacio.className = 'vacio';
    vacio.textContent = 'No hay contactos guardados.';
    lista.appendChild(vacio);
    return;
  }

  contactos.forEach((contacto) => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'contact-card';

    const info = document.createElement('div');
    info.className = 'contact-info';
    const nombre = document.createElement('strong');
    nombre.textContent = `${contacto.nombre} ${contacto.apellido}`;
    const detalle = document.createElement('span');
    // Solo se muestran los datos opcionales que existan
    detalle.textContent = [
      `📞 ${contacto.telefono}`,
      contacto.email && `✉️ ${contacto.email}`,
      contacto.ciudad && `📍 ${contacto.ciudad}`
    ].filter(Boolean).join(' | ');
    info.append(nombre, detalle);

    const acciones = document.createElement('div');
    acciones.className = 'actions';
    acciones.append(
      crearBoton('Editar', 'btn-edit', () => entrarEnEdicion(contacto)),
      crearBoton('Eliminar', 'btn-delete', () => eliminarContacto(contacto))
    );

    tarjeta.append(info, acciones);
    lista.appendChild(tarjeta);
  });
}

cargarContactos();
