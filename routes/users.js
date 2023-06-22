var express = require("express");
var router = express.Router();
var { dbUrl } = require("../config/dbConfig");
var { CreatePostModel } = require("../schema/createPostSchema");
const {
  hashPassword,
  hashCompare,
  createToken,
  decodeToken,
  validate,
  roleAdmin,
  decodePasswordToken,
} = require("../config/auth");
var { UserModel } = require("../schema/userSchema");
const mongoose = require("mongoose");
var { passwordEmail } = require("../service/passwordEmail");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//connect to DB
mongoose.connect(dbUrl);

//frontend url
let frontUrl = "https://profound-daifuku-e83fd0.netlify.app";

//create post
router.post("/createPost", validate, async (req, res) => {
  try {
    //get user details
    let user = await UserModel.findOne({ email: req.body.email });
    let doc = new CreatePostModel({
      image: req.body.image,
      text: req.body.text,
      name: req.body.name,
      email: req.body.email,
      profile_pic: user.photo,
    });
    await doc.save();
    res.status(201).send({
      message: "Post created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "internal server error",
      error,
    });
  }
});

//get all posts
router.get("/post-details", validate, async (req, res) => {
  try {
    let posts = await CreatePostModel.find().sort("-postedOn");
    res.status(200).send({
      posts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "internal server error",
      error,
    });
  }
});

//like post
router.put("/like-post", validate, async (req, res) => {
  try {
    let user = await UserModel.findOne({ email: req.body.email });

    let like = await CreatePostModel.findByIdAndUpdate(
      { _id: req.body.id },
      {
        $push: { likes: user._id },
      },
      {
        new: true,
      }
    );

    res.status(200).send({
      like,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "internal server error",
      error,
    });
  }
});

//unlike post
router.put("/unLike-post", validate, async (req, res) => {
  try {
    let user = await UserModel.findOne({ email: req.body.email });

    let unLike = await CreatePostModel.findByIdAndUpdate(
      { _id: req.body.id },
      {
        $pull: { likes: user._id },
      },
      {
        new: true,
      }
    );

    res.status(200).send({
      unLike,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "internal server error",
      error,
    });
  }
});

//create comment
router.put("/comment-post", validate, async (req, res) => {
  try {
    let user = await UserModel.findOne({ email: req.body.email });

    const comment = {
      name: user.fullName,
      comment: req.body.text,
      postedBy: user._id,
    };

    let commentDetails = await CreatePostModel.findByIdAndUpdate(
      //post id
      { _id: req.body.id },
      {
        $push: { comments: comment },
      },
      {
        new: true,
      }
    );

    res.status(200).send({
      message: "comment posted successfully",
      commentDetails,
    });

    console.log(user);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "internal server error",
      error,
    });
  }
});

//delete post
router.delete("/delete-post/:postId", async (req, res) => {
  try {
    let details = await CreatePostModel.deleteOne({ _id: req.params.postId });

    res.status(200).send({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "internal server error",
      error,
    });
  }
});

//send email
router.post("/send-email", async (req, res) => {
  try {
    let user = await UserModel.findOne({ email: req.body.email });
    if (user) {
      let fullName = user.fullName;
      let email = user.email;
      // creating token
      let token = jwt.sign({ fullName, email }, process.env.SECRET_KEY_RESET, {
        expiresIn: process.env.FORGOT_EXPIRES,
      });

      await passwordEmail({
        fullName: user.fullName,
        email: user.email,
        message: `${frontUrl}/reset-password/${user._id}/${token}`,
      });

      res.status(200).send({
        message: "Email sent successfully",
      });
    } else {
      res.status(400).send({
        message: "Email does not exists",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "internal server error",
      error,
    });
  }
});

//verify token for reset password
router.get("/reset-password/:id/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const data = await decodePasswordToken(token);
    if (Math.floor(Date.now() / 1000) <= data.exp) {
      res.status(200).send({
        message: "Valid user",
      });
    } else {
      res.status(401).send({
        message: "Token expired",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "internal server error",
      error,
    });
  }
});

//save new password
router.post("/change-password/:id/:token", async (req, res) => {
  try {
    let token = req.params.token;
    const _id = req.params.id;
    var password = req.body.password;
    var changePass = await hashPassword(password);
    const updatePassword = await UserModel.updateOne(
      { _id: _id },
      { $set: { password: changePass } }
    );
    res.status(200).send({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "internal server error",
      error,
    });
  }
});

module.exports = router;
