import mongoose, { Schema } from "mongoose";

// Definición del nombre de la colección de credenciales temporales
const collection = "temporary-credentials";

// Definición del esquema de credenciales temporales
const temporaryCredentialsSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true, // Identificador de usuario, es un campo obligatorio y único
  },
  token: Schema.Types.String, // Token de credenciales temporales
  expireAt: {
    type: Date,
    expires: 60 * 60, // Configuración de expiración en segundos (1 hora)
  },
});


export const temporaryCredentialsModel = mongoose.model(collection, temporaryCredentialsSchema);