import { Router } from "express";
import ProductManagerDao from "../dao/managers/productManager.managers.js";
import CartManagerDao from "../dao/managers/cartManager.managers.js";
import { authorization } from "../middleware/authorization.middleware.js";
import { passportCall } from "../utils/jwt.js";
import BillManagerDao from "../dao/managers/billManager.managers.js";
import { RoleType } from "../constant/role.js";

export default class ViewsRouter {
  path = "/views";
  router = Router();
  productManager = new ProductManagerDao();
  cartManager = new CartManagerDao();
  billManager = new BillManagerDao();

  constructor() {
    this.initViewsRoutes();
  }

  initViewsRoutes() {
    // Ruta para mostrar la página de inicio
    this.router.get(`${this.path}`, (req, res) => {
        res.render("index", { style: "index.css" });
    });

    // Ruta para mostrar la página de inicio del sitio
    this.router.get(`${this.path}/home`, async (req, res, next) => {
        try {
            const products = await this.productManager.getAllProducts();
            res.render("home", { products, style: "home.css" });
        } catch (error) {
            next(error);
        }
    });

    // Ruta para mostrar la página de éxito

    this.router.get(`${this.path}/success`, async (req, res, next) => {
      try {
        res.render("success");
      } catch (error) {
        next(error);
      }
    });


    // Ruta para mostrar la página de cancelación
    this.router.get(`${this.path}/cancelled`, async (req, res, next) => {
      try {
        res.render("cancelled");
      } catch (error) {
        next(error);
      }
    });

    // Ruta para mostrar la lista de productos paginados
    this.router.get(
      `${this.path}/products/:pn`,
      [passportCall("jwt"), authorization([RoleType.ADMIN, RoleType.USER, RoleType.PREMIUM])],
      async (req, res, next) => {
        try {
          let pageNumber = req.params.pn;
          if (pageNumber) {
            pageNumber = Number(pageNumber);
          }

          const data = await this.productManager.getAllProducts(
            undefined,
            pageNumber,
            undefined,
            undefined,
            req.baseUrl
          );
          
          res.render("products", { data, style: "products.css" });
        } catch (error) {
          next(error);
        }
      }
    );

    // Ruta para mostrar detalles de una factura
    this.router.get(
      `${this.path}/bill/:id`,
      [passportCall("jwt"), authorization([RoleType.ADMIN, RoleType.USER, RoleType.PREMIUM])],
      async (req, res, next) => {
        try {
          const billId = req.params.id;
          const data = await this.billManager.getBillById(billId);
          res.render("bill", { data, style: "bill.css" });
        } catch (error) {
          next(error);
        }
      }
    );

    // Ruta para mostrar el carrito de compras
    this.router.get(
      `${this.path}/cart`,
      [passportCall("jwt"), authorization([RoleType.ADMIN, RoleType.USER, RoleType.PREMIUM])],
      (req, res) => {
        res.render("cart", { style: "products.css" });
      }
    );

    // Ruta para mostrar productos en tiempo real

    this.router.get(`${this.path}/realtimeproducts`, async (req, res, next) => {
      try {
        const products = await this.productManager.getAllProducts();
        res.render("realTimeProducts", { products, style: "home.css" });
      } catch (error) {
        next(error);
      }
    });

    // Ruta para mostrar la página de inicio de sesión
    this.router.get("/login", (req, res) => {
      res.render("login", { style: "login.css" });
    });

    // Ruta para mostrar la página de registro
    this.router.get("/register", (req, res) => {
      res.render("register");
  });

  // Ruta para mostrar la página de recuperación de contraseña
  this.router.get("/recover/:token", (req, res) => {
      const { token } = req.params;
      res.render("recover", { style: "recover.css", token });
  });

  // Ruta para mostrar el perfil del usuario
  this.router.get(
      "/profile",
      [passportCall("jwt"), authorization([RoleType.ADMIN, RoleType.USER, RoleType.PREMIUM])],
      (req, res) => {
          const user = req.user;
          res.render("profile", {
              user,
              cart: {
                  cartId: "_id",
                },
              });
            }
          );
        }
      }