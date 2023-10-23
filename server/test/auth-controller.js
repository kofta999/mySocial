const { expect } = require("chai");
const sinon = require("sinon");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const AuthController = require("../controllers/auth");

describe("Auth controller - Login", () => {
  it("should throw an error with code 500 if accessing database fails", (done) => {
    sinon.stub(User, "findOne");
    User.findOne.throws();
    const req = {
      body: {
        email: "test@test.com",
        password: "tester",
      },
    };
    AuthController.login(req, {}, () => {}).then((result) => {
      expect(result).to.be.an("error");
      expect(result).to.have.property("statusCode", 500);
      done();
    });
    User.findOne.restore();
  });

  it("should throw an error if user is not found", (done) => {
    sinon.stub(User, "findOne");
    User.findOne.returns(null);
    const req = {
      body: {
        email: "test@test.com",
        password: "tester",
      },
    };
    AuthController.login(req, {}, () => {}).then((result) => {
      expect(result).to.be.an(
        "error",
        "A user with this email could not be found."
      );
      expect(result).to.have.property("statusCode", 401);
      done();
    });

    User.findOne.restore();
  });

  it("should throw an error if passwords does not match", (done) => {
    sinon.stub(User, "findOne");
    sinon.stub(bcrypt, "compare");
    const req = {
      body: {
        email: "test@test.com",
        password: "tester",
      },
    };
    User.findOne.returns(req.body);
    bcrypt.compare.returns(false);

    AuthController.login(req, {}, () => {}).then((result) => {
      expect(result).to.be.an("error", "Wrong password!");
      expect(result).to.have.property("statusCode", 401);
      done();
    });

    User.findOne.restore();
    bcrypt.compare.restore();
  });
});
