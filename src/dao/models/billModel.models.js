import mongoose, { Schema } from "mongoose";
import { BillStatus } from "../../utils/BillStatus.js";

// Definición del nombre de la colección de facturas
const billCollection = "bill";

// Definición del esquema de la factura
const billSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true, // El ID del usuario asociado a la factura
  },
  code: {
    type: Schema.Types.String,
    unique: true,
    required: true, // Código único de la factura
  },
  date: {
    type: Schema.Types.Date,
    required: true, // Fecha de emisión de la factura
  },
  total: {
    type: Schema.Types.Number,
    required: true, // Total de la factura
  },
  transactionId: {
    type: Schema.Types.String, // ID de la transacción (puede ser nulo)
  },
  status: {
    type: Schema.Types.String,
    required: true,
    default: BillStatus.NotPaid, // Estado de la factura (por defecto, "No pagada")
    enum: Object.values(BillStatus), // Enumeración de posibles estados
  },
  products: {
    type: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "products",
        },
        price: {
          type: Schema.Types.Number,
          required: true, // Precio del producto en la factura
        },
        quantity: {
          type: Schema.Types.Number,
          required: true,
          default: 1, // Cantidad del producto (por defecto, 1)
        },
      },
    ],
  },
});

// Creación del modelo de factura
export const billModel = mongoose.model(billCollection, billSchema);