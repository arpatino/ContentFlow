const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Registro de actividad en consola y en archivo access.log
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev'));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('[INFO] Conectado exitosamente a MongoDB Atlas'))
  .catch((err) => console.error('[ERROR] Fallo al conectar a MongoDB Atlas:', err.message));

  const UsuarioSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  nombre: { type: String, required: true },
  correo: { type: String, required: true },
  pais: { type: String, required: true },
  genero: String,
  fecha_registro: { type: Date, default: Date.now },
  dispositivo: String
}, { collection: 'usuarios', versionKey: false });

const PublicacionSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  usuario_id: { type: String, required: true, ref: 'Usuario' },
  contenido: { type: String, required: true },
  fecha_publicacion: { type: Date, default: Date.now },
  categoria: { type: String, required: true },
  hashtags: [String],
  tipo_publicacion: { type: String, required: true }
}, { collection: 'publicaciones', versionKey: false });

const Usuario = mongoose.model('Usuario', UsuarioSchema);
const Publicacion = mongoose.model('Publicacion', PublicacionSchema);

// 1. Endpoint de Prueba de Conectividad / Healthcheck (IE11)
app.get('/api/health', async (req, res) => {
  try {
    const estado = mongoose.connection.readyState;
    if (estado !== 1) {
      return res.status(503).json({ status: 'ERROR', mensaje: 'Base de datos desconectada' });
    }
    await mongoose.connection.db.admin().ping();
    res.status(200).json({ status: 'OK', dbState: 'Conectado a MongoDB Atlas', timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', detalle: error.message });
  }
});


// 2. GET: Obtener usuarios con filtro opcional por país 
app.get('/api/usuarios', async (req, res) => {
  try {
    const filtro = req.query.pais ? { pais: req.query.pais } : {};
    const usuarios = await Usuario.find(filtro).limit(50);
    res.status(200).json({ total: usuarios.length, data: usuarios });
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar usuarios', detalle: error.message });
  }
});

// 3. POST: Crear un nuevo usuario con control de clave duplicada 
app.post('/api/usuarios', async (req, res) => {
  try {
    const { _id, nombre, correo, pais, genero, dispositivo } = req.body;
    if (!_id || !nombre || !correo || !pais) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (_id, nombre, correo, pais)' });
    }
    const nuevoUsuario = new Usuario({ _id, nombre, correo, pais, genero, dispositivo });
    await nuevoUsuario.save();
    res.status(201).json({ mensaje: 'Usuario creado exitosamente', data: nuevoUsuario });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Conflicto: El _id del usuario ya existe en la base de datos' });
    }
    res.status(500).json({ error: 'Error interno al registrar usuario', detalle: error.message });
  }
});

// 4. GET: Obtener publicaciones
app.get('/api/publicaciones', async (req, res) => {
  try {
    const filtro = req.query.categoria ? { categoria: req.query.categoria } : {};
    const publicaciones = await Publicacion.find(filtro).sort({ fecha_publicacion: -1 }).limit(50);
    res.status(200).json({ total: publicaciones.length, data: publicaciones });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener publicaciones', detalle: error.message });
  }
});

// 5. POST: Crear publicación validando que el usuario_id exista 
app.post('/api/publicaciones', async (req, res) => {
  try {
    const { _id, usuario_id, contenido, categoria, hashtags, tipo_publicacion } = req.body;
    if (!_id || !usuario_id || !contenido || !categoria || !tipo_publicacion) {
      return res.status(400).json({ error: 'Faltan campos obligatorios en la publicación' });
    }

    // Validación de integridad referencial: comprobar que el autor exista en 'usuarios'
    const autorExiste = await Usuario.findById(usuario_id);
    if (!autorExiste) {
      return res.status(404).json({ error: `Referencia inválida: El usuario '${usuario_id}' no existe` });
    }

    const nuevaPub = new Publicacion({ _id, usuario_id, contenido, categoria, hashtags, tipo_publicacion });
    await nuevaPub.save();
    res.status(201).json({ mensaje: 'Publicación registrada en tiempo real', data: nuevaPub });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Conflicto: El _id de la publicación ya existe' });
    }
    res.status(500).json({ error: 'Error interno al crear publicación', detalle: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[INFO] Servidor API corriendo en http://localhost:${PORT}`));