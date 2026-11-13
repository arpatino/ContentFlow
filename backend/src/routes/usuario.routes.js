const express = require('express');
const router = express.Router();
const {
  obtenerUsuarios,
  obtenerUsuariosMasActivos,
  crearUsuario
} = require('../controllers/usuario.controller');
const { validarCamposObligatorios } = require('../middlewares/validate.middleware');

router.get('/', obtenerUsuarios);
router.get('/top-activos', obtenerUsuariosMasActivos);
router.post(
  '/',
  validarCamposObligatorios(['_id', 'nombre', 'correo', 'pais', 'dispositivo']),
  crearUsuario
);

module.exports = router;
