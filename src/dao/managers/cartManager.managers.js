import { ClientError } from "../../utils/ClientError.js";
import { CustomErrorCode } from "../../utils/CustomErrorCode.js";
import { cartModel } from "../models/cartModel.models.js";

export default class CartManagerDao {
  // Método para crear un nuevo carrito asociado a un usuario
  async createCart(userId) {
    try {
      const newCartItem = await cartModel.create({ user: userId });
      return newCartItem;
    } catch (error) {
      throw new ClientError("CartManagerDao.createCart", CustomErrorCode.DB_ISSUE);
    }
  }

  // Método para obtener los carritos de un usuario
  getCart = async (userId) => {
    try {
      const carts = await cartModel.find({ user: userId }).populate("products.product");
      return carts;
    } catch (error) {
      throw new ClientError("CartManagerDao.createCart", CustomErrorCode.DB_ISSUE);
    }
  };

  // Método para obtener un carrito por su ID
  getCartById = async (id) => {
    try {
      const cart = await cartModel.findOne({ _id: id }).populate("products.product");
      return cart;
    } catch (error) {
      throw new ClientError("CartManagerDao.getCartById", CustomErrorCode.DB_ISSUE);
    }
  };

  // Método para eliminar un producto de un carrito

  async deleteProduct(cartId, productId) {
    try {
      if (!cartId || !productId) {
        throw new ClientError(
          "CartManagerDao.deleteProduct",
          CustomErrorCode.BAD_PARAMETERS,
          400,
          "BAD PARAM",
          "missing cartId or ProductId"
        );
      }

      const result = await cartModel.updateOne({ _id: cartId }, { $pull: { products: { product: productId } } });
      if (result.modifiedCount === 0) {
        throw new ClientError(
          "CartManagerDao.deleteProduct",
          CustomErrorCode.BAD_PARAMETERS,
          400,
          "BAD PARAM",
          "Product was not in the cart"
        );
      }

      const cart = this.getCartById(cartId);

      return cart;
    } catch (error) {
      if (error.code) {
        throw error;
      }
      throw new ClientError("CartManagerDao.deleteProduct", CustomErrorCode.DB_ISSUE);
    }
  }

  // Método para agregar varios productos a un carrito
  async addMultipleProductsToCart(cartId, products) {
    try {
      if (!products || !products.push) {
        throw new ClientError(
          "CartManagerDao.addMultipleProductsToCart",
          CustomErrorCode.BAD_PARAMETERS,
          400,
          "BAD PARAM",
          "product is required and products should be an array"
        );
      }

      for (const product of products) {
        await this.addProductToCart(cartId, product);
      }
      const cart = this.getCartById(cartId);
      return cart;
    } catch (error) {
      if (error.code) {
        throw error;
      }
      throw new ClientError("CartManagerDao.addMultipleProductsToCart", CustomErrorCode.DB_ISSUE);
    }
  }

  // Método para eliminar todos los productos de un carrito
  async deleteAllProducts(cartId) {
    try {
      const result = await cartModel.updateOne({ _id: cartId }, { products: [] });
      if (result.modifiedCount === 0) {
        throw new ClientError("CartManagerDao.deleteAllProducts", CustomErrorCode.CART_MISSING);
      }

      return await this.getCartById(cartId);
    } catch (error) {
      if (error.code) {
        throw error;
      }
      throw new ClientError("CartManagerDao.deleteAllProducts", CustomErrorCode.DB_ISSUE);
    }
  }

  // Método para establecer la cantidad de un producto en un carrito
  async setProductQuantity(cartId, productId, quantityRaw) {
    try {
      const quantity = parseInt(quantityRaw);
      if (!quantity && isNaN(quantity)) {
        throw new ClientError(
          "CartManagerDao.setProductQuantity",
          CustomErrorCode.BAD_PARAMETERS,
          400,
          "BAD PARAM",
          "Quantity is required and needs to be a valid integer"
        );
      }

      const result = await cartModel.updateOne(
        { _id: cartId },
        { $set: { "products.$[product].quantity": quantity } },
        { arrayFilters: [{ "product.product": productId }] }
      );
      if (result.modifiedCount === 0) {
        throw new ClientError("CartManagerDao.setProductQuantity", CustomErrorCode.DB_ISSUE);
      }
      return await this.getCartById(cartId);
    } catch (error) {
      if (error.code) {
        throw error;
      }
      throw new ClientError("CartManagerDao.setProductQuantity", CustomErrorCode.DB_ISSUE);
    }
  }

  // Método para eliminar un carrito por su ID
  removeCart = async (id) => {
    try {
      await cartModel.deleteOne({ _id: id });
    } catch (error) {
      if (error.code) {
        throw error;
      }
      throw new ClientError("CartManagerDao.removeCart", CustomErrorCode.DB_ISSUE);
    }
  };

  // Método para agregar un producto a un carrito
  async addProductToCart(cartId, productId) {
    try {
      if (!cartId || !productId) {
        throw new ClientError(
          "CartManagerDao.addProductToCart",
          CustomErrorCode.BAD_PARAMETERS,
          400,
          "BAD PARAM",
          "cartId and productId are required"
        );
      }

      let result = await cartModel.updateOne(
        { _id: cartId, "products.product": productId },
        { $inc: { "products.$.quantity": 1 } }
      );
      if (result.modifiedCount === 0) {
        result = await cartModel.updateOne({ _id: cartId }, { $push: { products: { product: productId } } });
      }
      if (result.modifiedCount === 0) {
        throw new ClientError("CartManagerDao.setProductQuantity", CustomErrorCode.DB_ISSUE);
      }

      const cart = this.getCartById(cartId);
      return cart;
    } catch (error) {
      if (error.code) {
        throw error;
      }
      throw new ClientError("CartManagerDao.addProductToCart", CustomErrorCode.DB_ISSUE);
    }
  }
}