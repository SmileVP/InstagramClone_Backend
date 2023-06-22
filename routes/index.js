var express = require("express");
var router = express.Router();
var { dbUrl } = require("../config/dbConfig");
const {
  hashPassword,
  hashCompare,
  createToken,
  validate,
} = require("../config/auth");
const mongoose = require("mongoose");
var { UserModel } = require("../schema/userSchema");
var { CreatePostModel } = require("../schema/createPostSchema");

//connect to DB
mongoose.connect(dbUrl);

//create users
router.post("/signUp", async (req, res) => {
  try {
    let user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      req.body.password = await hashPassword(req.body.password);
      let doc = new UserModel(req.body);
      await doc.save();
      res.status(201).send({
        message: "User Added successfully please login",
      });
    } else {
      res.status(400).send({
        message: "Email already exists",
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

//login
router.post("/login", async (req, res) => {
  try {
    let user = await UserModel.findOne({ email: req.body.email });

    if (user) {
      if (await hashCompare(req.body.password, user.password)) {
        let token = await createToken({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        });

        res.status(200).send({
          message: "Login successful",
          token,
          user,
        });
      } else {
        res.status(400).send({
          message: "Invalid Credential",
        });
      }
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

//get user details for validation
router.get("/user-details", async (req, res) => {
  try {
    let user = await UserModel.findOne({ email: req.body.email });

    res.status(200).send({
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "internal server error",
      error,
    });
  }
});

//get user details to profile page
router.get("/profile-details/:email", validate, async (req, res) => {
  try {
    let user = await UserModel.findOne({ email: req.params.email });
    res.status(200).send({
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "internal server error",
      error,
    });
  }
});

//to show user profile details
router.get("/user/:email", validate, async (req, res) => {
  try {
    let user = await UserModel.findOne({ email: req.params.email });

    let post = await CreatePostModel.find({ email: req.params.email });

    res.status(200).send({
      user,
      post,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "internal server error",
      error,
    });
  }
});

//to follow user
router.put("/follow", validate, async (req, res) => {
  try {
    let user = await UserModel.findOne({ email: req.body.personEmail });

    //to save your objectId to you like to follow person inside details
    let followDetails = await UserModel.findByIdAndUpdate(
      { _id: req.body.userId },
      {
        $push: { followers: user._id },
      },
      {
        new: true,
      }
    );

    //to save your follow person objectId into your inside  details
    let followersDetails = await UserModel.findByIdAndUpdate(
      { _id: user._id },
      {
        $push: { following: req.body.userId },
      },
      {
        new: true,
      }
    );

    res.status(200).json({
      followDetails,
      followersDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "internal server error",
      error,
    });
  }
});

//to unFollow user
router.put("/unFollow", validate, async (req, res) => {
  try {
    let user = await UserModel.findOne({ email: req.body.personEmail });

    //to save your objectId to you like to follow person inside details
    let followDetails = await UserModel.findByIdAndUpdate(
      { _id: req.body.userId },
      {
        $pull: { followers: user._id },
      },
      {
        new: true,
      }
    );

    //to save your follow person objectId into your inside  details
    let followersDetails = await UserModel.findByIdAndUpdate(
      { _id: user._id },
      {
        $pull: { following: req.body.userId },
      },
      {
        new: true,
      }
    );

    res.status(200).send({
      followDetails,
      followersDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "internal server error",
      error,
    });
  }
});

//to save profile pic
router.put("/uploadProfilePic", validate, async (req, res) => {
  try {
    let user = await UserModel.findOne({ email: req.body.email });

    //update profile in user details
    let saveProfile = await UserModel.findByIdAndUpdate(
      { _id: user._id },
      {
        $set: { photo: req.body.imageUrl },
      },
      {
        new: true,
      }
    );

    //update profile pic in post details
    let save = await CreatePostModel.findOneAndUpdate(
      { email: req.body.email },
      {
        $set: { profile_pic: req.body.imageUrl },
      },
      {
        new: true,
      }
    );

    res.status(200).send({
      message: "Profile image updated successfully",
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
