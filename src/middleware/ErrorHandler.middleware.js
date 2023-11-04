import { ErrorCode } from "../utils/ErrorCode.js";

export const ErrorHandler = (error, req, res, next) => {
  // Registra el error en el sistema de registro
  req.logger.error(JSON.stringify(error));

  // Manejo de diferentes tipos de errores
  switch (error.code) {
    case ErrorCode.BAD_PARAMETERS:
      // Error de parámetros incorrectos
      res.status(error.httpStatus).send({
        message: error.message || "Bad parameters",
        status: "error",
      });
      break;
    case ErrorCode.UNAUTHORISED:
      // Error de no autorizado
      res.status(error.httpStatus).send({
        message: error.message || "Unauthorised",
        status: "error",
      });
      break;
    case ErrorCode.CART_MISSING:
      // Error de carrito no encontrado
      res.status(404).send({
        message: error.message || "could not find the cart",
        status: "error",
      });
      break;
    case ErrorCode.BILL_MISSING:
      // Error de factura no encontrada
      res.status(404).send({
        message: error.message || "could not find the bill",
        status: "error",
      });
      break;
    case ErrorCode.PRODUCT_MISSING:
      // Error de producto no encontrado
      res.status(404).send({
        message: error.message || "could not find the product",
        status: "error",
      });
      break;
    case ErrorCode.DB_ISSUE:
      // Error de problema con la base de datos
      res.status(500).send({
        message: error.message || "There is something wrong with the call to the DB",
        status: "error",
      });
      break;
    case ErrorCode.SAME_PASSWORD:
      // Error de contraseña repetida
      res.status(400).send({
        message: error.message || "You can't use the same password",
        status: "error",
      });
      break;
    default:
      // Error no manejado
      res.send({
        message: error.message || "Unhandled error",
        status: "error",
      });
  }
};