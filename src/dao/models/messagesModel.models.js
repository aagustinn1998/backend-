import mongoose, { Schema } from "mongoose";

// Definición del nombre de la colección de mensajes
const messagesCollection = "messages";

// Definición del esquema de mensajes
const messagesSchema = new Schema({
  user: {
    type: Schema.Types.String,
    required: true, // El identificador del usuario que envió el mensaje
  },
  content: {
    type: Schema.Types.String,
    required: true, // El contenido del mensaje
  },
});

// Creación del modelo de mensajes
export const messagesModel = mongoose.model(messagesCollection, messagesSchema);