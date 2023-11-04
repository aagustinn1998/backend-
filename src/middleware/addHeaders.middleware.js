// Middleware para agregar encabezados de respuesta
export const addHeaders = async (req, res, next) => {
  // Establece el encabezado "Access-Control-Allow-Origin" para permitir solicitudes desde cualquier origen
  res.header("Access-Control-Allow-Origin", "*");

  // Establece el encabezado "Access-Control-Expose-Headers" para exponer el encabezado "Location"
  res.header("Access-Control-Expose-Headers", "Location");

  // Continúa con la siguiente función de middleware
  next();
};