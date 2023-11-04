import { messagesModel } from "../models/messagesModel.models.js";

// Clase que gestiona los mensajes
export default class MessagesManagerDao {
  // Método para obtener los últimos mensajes
  getLastMessages = async (limit = 20) => {
    try {
      // Consultamos y ordenamos los mensajes por ID en orden descendente y limitamos la cantidad
      const lastMessages = await messagesModel.find({}).sort({ _id: -1 }).limit(limit);
      return lastMessages;
    } catch (error) {
      if (error.code) {
        throw error;
      }
      throw new ClientError("MessagesManagerDao.getLastMessages", ErrorCode.DB_ISSUE);
    }
  };

  // Método para agregar un nuevo mensaje
  newMessage = async (message) => {
    try {
      // Creamos un nuevo mensaje en la base de datos
      await messagesModel.create(message);
    } catch (error) {
      if (error.code) {
        throw error;
      }
      throw new ClientError("MessagesManagerDao.newMessage", ErrorCode.DB_ISSUE);
    }
  };
}