require("dotenv").config();
const { expect } = require("chai");
const sinon = require("sinon");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const AuthController = require("../controllers/auth");
const mongoose = require("mongoose");

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

describe("Auth controller - getUserStatus", () => {
  before((done) => {
    mongoose
      .connect(process.env.TEST_DATABASE_URI)
      .then((result) => {
        const user = new User({
          email: "test@test.com",
          password: "tester",
          name: "Test",
          posts: [],
          _id: "618e2b1e8ff5e8a0a4f4a7b6",
        });
        return user.save();
      })
      .then(() => done());
  });

  it("should send a response for a valid user status for an existing user", (done) => {
    const req = {
      userId: "618e2b1e8ff5e8a0a4f4a7b6",
    };
    const res = {
      statusCode: 500,
      userStatus: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.userStatus = data.status;
      },
    };
    AuthController.getUserStatus(req, res, () => {}).then(() => {
      expect(res.statusCode).to.be.equal(200);
      expect(res.userStatus).to.be.equal("I am new!");
      done();
    });
  });

  it("should fail with status code of 404 for a non existing user", (done) => {
    const req = {
      userId: "618e2b1e8ff5e8a0a4f4a7b5",
    };
    AuthController.getUserStatus(req, {}, () => {}).then((result) => {
      expect(result).to.be.an("error", "User not found.");
      expect(result).to.have.property("statusCode", 404);
      done();
    });
  });

  after((done) => {
    User.deleteMany({}).then(mongoose.disconnect).then(done);
  });
});
