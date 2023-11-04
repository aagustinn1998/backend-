import chai from "chai";
import supertest from "supertest";
import config from "../config/config.js";
import { loginAndGetCookie } from "../utils/testingLoginHelper.js";

const { API_URL, API_VERSION } = config; 

const expect = chai.expect; 
const requester = supertest(`${API_URL}`); 

describe("Pruebas del punto de entrada del carrito", () => {
  let cookie; 

  before(async () => {
    cookie = await loginAndGetCookie(requester);
  });

  describe("Pruebas de acceso a nivel de ADMIN", () => {
    it("Necesito estar autenticado", async () => {
      // Prueba si es necesario estar autenticado
      const { statusCode, ok, _body } = await requester.get(`/api/${API_VERSION}/cart`);
      expect(statusCode).not.to.equal(200); // Espera que el código de estado no sea 200
    });
    let cartId; 

    it("Puedo crear un carrito", async () => {
      // Prueba si se puede crear un carrito
      const { statusCode, ok, _body } = await requester
        .post(`/api/${API_VERSION}/cart`)
        .set("Cookie", [`${cookie.name}=${cookie.value}`]);

      expect(statusCode).to.equal(200);
    });

    it("Puedo obtener mi carrito de la base de datos", async () => {
      // Prueba si se puede obtener el carrito de la base de datos
      const { statusCode, ok, _body } = await requester
        .get(`/api/${API_VERSION}/cart`)
        .set("Cookie", [`${cookie.name}=${cookie.value}`]);
      expect(statusCode).to.equal(200); 
      expect(_body.status).to.be.ok.and.eql("success"); 
      expect(_body.payload).to.be.ok.and.to.be.an("array").length.above(0); 
      cartId = _body.payload[0]._id; 
    });

    it("Puedo insertar un producto por ID", async () => {
      // Prueba si se puede insertar un producto por su ID en el carrito
      const { statusCode, ok, _body } = await requester
        .post(`/api/${API_VERSION}/cart/${cartId}/product/64d919672b7197857668852f`)
        .set("Cookie", [`${cookie.name}=${cookie.value}`]);
      expect(statusCode).to.equal(200); 
    });

    it("Puedo eliminar un carrito", async () => {
      // Prueba si se puede eliminar un carrito
      const { statusCode, ok, _body } = await requester
        .delete(`/api/${API_VERSION}/cart/${cartId}/removeCart`)
        .set("Cookie", [`${cookie.name}=${cookie.value}`]);
      expect(statusCode).to.equal(204); 
    });
  });
});