import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { RoleType } from "../../constant/role.js";

// Definición del nombre de la colección de productos
const productCollection = "products";

// Definición del esquema de productos
const productSchema = new Schema({
  title: {
    type: Schema.Types.String,
    required: true, // Título del producto, es un campo obligatorio
  },
  description: {
    type: Schema.Types.String,
    required: true, // Descripción del producto, es un campo obligatorio
  },
  price: {
    type: Schema.Types.String,
    required: true, // Precio del producto, es un campo obligatorio
  },
  thumbnail: {
    type: Schema.Types.String,
    required: true, // URL de la imagen en miniatura, es un campo obligatorio
  },
  code: {
    type: Schema.Types.Number,
    unique: true, // Código único para el producto
  },
  stock: {
    type: Schema.Types.Number,
    required: true, // Stock del producto, es un campo obligatorio
  },
  owner: {
    type: Schema.Types.String,
    required: true,
    default: RoleType.ADMIN, // Propietario del producto con un valor predeterminado de administrador
  },
});

// Habilitar paginación para el esquema de productos
productSchema.plugin(mongoosePaginate);

// Creación del modelo de productos
export const productModel = mongoose.model(productCollection, productSchema);