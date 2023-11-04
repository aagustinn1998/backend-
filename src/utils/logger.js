import winston from "winston";
import config from "../config/config.js";

const { LOG_LEVEL_CONSOLE, LOG_LEVEL_FILE, NODE_ENV } = config;

// Define opciones personalizadas para los niveles y colores de registro
const customLevelsOptions = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5,
  },
  colors: {
    fatal: "brightRed",
    error: "red",
    warning: "yellow",
    info: "blue",
    http: "green",
    debug: "white",
  },
};

// Agrega los colores personalizados al módulo de registro winston
winston.addColors(customLevelsOptions.colors);

// Crea un objeto logger de winston con configuraciones personalizadas
const logger = winston.createLogger({
  levels: customLevelsOptions.levels,
  transports: [
    // Agrega un transport para la consola
    new winston.transports.Console({
      level: LOG_LEVEL_CONSOLE, // Nivel de registro para la consola
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()), // Formato de registro con color
    }),
  ],
});

// Si el entorno es "produccion", agrega un transport para archivos de registro
if (NODE_ENV === "produccion") {
  logger.transports.push(new winston.transports.File({ filename: "./errors.log", level: LOG_LEVEL_FILE }));
}

// Middleware para agregar el logger a las solicitudes HTTP
export const addLogger = (req, res, next) => {
  req.logger = logger; // Asigna el logger a la solicitud
  req.logger.http(`${req.method} en ${req.url} - ${new Date().toLocaleTimeString()}`); // Registra la solicitud HTTP
  next(); // Continúa con la siguiente función middleware
};

// Función para obtener el logger
export const getLogger = () => {
  return logger;
};