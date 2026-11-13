const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('La variable de entorno MONGODB_URI no está definida en el archivo .env');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(`[DB OK] Conectado a MongoDB Atlas: ${conn.connection.host} (Base: ${conn.connection.name})`);
  } catch (error) {
    console.error(`[DB ERROR] Error crítico al conectar a MongoDB Atlas: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;