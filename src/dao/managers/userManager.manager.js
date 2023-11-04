import { RoleType } from "../../constant/role.js";
import { ClientError } from "../../utils/ClientError.js";
import { ErrorCode } from "../../utils/ErrorCode.js";
import { FileTypes } from "../../utils/FileTypes.js";
import { createHash, isValidPassword } from "../../utils/encrypt.js";
import getFolderNameFromFileType from "../../utils/getFolderNameFromFileType.js";
import { userModel } from "../models/userModel.models.js";

// Clase que gestiona usuarios
export default class UserManagerDao {
  // Método para iniciar sesión
  login = async (email, password) => {
    try {
      const user = await userModel.findOneAndUpdate({ email }, { last_connection: Date.now() });
      const valid = isValidPassword(user, password);

      if (!valid) {
        return undefined;  // Si la contraseña no es válida, retornar undefined
      }

      if (!user) {
        return undefined;  // Si el usuario no se encuentra, retornar undefined
      }

      delete user.password;  // Eliminar la contraseña antes de devolver los datos
      return {
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        userId: user._id,
        email: user.email,
        age: user.age,
        last_connection: user.last_connection,
      };
    } catch (error) {
      if (error.code) {
        throw error;  // Si hay un error con código, lanzar el error
      }
      throw new ClientError("UserManagerDao.login", ErrorCode.DB_ISSUE);  // Lanzar error de base de datos
    }
  };

  // Método para registrar la última conexión
  registerConnection = async (userId) => {
    try {
      await userModel.updateOne({ _id: userId }, { last_connection: Date.now() });
    } catch (error) {
      if (error.code) {
        throw error;  // Si hay un error con código, lanzar el error
      }
      throw new ClientError("UserManagerDao.registerConnection", ErrorCode.DB_ISSUE);  // Lanzar error de base de datos
    }
  };

  // Método para crear un archivo asociado a un usuario
  createFile = async (userId, { originalFilename, fileType }) => {
    try {
      const paths = getFolderNameFromFileType(fileType, userId);

      await userModel.updateOne(
        { _id: userId },
        {
          $push: {
            documents: {
              externalPath: paths.external,
              internalPath: paths.internal,
              originalFilename,
              fileType,
            },
          },
        }
      );
    } catch (error) {
      if (error.code) {
        throw error;  // Si hay un error con código, lanzar el error
      }
      throw new ClientError("UserManagerDao.registerConnection", ErrorCode.DB_ISSUE);  // Lanzar error de base de datos
    }
  };

  // Método para alternar entre roles de usuario
  togglePremium = async (userId) => {
    try {
      const user = await userModel.findOne({ _id: userId });

      if (user.role === RoleType.USER) {
        const hasDocumentation = await userModel.findOne({
          _id: userId,
          $and: [
            { "documents.fileType": FileTypes.ID },
            { "documents.fileType": FileTypes.ADDRESS_PROOF },
            { "documents.fileType": FileTypes.ACCOUNT_STATEMENT },
          ],
        });

        if (!hasDocumentation) {
          throw new ClientError(
            "UserService",
            ErrorCode.BAD_PARAMETERS,
            400,
            "No se puede convertir a un usuario premium si no ha cargado toda la documentación requerida",
            "documentos faltantes"
          );
        }
      }

      await userModel.updateOne(
        { _id: userId },
        {
          role: user.role === RoleType.USER || user.role === RoleType.ADMIN ? RoleType.PREMIUM : RoleType.USER,
        }
      );
    } catch (error) {
      if (error.code) {
        throw error;  // Si hay un error con código, lanzar el error
      }
      throw new ClientError("UserManagerDao.togglePremium", ErrorCode.DB_ISSUE);  // Lanzar error de base de datos
    }
  };

  // Método para crear un nuevo usuario
  createUser = async ({ email, password, firstName, lastName, role, age }) => {
    try {
      const newUser = await userModel.create({
        first_name: firstName,
        last_name: lastName,
        email,
        password: createHash(password),
        role,
        age,
      });

      delete newUser.password;  // Eliminar la contraseña antes de devolver los datos

      return {
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        role: newUser.role,
        userId: newUser._id,
        email: newUser.email,
        age: newUser.age,
      };
    } catch (error) {
      if (error.code) {
        throw error;  // Si hay un error con código, lanzar el error
      }
      throw new ClientError("UserManagerDao.createUser", ErrorCode.DB_ISSUE);  // Lanzar error de base de datos
    }
  };

  // Método para restablecer la contraseña
  resetPassword = async ({ email, password }) => {
    try {
      await userModel.updateOne({ email }, { password: createHash(password) });
    } catch (error) {
      if (error.code) {
        throw error;  // Si hay un error con código, lanzar el error
      }
      throw new ClientError("UserManagerDao.resetPassword", ErrorCode.DB_ISSUE);  // Lanzar error de base de datos
    }
  };

  // Método para obtener un usuario por su correo electrónico
  getUserByEmail = async (email) => {
    try {
      const user = await userModel.findOne({ email });

      if (!user) {
        return undefined;  // Si el usuario no se encuentra, retornar undefined
      }

      delete user.password;  // Eliminar la contraseña antes de devolver los datos

      return {
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        userId: user._id,
        email: user.email,
        age: user.age,
      };
    } catch (error) {
      if (error.code) {
        throw error;  // Si hay un error con código, lanzar el error
      }
      throw new ClientError("UserManagerDao.getUserByEmail", ErrorCode.DB_ISSUE);  // Lanzar error de base de datos
    }
  };

  // Método para eliminar un usuario por su ID
  removeUser = async (userId) => {
    try {
      await userModel.deleteOne({ _id: userId });
    } catch (error) {
      if (error.code) {
        throw error;  // Si hay un error con código, lanzar el error
      }
      throw new ClientError("UserManagerDao.removeUser", ErrorCode.DB_ISSUE);  // Lanzar error de base de datos
    }
  };

  // Método para obtener un usuario por su ID
  getUserById = async (id) => {
    try {
      const [user] = await userModel.find({ _id: id });

      if (!user) {
        return undefined;  // Si el usuario no se encuentra, retornar undefined
      }

      delete user.password;  // Eliminar la contraseña antes de devolver los datos

      return {
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        userId: user._id,
        email: user.email,
        age: user.age,
      };
    } catch (error) {
      if (error.code) {
        throw error;  // Si hay un error con código, lanzar el error
      }
      throw new ClientError("UserManagerDao.getUserById", ErrorCode.DB_ISSUE);  // Lanzar error de base de datos
    }
  };
}
