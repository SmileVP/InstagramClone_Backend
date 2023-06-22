const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const CreatePostSchema = new mongoose.Schema(
  {
    name: { type: String, require: true },
    email: { type: String, require: true },
    text: { type: String },
    image: {
      type: String,
      require: true,
    },

    likes: [{ type: ObjectId }],
    profile_pic: { type: String },
    comments: [
      {
        name: { type: String },
        comment: { type: String },
        postedBy: { type: ObjectId },
      },
    ],
    postedOn: {
      type: Date,
      default: Date.now(),
    },
  },
  { versionKey: false, collection: "posts" }
);

const CreatePostModel = mongoose.model("posts", CreatePostSchema); //
module.exports = { CreatePostModel };
