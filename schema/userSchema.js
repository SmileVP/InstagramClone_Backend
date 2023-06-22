const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, require: true },
    email: {
      type: String,
      require: true,
    },
    mobile: {
      type: Number,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
    photo: {
      type: String,
    },
    followers: [{ type: ObjectId }],
    following: [{ type: ObjectId }],
    status: {
      type: String,
      default: "y",
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { versionKey: false, collection: "users" }
);

const UserModel = mongoose.model("users", UserSchema); //
module.exports = { UserModel };
