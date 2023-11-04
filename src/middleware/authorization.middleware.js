// Middleware de autorización
export const authorization = (role) => {
  return async (req, res, next) => {
    // Verifica si no hay un usuario autenticado
    if (!req.user) {
      return res.status(401).json({ message: `No autorizado` });
    }
    
    // Verifica si el rol del usuario no tiene los permisos necesarios
    if (!role.includes(req.user.role)) {
      return res.status(401).json({ message: "No tiene permisos suficientes" });
    }

    // Continúa con la siguiente función de middleware
    next();
  };
};