import mongoose, { Schema } from "mongoose";

// Definición del nombre de la colección del carrito
const cartCollection = "cart";

// Definición del esquema del carrito
const cartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true, // El ID del usuario asociado al carrito
    unique: true, // Garantiza que un usuario solo tenga un carrito
  },
  products: {
    type: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "products",
        },
        quantity: {
          type: Schema.Types.Number,
          required: true, // Cantidad del producto en el carrito
          default: 1, // Valor por defecto de la cantidad (1)
        },
      },
    ],
  },
});


export const cartModel = mongoose.model(cartCollection, cartSchema);