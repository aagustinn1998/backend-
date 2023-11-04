import { Router } from "express";
import fs from "fs";
import path from "path";
import UserManagerDao from "../dao/managers/userManager.manager.js";
import { authorization } from "../middleware/authorization.middleware.js";
import { uploader } from "../middleware/uploader.middleware.js";
import { ClientError } from "../utils/ClientError.js";
import { ErrorCode } from "../utils/ErrorCode.js";
import { RoleType } from "../constant/role.js";
import { rename, unlink } from "fs/promises";
import getFolderNameFromFileType from "../utils/getFolderNameFromFileType.js";
import { passportCall } from "../utils/jwt.js";
import { FileTypes } from "../utils/FileTypes.js";

export default class UsersRouter {
  path = "/users"; 
  router = Router();
  userManager = new UserManagerDao(); 

  constructor() {
    this.initSessionRoutes(); 
  }

  initSessionRoutes() {
    // Ruta para subir documentos de usuario
    this.router.post(
      `${this.path}/:uid/documents`, 
      passportCall("jwt"), 
      authorization([RoleType.ADMIN, RoleType.PREMIUM, RoleType.USER]), 
      uploader.array("file"), 
      async (req, res, next) => {
        try {
          // Manejo de errores en un bloque try-catch
          if (!req.files || !req.body?.type) {
            throw new ClientError(
              "UserRouter",
              ErrorCode.BAD_PARAMETERS,
              400,
              "Document could not be loaded",
              "Document could not load"
            );
          }

          const userId = req.params.uid; // Obtiene el ID de usuario de la ruta
          const { internal: fileTypeFolder } = getFolderNameFromFileType(req.body.type, userId);

          if (
            ![FileTypes.ACCOUNT_STATEMENT, FileTypes.ID, FileTypes.ADDRESS_PROOF, FileTypes.AVATAR].includes(
              req.body.type
            )
          ) {
            for (const file of req.files) {
              await unlink(file.path);
            }
            throw new ClientError(
              "UploadDocument",
              ErrorCode.BAD_PARAMETERS,
              400,
              "You can only upload user documents here",
              "Wrong Endpoint"
            );
          }

          const user = await this.userManager.getUserById(userId);

          if (!user) {
            for (const file of req.files) {
              await unlink(file.path);
            }
            throw new ClientError("UploadDocument", ErrorCode.BAD_PARAMETERS, 400, "Usuario no encontrado", "Usuario no encontrado");
          }

          if (req.user.role !== RoleType.ADMIN && user.userId !== userId) {
            for (const file of req.files) {
              await unlink(file.path);
            }
            throw aClientError("UploadDocument", ErrorCode.UNAUTHORISED);
          }

          for (const file of req.files) {
            fs.mkdirSync(fileTypeFolder, { recursive: true });
            await rename(file.path, path.join(fileTypeFolder, file.filename));
            this.userManager.createFile(userId, { originalFilename: file.filename, fileType: req.body.type });
          }

          return res.status(204).send();
        } catch (error) {
          next(error);
        }
      }
    );

    // Ruta para activar o desactivar la suscripción premium de un usuario (solo para administradores)
    this.router.post(
      `${this.path}/premium/:uid`, // Ruta que incluye el ID de usuario
      passportCall("jwt"), // Autenticación JWT requerida
      authorization([RoleType.ADMIN]), // Solo los administradores pueden realizar esta operación
      async (req, res, next) => {
        const userId = req.params.uid; // Obtiene el ID de usuario de la ruta
        try {
          await this.userManager.togglePremium(userId); // Activa o desactiva la suscripción premium del usuario
          return res.status(204).send();
        } catch (error) {
          next(error);
        }
      }
    );
  }
}