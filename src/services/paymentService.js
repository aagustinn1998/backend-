import Stripe from "stripe";
import config from "../config/config.js";

const { STRIPE_KEY } = config;

// Crea una nueva instancia de Stripe utilizando la clave proporcionada
const stripe = new Stripe(STRIPE_KEY, {
  apiVersion: "2023-08-16", // Define la versión de la API de Stripe utilizada
});

export default stripe;
