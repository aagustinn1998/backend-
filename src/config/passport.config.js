import passport from "passport";
import GitHubStrategy from "passport-github2";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import UserManagerDao from "../dao/managers/userManager.manager.js";
import config from "../config/config.js";
import { cookieExtractor } from "../utils/jwt.js";
import { AvailableRoles } from "../constant/role.js";
import { ClientError } from "../utils/ClientError.js";
import { ErrorCode } from "../utils/ErrorCode.js";

// Extraer las variables necesarias del archivo de configuración
const { GITHUB_CLIENT_ID, GITHUB_SECRET, GITHUB_CALLBACK_URL, SIGNING_SECRET, API_URL } = config;

// Inicializar Passport
const initializePassport = () => {
  const userManager = new UserManagerDao();
  
  // Configurar la estrategia de autenticación de GitHub
  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_SECRET,
        callbackURL: GITHUB_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Obtener al usuario a través del correo electrónico o nombre de usuario de GitHub
          const user = await userManager.getUserByEmail(profile._json.email || profile._json.login);
          if (!user) {
            // Si el usuario no existe, crear un nuevo usuario con información de GitHub
            const newUser = await userManager.createUser({
              email: profile._json.email || profile._json.login,
              firstName: profile._json.name,
              lastName: "",
              password: "",
              age: 0,
            });
            return done(null, newUser);
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Configurar la estrategia de autenticación JWT (Tokens Web JSON)
  passport.use(
    "jwt",
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: SIGNING_SECRET,
        audience: API_URL,
      },
      async (jwtPayload, done) => {
        try {
          // Verificar si el payload del token contiene la estructura esperada
          if (!(jwtPayload.user && jwtPayload.user.email && jwtPayload.user.role)) {
            throw new ClientError(
              "passport",
              ErrorCode.BAD_PARAMETERS,
              400,
              "bad request structure",
              "The payload need to include user with an email and role"
            );
          }

          // Obtener al usuario basado en el correo electrónico del token
          const user = await userManager.getUserByEmail(jwtPayload.user.email);

          // Verificar si el usuario existe y su rol está permitido
          if (user && AvailableRoles.includes(jwtPayload.user.role)) {
            return done(null, user);
          }

          return done(null, false);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  // Serializar y deserializar usuarios para mantener la sesión
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser(async (serUser, done) => {
    let user = await userManager.getUserByEmail(serUser.email);
    done(null, user);
  });
};

export default initializePassport;