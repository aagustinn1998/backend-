import { connect } from "mongoose";
import config from "../config/config.js";
import { getLogger } from "../utils/logger.js";

const { DB_CNN, DB_NAME } = config;

// Configuración de la conexión a MongoDB
const configConnection = {
  url: `${DB_CNN}`,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: DB_NAME,
  },
};

// Función para establecer la conexión a la base de datos MongoDB
export const mongoDBConnection = async () => {
  const logger = getLogger();

  try {
    // Conecta a la base de datos MongoDB utilizando la configuración proporcionada
    await connect(configConnection.url, configConnection.options);
    logger.info(`CONNECCION MONGO URL: ${configConnection.url.substring(0, 20)} =======`);
  } catch (err) {
    // Manejo de errores en caso de falla en la conexión
    logger.fatal("🚀 ~ file: mongo.config.js:21 ~ mongoDBConnection ~ err:", err);
  }
};
