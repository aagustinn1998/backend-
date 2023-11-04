import { RoleType } from "../../constant/role.js";
import { generateToken } from "../../utils/encrypt.js";
import { temporaryCredentialsModel } from "../models/temporaryCredentialsModel.models.js";
import { userModel } from "../models/userModel.models.js";

// Clase que gestiona las credenciales temporales
export default class TemporaryCredentialsDao {
  // Método para crear credenciales temporales
  createTemporaryCredentials = async (email) => {
    try {
      const token = generateToken();  // Generar un token
      const user = await userModel.findOne({ email });  // Buscar un usuario por su correo electrónico

      if (!user) {
        return token;  // Si no se encuentra el usuario, se retorna el token directamente
      }

      await temporaryCredentialsModel.deleteOne({ user: user._id });  // Borrar credenciales temporales existentes para el usuario

      await temporaryCredentialsModel.create({  // Crear nuevas credenciales temporales
        user: user._id,  // Asociarlas al usuario
        token,  // Usar el token generado
      });

      return token;  // Retornar el token generado
    } catch (error) {
      if (error.code) {
        throw error;  // Si ocurre un error con código, lanzar el error
      }
      throw new ClientError("TemporaryCredentialsDao.createTemporaryCredentials", ErrorCode.DB_ISSUE);  // Lanzar error de base de datos
    }
  };

  // Método para validar credenciales temporales
  validateTemporaryCredentials = async (token) => {
    const result = await temporaryCredentialsModel
      .findOne({
        token,
      })
      .populate("user");  // Buscar credenciales temporales por el token y obtener el usuario asociado

    return result.user;  // Retornar el usuario encontrado
  };
}