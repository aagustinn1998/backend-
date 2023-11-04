import { faker } from '@faker-js/faker';
import { productModel } from "../models/productModel.models.js";
import { ClientError } from "../../utils/ClientError.js";
import { ErrorCode } from "../../utils/ErrorCode.js";

// Clase que gestiona los productos
export default class ProductManagerDao {
  // Método para obtener todos los productos
  getAllProducts = async (limit = 10, page = 1, sort, query, baseUrl) => {
    try {
      // Consultamos los productos y paginamos los resultados
      const products = await productModel.paginate(query && JSON.parse(query), {
        limit,
        page,
        sort: sort && { price: sort },
        customLabels: { docs: "payload" },
      });
      return {
        ...products,
        prevLink: products.prevPage && `${baseUrl}/views/products/${products.prevPage}`,
        nextLink: products.nextPage && `${baseUrl}/views/products/${products.nextPage}`,
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }
      throw new ClientError(
        "ProductManagerDao.getAllProducts",
        ErrorCode.DB_ISSUE,
        400,
        "BAD PARAM",
        "Error parsing parameters, sort can only be asc/desc, limit: can only be a number, page: can only be a number, query: has to be a valid JSON compliant with MongoDB query"
      );
    }
  };
// Método para obtener productos falsos
  getAllFakeProducts = async (limit = 10, page = 1, sort, query, baseUrl) => {
    try {
      if (sort || query) {
        throw new ClientError(
          "ProductManagerDao.getAllFakeProducts",
          ErrorCode.BAD_PARAMETERS,
          400,
          "BAD PARAM",
          "sort and query not supported on fake products"
        );
      }

      const products = [];

      for (let index = 0; index < 100; index++) {
        // Generamos datos falsos para productos
        products.push({         
          _id: faker.database.mongodbObjectId(),
          title: `BMW ${faker.vehicle.model()}`,
          description: `${faker.lorem.paragraph(3)}`,
          price: faker.number.int({ min: 10000, max: 60000 }),
          thumbnail: faker.image.url({ width: 640 }),
          code: faker.number.int({ min: 1, max: 100000 }),
          stock: faker.number.int({ min: 1, max: 50 }),
          __v: 0,
        });
      }

      return {
        payload: products.slice(page * limit - limit, page * limit),
        prevLink: page === 1 ? undefined : `${baseUrl}/views/products/${page - 1}`,
        nextLink: `${baseUrl}/views/products/${page + 1}`,
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }
      throw new ClientError("ProductManagerDao.getAllFakeProducts", ErrorCode.DB_ISSUE);
    }
  };

  getProductById = async (id) => {
    try {
      const product = await productModel.findOne({ _id: id });
      return product;
    } catch (error) {
      if (error.code) {
        throw error;
      }
      throw new ClientError("ProductManagerDao.getProductById", ErrorCode.DB_ISSUE);
    }
  };

  // Método para eliminar un producto por su ID
  removeProduct = async (id) => {
    try {
      await productModel.deleteOne({ _id: id });
    } catch (error) {
      if (error.code) {
        throw error;
      }
      throw new ClientError("ProductManagerDao.removeProduct", ErrorCode.DB_ISSUE);
    }
  };

   // Método para agregar un nuevo producto
  async addProduct(product) {
    if (
      !product.title ||
      !product.description ||
      !product.price ||
      !product.thumbnail ||
      !product.code ||
      !product.stock
    ) {
      throw new ClientError(
        "ProductManagerDao.addProduct",
        ErrorCode.BAD_PARAMETERS,
        400,
        "BAD PARAM",
        "title, description, price, thumbnail url, code, stock are required"
      );
    }

    try {
      // Creamos un nuevo producto en la base de datos
      const newCar = await productModel.create(product);
      return newCar;
    } catch (error) {
      if (error.code) {
        throw error;
      }
      throw new ClientError("ProductManagerDao.addProduct", ErrorCode.DB_ISSUE);
    }
  }

  // Método para actualizar un producto
  async updateProduct(idToUpdate, productToUpdate) {
    try {
      // Actualizamos un producto en la base de datos
      const product = await productModel.updateOne({ _id: idToUpdate }, productToUpdate);
      return product;
    } catch (error) {
      if (error.code) {
        throw error;
      }
      throw new ClientError("ProductManagerDao.updateProduct", ErrorCode.DB_ISSUE);
    }
  }

  // Método para cambiar el stock de un producto
  async changeStockForProduct(productId, quantity) {
    try {
      if (!quantity || !productId) {
        throw new ClientError(
          "ProductManagerDao.addProduct",
          ErrorCode.BAD_PARAMETERS,
          400,
          "BAD PARAM",
          "productId and quantity are required"
        );
      }

     // Cambiamos el stock del producto en la base de datos
     await productModel.updateOne({ _id: productId }, { $inc: { stock: quantity } });
    } catch (error) {
      if (error.code) {
        throw error;
      }
      throw new ClientError("ProductManagerDao.changeStockForProduct", ErrorCode.DB_ISSUE);
    }
  }

  // Método para verificar si el usuario es el propietario de un producto
  isProductOwner = async (user, productId) => {
    const prod = await this.getProductById(productId);
    if (prod.owner !== user.email) {
      return false;
    }
    return true;
  };
}