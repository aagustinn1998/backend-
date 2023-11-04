import { billModel } from "../models/billModel.models.js";
import crypto from "crypto";
import CartManagerDao from "./cartManager.managers.js";
import ProductManagerDao from "./productManager.managers.js";
import { ClientError } from "../../utils/ClientError.js";
import { ErrorCode } from "../../utils/ErrorCode.js";
import { BillStatus } from "../../utils/BillStatus.js";

// Definimos la clase BillManagerDao para gestionar las facturas
export default class BillManagerDao {
  cartManager;  
  productManager;  

  constructor() {
    this.cartManager = new CartManagerDao();  
    this.productManager = new ProductManagerDao();  
  }

  // Método para crear una factura a partir de un carrito
  async createBill(cart) {
    try {
      const productsToBill = []; 
      let billTotal = 0;  

      if (!cart) {
        throw new ClientError("facturación", ErrorCode.CART_MISSING);  
      }

      for (const product of cart.products) {
        if (product.product.stock < product.quantity) {
          continue;
        }

        await this.cartManager.deleteProduct(cart._id, product.product.id);
        await this.productManager.changeStockForProduct(product.product.id, product.quantity * -1);

        billTotal += product.product.price * product.quantity;

        productsToBill.push({
          product: product.product._id,
          price: product.product.price,
          quantity: product.quantity,
        });
      }

      const newBillItem = await billModel.create({
        user: cart.user,
        code: crypto.randomBytes(4).toString("hex"),  // Generamos un código aleatorio de 4 bytes en formato hexadecimal
        date: new Date(),
        products: productsToBill,
        total: billTotal,
      });

      return newBillItem;
    } catch ({ message }) {
      throw new ClientError(`La creación de la factura falló, mensaje: ${message}`);
    }
  }

  // Método para generar un ID de transacción para una factura
  async generateTransactionId(billId) {
    const transactionId = crypto.randomBytes(16).toString("hex");  // Generamos un ID de transacción aleatorio
    await billModel.updateOne({ _id: billId }, { transactionId });  // Actualizamos la factura con el ID de transacción
    return transactionId;
  }

  // Método para marcar una factura como pagada
  async completePayment(billId, transactionId) {
    const result = await billModel.updateOne(
      { _id: billId, transactionId, status: BillStatus.NotPaid },  
      { status: BillStatus.Paid, transactionId: null }  
    );
    if (result.modifiedCount !== 1) {
      throw new ClientError(
        "Facturas",
        ErrorCode.BAD_PARAMETERS,
        "Algo salió mal",
        "Algo salió mal durante el proceso de pago, por favor, contacte a nuestro equipo de ventas"
      );
    }
    return;
  }

  // Método para cancelar el proceso de pago de una factura
  async cancelCheckout(billId) {
    const result = await billModel.updateOne({ _id: billId, status: BillStatus.NotPaid }, { transactionId: null });

    if (result.modifiedCount !== 1) {
      throw new ClientError(
        "Facturas",
        ErrorCode.BAD_PARAMETERS,
        "Algo salió mal",
        "Algo salió mal durante el proceso de pago, por favor, contacte a nuestro equipo de ventas"
      );
    }

    return;
  }

  // Método para obtener una factura por su ID
  getBillById = async (id) => {
    try {
      const bill = await billModel.findOne({ _id: id }).populate(["products.product", "user"]);
      return bill;
    } catch ({ message }) {
      throw new ClientError("dao de facturación", ErrorCode.BILL_MISSING);
    }
  };
}