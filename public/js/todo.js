// ===== Lista de tareas: manipulación del DOM + consumo de la API =====
const API_URL = '/tareas';
let tareas = [];

const form = document.getElementById('todo-form');
const inputTitulo = document.getElementById('todo-title');
const inputFecha = document.getElementById('date-picker');
const lista = document.getElementById('todo-list');
const mensaje = document.getElementById('mensaje');

// Función genérica para llamar a la API y manejar errores
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

// GET: cargar tareas
async function cargarTareas() {
  try {
    tareas = await pedir(API_URL);
    mostrarMensaje('');
    render();
  } catch (error) {
    mostrarMensaje('No se pudo conectar con la API. ¿Está corriendo el servidor?');
  }
}

// POST: crear tarea
form.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const titulo = inputTitulo.value.trim();
  if (titulo === '') {
    mostrarMensaje('Por favor escribe una tarea');
    return;
  }
  try {
    await pedir(API_URL, {
      method: 'POST',
      body: JSON.stringify({ titulo, fecha: inputFecha.value })
    });
    form.reset();
    inputTitulo.focus();
    cargarTareas();
  } catch (error) {
    mostrarMensaje(error.message);
  }
});

// PUT: actualizar tarea (completada, título o fecha)
async function actualizarTarea(id, cambios) {
  try {
    await pedir(`${API_URL}/${id}`, { method: 'PUT', body: JSON.stringify(cambios) });
    cargarTareas();
  } catch (error) {
    mostrarMensaje(error.message);
  }
}

// DELETE: eliminar tarea (pide confirmación con el modal)
async function eliminarTarea(tarea) {
  const confirmado = await confirmar(`¿Eliminar la tarea "${tarea.titulo}"?`);
  if (!confirmado) return;
  try {
    await pedir(`${API_URL}/${tarea.id}`, { method: 'DELETE' });
    cargarTareas();
  } catch (error) {
    mostrarMensaje(error.message);
  }
}

// Crea un botón con texto, clase y acción
function crearBoton(texto, clase, accion) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.textContent = texto;
  if (clase) boton.className = clase;
  boton.addEventListener('click', accion);
  return boton;
}

// Cambia una fila al modo edición (inputs en lugar de texto)
function modoEdicion(elemento, tarea) {
  elemento.innerHTML = '';
  elemento.classList.add('editando'); // el CSS pone los botones debajo de los campos

  const info = document.createElement('div');
  info.className = 'todo-info';
  const inputEditar = document.createElement('input');
  inputEditar.type = 'text';
  inputEditar.value = tarea.titulo;
  const fechaEditar = document.createElement('input');
  fechaEditar.type = 'date';
  fechaEditar.value = tarea.fecha || '';
  info.append(inputEditar, fechaEditar);

  const acciones = document.createElement('div');
  acciones.className = 'actions';
  const guardar = () => {
    const nuevoTitulo = inputEditar.value.trim();
    if (nuevoTitulo === '') return mostrarMensaje('El título no puede estar vacío');
    actualizarTarea(tarea.id, { titulo: nuevoTitulo, fecha: fechaEditar.value });
  };
  inputEditar.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') guardar();
    if (e.key === 'Escape') render();
  });
  acciones.append(
    crearBoton('Guardar', '', guardar),
    crearBoton('Cancelar', 'btn-secondary', render)
  );

  elemento.append(info, acciones);
  inputEditar.focus();
}

// Dibuja la lista de tareas en el DOM
function render() {
  lista.innerHTML = '';

  if (tareas.length === 0) {
    const vacio = document.createElement('p');
    vacio.className = 'vacio';
    vacio.textContent = 'No hay tareas. ¡Agrega la primera!';
    lista.appendChild(vacio);
    return;
  }

  tareas.forEach((tarea) => {
    const elemento = document.createElement('div');
    elemento.className = 'todo-item';

    const info = document.createElement('div');
    info.className = 'todo-info';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = tarea.completada;
    checkbox.addEventListener('change', () =>
      actualizarTarea(tarea.id, { completada: !tarea.completada })
    );

    const texto = document.createElement('span');
    texto.textContent = tarea.titulo; // textContent evita inyección de HTML
    if (tarea.completada) texto.className = 'completed';

    const fecha = document.createElement('span');
    fecha.className = 'todo-fecha';
    fecha.textContent = tarea.fecha || 'Sin fecha';

    info.append(checkbox, texto, fecha);

    const acciones = document.createElement('div');
    acciones.className = 'actions';
    acciones.append(
      crearBoton('Editar', 'btn-edit', () => modoEdicion(elemento, tarea)),
      crearBoton('Eliminar', 'btn-delete', () => eliminarTarea(tarea))
    );

    elemento.append(info, acciones);
    lista.appendChild(elemento);
  });
}

cargarTareas();
