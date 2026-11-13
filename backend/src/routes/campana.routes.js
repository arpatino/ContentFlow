const express = require('express');
const router = express.Router();
const {
  obtenerImpactoCampanas,
  asociarPublicacionACampana
} = require('../controllers/campana.controller');
const { validarCamposObligatorios } = require('../middlewares/validate.middleware');

router.get('/impacto', obtenerImpactoCampanas);
router.post(
  '/:id/asociar-publicacion',
  validarCamposObligatorios(['publicacion_id']),
  asociarPublicacionACampana
);

module.exports = router;