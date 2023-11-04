import mongoose, { Schema } from "mongoose";
import { RoleType } from "../../constant/role.js";
import { FileTypes } from "../../utils/FileTypes.js";

const collection = "Users";

// Definición del esquema de usuario
const userSchema = new Schema({
  first_name: Schema.Types.String, // Nombre del usuario
  last_name: Schema.Types.String, // Apellido del usuario
  email: {
    type: Schema.Types.String,
    unique: true, // El campo 'email' es único en la colección
  },
  password: Schema.Types.String, // Contraseña del usuario
  role: {
    type: Schema.Types.String,
    default: RoleType.USER, // Rol del usuario con valor predeterminado 'USER'
    enum: Object.values(RoleType), // Enumeración de roles válidos
  },
  age: Schema.Types.Number, // Edad del usuario
  last_connection: {
    type: Date,
    default: Date.now, // Fecha y hora de la última conexión con valor predeterminado
  },
  documents: {
    type: [
      {
        externalPath: {
          type: Schema.Types.String,
          required: true, // Ruta externa del documento requerida
        },
        internalPath: {
          type: Schema.Types.String,
          required: true, // Ruta interna del documento requerida
        },
        originalFilename: {
          type: Schema.Types.String,
          required: true, // Nombre original del archivo requerido
        },
        fileType: {
          type: Schema.Types.String,
          enum: Object.values(FileTypes), // Enumeración de tipos de archivo válidos
          required: true, // Tipo de archivo requerido
        },
      },
    ],
  },
});


export const userModel = mongoose.model(collection, userSchema);