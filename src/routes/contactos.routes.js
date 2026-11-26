// Rutas de contactos: solo dicen qué función del controlador atiende cada verbo + URL.
const { Router } = require('express');
const controller = require('../controllers/contactos.controller');

const router = Router();

// Rutas relativas: el prefijo /contactos se pone en server.js
router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', controller.crear);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

module.exports = router;
