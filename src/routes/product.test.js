import chai from "chai";
import supertest from "supertest";
import config from "../config/config.js";
import { loginAndGetCookie } from "../utils/testingLoginHelper.js";

const { API_URL, API_VERSION } = config;

const expect = chai.expect;
const requester = supertest(`${API_URL}`);

describe("Product endpoint testing", () => {
  let cookie;

  before(async () => {
    cookie = await loginAndGetCookie(requester);
  });

  describe("Testing ADMIN level access", () => {
    it("I need to be authenticated", async () => {
      const { statusCode, ok, _body } = await requester.get(`/api/${API_VERSION}/product`);
      expect(statusCode).not.to.equal(200);
    });
    it("I can get all products from the database", async () => {
      const { statusCode, ok, _body } = await requester
        .get(`/api/${API_VERSION}/product`)
        .set("Cookie", [`${cookie.name}=${cookie.value}`]);
      expect(statusCode).to.equal(200);
      expect(_body.status).to.be.ok.and.eql("success");
      expect(_body.payload).to.be.ok.and.to.be.an("array").length.above(0);
    });
    it("I can get a product by id", async () => {
      const { statusCode, ok, _body } = await requester
        .get(`/api/${API_VERSION}/product/64d919672b7197857668852f`)
        .set("Cookie", [`${cookie.name}=${cookie.value}`]);
      expect(statusCode).to.equal(200);
      expect(_body.code).to.be.ok.and.eql(9);
    });
    let insertedProduct;
    it("I can insert a product", async () => {
      const { statusCode, ok, _body } = await requester
        .post(`/api/${API_VERSION}/product`)
        .set("Cookie", [`${cookie.name}=${cookie.value}`])
        .send({
          title: "BMW",
          description:
            "",
          price: 50000,
          thumbnail:
            "https://imgs.search.brave.com/8I4c01hQyfvQmnpRI_z1eKtAIS8Pr8Z0aA24mwok0fA/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvNDU4/OTU2ODYzL2VzL2Zv/dG8vYm13LXNlcmll/LTMuanBnP3M9NjEy/eDYxMiZ3PTAmaz0y/MCZjPUpib1dKa25W/MVVSbFQ0bkhGbGVI/NUFMZ2U2SUZYUTBu/Sk93S1lLS25fVFE9",
          code: 7,
          stock: "",
        });
      expect(statusCode).to.equal(200);
      expect(_body.code).to.be.ok.and.eql(7);
      insertedProduct = _body;
    });
    it("I can delete a product", async () => {
      const { statusCode, ok, _body } = await requester
        .delete(`/api/${API_VERSION}/product/${insertedProduct._id}`)
        .set("Cookie", [`${cookie.name}=${cookie.value}`]);
      expect(statusCode).to.equal(204);
    });
  });
});
