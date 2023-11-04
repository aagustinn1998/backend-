import swaggerJSDoc from "swagger-jsdoc";
import __dirname from "../utils.js";

// Importa la biblioteca swaggerJSDoc para generar especificaciones Swagger
const swaggerSpecs = swaggerJSDoc({
  definition: {
    openapi: "3.0.1", 
    info: {
      title: "E-commerce", 
      description: "", 
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http", 
          scheme: "bearer", 
          bearerFormat: "JWT", 
        },
      },
    },
    security: {
      bearerAuth: ["User"], 
    },
    servers: [{ url: "http://localhost:8080", description: "This is the local environment" }],
    // Define información sobre los servidores utilizados para la API
  },
  apis: [`${__dirname}/docs/**/*.yaml`], 
});


export default swaggerSpecs;