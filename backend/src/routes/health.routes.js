const express = require('express');
const router = express.Router();
const { verificarConectividad } = require('../controllers/health.controller');

router.get('/', verificarConectividad);

module.exports = router;