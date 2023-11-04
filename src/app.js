import express from "express";
import passport from "passport";
import handlebars from "express-handlebars";
import displayRoutes from "express-routemap";
import cookieParser from "cookie-parser";
import swaggerUiExpress from "swagger-ui-express";
import cors from "cors";
import { Server } from "socket.io";
import __dirname from "./utils.js";
import { mongoDBConnection } from "./services/mongo.config.js";
import config from "./config/config.js";
import MessagesManagerDao from "./dao/managers/messagesManager.managers.js";
import initializePassport from "./config/passport.config.js";
import { ErrorHandler } from "./middleware/ErrorHandler.middleware.js";
import { addLogger, getLogger } from "./utils/logger.js";
import swaggerSpecs from "./services/swaggerService.js";
import { addHeaders } from "./middleware/addHeaders.middleware.js";

const { API_VERSION, CURSO, PORT, NODE_ENV } = config;

 // Clase de la aplicación principal
export default class App {
  app; // Instancia de Express
  env; // Variable de entorno (e.g., 'produccion' o 'desarrollo')
  port; // Puerto de la aplicación
  server; // Servidor
  apiRoutes; // Rutas de la API
  viewRoutes; // Rutas de vistas
  messagesManager; // Gestor de mensajes
  logger; // Registro (logger) de la aplicación

  constructor(apiRoutes, viewRoutes) {
    // Inicializa la aplicación Express y configura sus atributos
    this.app = express();
    this.port = PORT || 8000;
    this.env = NODE_ENV;
    this.initializeMiddlewares(); // Inicializa los middlewares
    this.apiRoutes = apiRoutes;
    this.viewRoutes = viewRoutes;
    this.connectDB(); // Conecta a la base de datos
    this.initHandlebars(); // Inicializa el motor de plantillas Handlebars
    this.messagesManager = new MessagesManagerDao(); // Gestor de mensajes
    this.logger = getLogger(); // Obtiene el logger de la aplicación
  }

  getServer() {
    return this.app;
  }

  closeServer(done) {
    this.server = this.app.listen(this.port, () => {
      done();
    });
  }

  async connectDB() {
    await mongoDBConnection(); // Conecta a la base de datos MongoDB
  }

  initializeMiddlewares() {
    // Configura y usa los middlewares para la aplicación Express
    this.app.use(addLogger); // Middleware para agregar el logger a las solicitudes
    this.app.use(cors()); // Middleware para habilitar CORS
    this.app.use(express.json()); // Middleware para analizar JSON en las solicitudes
    this.app.use(express.urlencoded({ extended: true })); // Middleware para analizar datos codificados en las solicitudes
    this.app.use(cookieParser()); // Middleware para analizar cookies
    this.app.use(express.static(`${__dirname}/public`)); // Middleware para servir archivos estáticos
    this.app.use(addHeaders); // Middleware para agregar encabezados personalizados
    initializePassport(); // Inicializa Passport para autenticación
    this.app.use(passport.initialize()); // Middleware para Passport
  }

  initializeRoutes(apiRoutes, viewRoutes) {
    // Configura y usa las rutas de la API y de vistas
    apiRoutes.forEach((route) => {
      this.app.use(`/api/${API_VERSION}`, route.router);
    });
    viewRoutes.forEach((route) => {
      this.app.use(`/`, route.router);
    });

    // Configura la documentación Swagger
    this.app.use("/apidocs", swaggerUiExpress.setup(swaggerSpecs));

    // Ruta de prueba para generar logs
    this.app.get(`/loggerTest`, (req, res) => {
      try {
        // Genera diferentes tipos de mensajes de registro para prueba
        req.logger.fatal("Testing fatal message");
        req.logger.error("Testing error message");
        req.logger.warning("Testing warning message");
        req.logger.info("Testing info message");
        req.logger.http("Testing http message");
        req.logger.debug("Testing debug message");
        res.send("All logs have been triggered ");
      } catch (error) {
        res.logger.error(error);
      }
    });
  }

  initializeWebChat(server) {
    const io = new Server(server); // Inicializa un servidor de WebSockets
    io.on("connection", (socket) => {
      // Maneja la conexión de un cliente
      socket.on("authenticated", async (username) => {
        // Evento cuando un usuario se autentica
        socket.broadcast.emit("newUserConnected", username); // Notifica a los demás usuarios
        await this.messagesManager.newMessage({ user: "Server", content: `${username} connected` });
        const messages = await this.messagesManager.getLastMessages(20);
        io.emit("messageLogs", messages);
      });
      socket.on("message", async (message) => {
        // Evento cuando se recibe un mensaje
        await this.messagesManager.newMessage(message); // Almacena el mensaje
        const messages = await this.messagesManager.getLastMessages(20);
        io.emit("messageLogs", messages); // Notifica a todos los usuarios los últimos mensajes
      });
    });

    // Middleware para hacer el objeto 'io' accesible a las rutas
    this.app.use(function (req, res, next) {
      req.io = io;
      next();
    });
  }

  // Método para iniciar el servidor y configurar la aplicación
  listen() {
    const server = this.app.listen(this.port, () => {
      displayRoutes(this.app);
      this.logger.info(`COURSE: ${CURSO}`);
      this.logger.info(`ENV: ${this.env}`);
      this.logger.info(`PORT: ${this.port}`);
    });

    this.initializeWebChat(server);
    this.initializeRoutes(this.apiRoutes, this.viewRoutes);
    this.app.use(ErrorHandler);
  }

  // Método para inicializar Handlebars como motor de plantillas
  initHandlebars() {
    this.app.engine(
      "handlebars",
      handlebars.engine({
        runtimeOptions: {
          allowProtoPropertiesByDefault: true,
          allowProtoMethodsByDefault: true,
        },
      })
    );
    this.app.set("views", `${__dirname}/views`);
    this.app.set("view engine", "handlebars");
  }
}
