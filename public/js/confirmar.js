// ===== Modal de confirmación reutilizable (tareas y contactos) =====
// Se crea una sola vez con el DOM usando el elemento nativo <dialog>.
const modalConfirmar = (() => {
  const dialog = document.createElement('dialog');
  dialog.className = 'modal';
  dialog.innerHTML = `
    <div class="modal-contenido">
      <h2>Confirmar eliminación</h2>
      <p class="modal-texto"></p>
      <div class="modal-acciones">
        <button type="button" class="btn-secondary" data-accion="cancelar">Cancelar</button>
        <button type="button" class="btn-delete" data-accion="eliminar">Eliminar</button>
      </div>
    </div>`;
  document.body.appendChild(dialog);
  return dialog;
})();

// Muestra el modal y devuelve una promesa: true si confirma, false si cancela.
// Uso: if (await confirmar('¿Seguro?')) { ... }
function confirmar(mensaje) {
  // textContent: el mensaje puede incluir texto del usuario, así no se inyecta HTML
  modalConfirmar.querySelector('.modal-texto').textContent = mensaje;
  const btnCancelar = modalConfirmar.querySelector('[data-accion="cancelar"]');
  const btnEliminar = modalConfirmar.querySelector('[data-accion="eliminar"]');

  modalConfirmar.showModal();
  btnCancelar.focus(); // el foco en "Cancelar" evita eliminar por accidente con Enter

  return new Promise((resolve) => {
    const cerrar = (respuesta) => {
      modalConfirmar.close();
      resolve(respuesta);
    };
    btnEliminar.onclick = () => cerrar(true);
    btnCancelar.onclick = () => cerrar(false);
    // Tecla Esc
    modalConfirmar.oncancel = (evento) => {
      evento.preventDefault();
      cerrar(false);
    };
    // Clic fuera de la caja (en el fondo oscuro)
    modalConfirmar.onclick = (evento) => {
      if (evento.target === modalConfirmar) cerrar(false);
    };
  });
}
