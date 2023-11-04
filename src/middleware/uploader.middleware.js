import multer from "multer";
import getFolderNameFromFileType from "../utils/getFolderNameFromFileType.js";
import fs from "fs";
import { FileTypes } from "../utils/FileTypes.js";

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Obtener la carpeta temporal para el usuario actual
    const tmpFolder = getFolderNameFromFileType(FileTypes.TEMP, req.user.userId);
    
    // Asegurarse de que la carpeta temporal exista (y sus subcarpetas) de manera recursiva
    fs.mkdirSync(tmpFolder.internal, { recursive: true });
    
    // Establecer la carpeta de destino para guardar el archivo
    cb(null, tmpFolder.internal);
  },
  filename: (req, file, cb) => {
    // Establecer el nombre del archivo como su nombre original
    cb(null, file.originalname);
  },
});

export const uploader = multer({ storage });