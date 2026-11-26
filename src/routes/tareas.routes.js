// Rutas de tareas: solo dicen qué función del controlador atiende cada verbo + URL.
const { Router } = require('express');
const controller = require('../controllers/tareas.controller');

const router = Router();

// Rutas relativas: el prefijo /tareas se pone en server.js
router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', controller.crear);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

module.exports = router;
