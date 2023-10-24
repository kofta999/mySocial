require("dotenv").config();
const { expect } = require("chai");
const sinon = require("sinon");
const User = require("../models/user");
const io = require("../socket");
const FeedController = require("../controllers/feed");
const mongoose = require("mongoose");

describe("Feed controller - createPost", () => {
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

  it("should add a create post to the posts of the creator", (done) => {
    sinon.stub(io, "getIO");
    io.getIO.returns({
      emit: function () {},
    });
    const req = {
      userId: "618e2b1e8ff5e8a0a4f4a7b6",
      file: {
        path: "imagePath",
      },
      body: {
        title: "Test post",
        content: "A test post",
      },
    };
    const res = {
      status: function () {
        return this;
      },
      json: function () {},
    };
    FeedController.createPost(req, res, () => {}).then((savedUser) => {
      expect(savedUser).to.have.property("posts");
      expect(savedUser.posts).to.have.length(1);
      done();
      io.getIO.restore();
    });
  });

  after((done) => {
    User.deleteMany({}).then(mongoose.disconnect).then(done);
  });
});
