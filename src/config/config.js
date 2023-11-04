// Importamos la librería 'dotenv'
import dotenv from "dotenv";

// Configuramos 'dotenv' para cargar las variables desde un archivo específico basado en el entorno
dotenv.config({
  path: `.env.${process.env.NODE_ENV || "desarrollo"}.local`,
});
// Desestructuramos las variables de entorno necesarias desde 'process.env'
const {
  API_VERSION,
  PORT,
  DB_CNN,
  DB_NAME,
  CURSO,
  NODE_ENV,
  SIGNING_SECRET,
  GITHUB_SECRET,
  GITHUB_APP_ID,
  GITHUB_CLIENT_ID,
  GITHUB_CALLBACK_URL,
  API_URL,
  LOG_LEVEL_CONSOLE,
  LOG_LEVEL_FILE,
  EMAIL_ADDRESS,
  EMAIL_SECRET,
  STRIPE_KEY,
} = process.env;

// Exportamos un objeto que contiene las variables de entorno desestructuradas
export default {
  API_VERSION,
  PORT,
  DB_CNN,
  DB_NAME,
  CURSO,
  NODE_ENV,
  SIGNING_SECRET,
  GITHUB_SECRET,
  GITHUB_APP_ID,
  GITHUB_CLIENT_ID,
  GITHUB_CALLBACK_URL,
  API_URL,
  LOG_LEVEL_CONSOLE,
  LOG_LEVEL_FILE,
  EMAIL_ADDRESS,
  EMAIL_SECRET,
  STRIPE_KEY,
};
