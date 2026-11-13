const express = require('express');
const router = express.Router();
const {
  obtenerPublicaciones,
  crearPublicacion,
  actualizarPublicacion,
  eliminarPublicacion
} = require('../controllers/publicacion.controller');
const { validarCamposObligatorios } = require('../middlewares/validate.middleware');

router.get('/', obtenerPublicaciones);
router.post(
  '/',
  validarCamposObligatorios(['_id', 'usuario_id', 'contenido', 'categoria', 'tipo_publicacion']),
  crearPublicacion
);
router.patch('/:id', actualizarPublicacion);
router.delete('/:id', eliminarPublicacion);

module.exports = router;
