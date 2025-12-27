import { v4 as uuidv4 } from "uuid";
import validator, { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getAllUsers = async (req, res, next) => {
  console.log("log> GET req in `/users`");

  let allUsers;
  try {
    // allUsers = await User.find().exec(); // `exec()` returns actuall promise
    allUsers = await User.find({}, "-password");
    console.log("log> allUsers :-");
    console.log(allUsers);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong! could not get allUsers. Error: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not get allUsers.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!allUsers) {
    const error = new ApiError("Could not get users", 404);
    console.log("log> Error: Could not get users");
    return next(error);
  }

  res.json({
    users: allUsers.map((user) => user.toObject({ getters: true })),
  });
};

const getUserByUserId = async (req, res, next) => {
  console.log("log> GET req in `/users/:userId`");

  const { userId } = req.params;

  let user;
  try {
    user = await User.findById(userId).select("-password");
    console.log("log> user :-");
    console.log(user);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong! could not get user by userId. Error: ${err}`,
      500
    );
    console.log(
      `log> Something went wrong! could not get user by userId.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!user) {
    const error = new ApiError("User not found by provided userId", 404);
    console.log("log> Error: User not found by provided userId");
    return next(error);
  }

  res.status(200).json({
    user: user.toObject({ getters: true }),
  });
};

{
  // {
  //     "username": "Maaz Shaikh",
  //     "pfp": "https://i.ibb.co/p6mmQg1M/Formal-infront-dias.jpg",
  //     "email": "maaz@gmail.com",
  //     "password": "maaz1234",
  // "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGJiMzEzMjJiM2VhYzI2MGZjMzRmMzciLCJlbWFpbCI6Im1hYXpAZ21haWwuY29tIiwiaWF0IjoxNzU3MDk4MjkwLCJleHAiOjE3NTcxMDE4OTB9.E_dGfIvfcpdmPJ5IuQ4xsBo4KMD47i1NvYlcgfg99jA"
  // }
  // {
  //     "username": "Max Schwaz",
  //     "pfp": "https://images.pexels.com/photos/839011/pexels-photo-839011.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  //     "email": "max@gmail.com",
  //     "password": "maxx1234",
  // "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGJiMzM2ZGQxMTM1NGMyNjU4NmE1Y2YiLCJlbWFpbCI6Im1heEBnbWFpbC5jb20iLCJpYXQiOjE3NTcwOTg4NjEsImV4cCI6MTc1NzEwMjQ2MX0.qDDHZAIu_lr5I9dRoB7NEhkyNyUHXJwhqUEN5V2WAFE"
  // }
  // {
  //     "username": "Patrick",
  //     "pfp": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTY20tT_B44jyp2dDnHUEqWjYcWen11HDassA&s",
  //   "email": "patrick@gmail.com",
  //   "password": "patrick1234",
  // "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGJiMzNhNTJjYTQwNDExMDMzYzg0MGQiLCJlbWFpbCI6InBhdHJpY2tAZ21haWwuY29tIiwiaWF0IjoxNzU3MDk4OTE3LCJleHAiOjE3NTcxMDI1MTd9.hQKQ42OykMOV1qXjwjYEEWnWvX_4MHzJvOiIBjkLKlY"
  // }
  // {
  //     "username": "Steve",
  //     "pfp": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvkbhbqRdDTakSl_fo8-RT5Vuqh0gzjXAXTc_riwP4gNTycEz56nUVc80Rnm1uDv_ihgE&usqp=CAU",
  //   "email": "steve@gmail.com",
  //   "password": "steve1234"
  // "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGJiMzQxNjBjMWEyNzAwNzMxMzdhN2MiLCJlbWFpbCI6InN0ZXZlQGdtYWlsLmNvbSIsImlhdCI6MTc1NzA5OTAzMCwiZXhwIjoxNzU3MTAyNjMwfQ.aTUlKKyKM4RP9ynwhQHC_DF5Nxx9DtdWMuqwfm3uxXU"
  // }
}

const signupUser = async (req, res, next) => {
  console.log("log> POST req in `/users`");

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log("log> Errors:-");
    console.log(errors);
    return next(
      new ApiError("Invalid inputs passed, please ckeck your data.", 422)
    );
  }

  console.log("log> req.file:-");
  console.log(req.file);
  console.log("log> req.body:-");
  console.log(req.body);

  const { username, email, password } = req.body;
  // const { username, email, password, pfp } = req.body;

  let registeredUser;
  try {
    registeredUser = await User.findOne({ email });
    console.log("log> registeredUser:-");
    console.log(registeredUser);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong! could not check whether the user is already registered or not.\nError: ${err}`,
      500
    );
    console.log(
      `log> Something went wrong! could not check whether the user is already registered or not.\nError: ${err}`
    );
    return next(error);
  }

  if (registeredUser) {
    console.log(
      "log> Error: User already registered. - users.controller.js - signupUser()"
    );
    const error = new ApiError("User already registered.", 422);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new ApiError(
      `Cloud not hash user's password.\nError: ${err}`,
      500
    );
    console.log(`log> ${error.message} - users.controller.js - signupUser()`);
    return next(error);
  }

  // uploading image on cloudinary to get image url before saving it in db ->
  let pfpLocalPath = req.file?.path;
  let pfpUrl;

  if (pfpLocalPath) {
    try {
      const pfpRes = await uploadOnCloudinary(pfpLocalPath);
      // console.log("log> pfpRes:-\n", pfpRes);
      if (pfpRes?.secure_url) pfpUrl = pfpRes.secure_url;
    } catch (err) {
      // return next(new ApiError("Could not upload profile picture", 400));
      const error = new ApiError(
        `Something went wrong! could not upload pfp to cloudinary\nError: ${err} - users.controller.js - signupUser()`,
        400
      );
      console.log(`log> Error: ${error.message}`);
      return next(error);
    }
  }

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    pfp: pfpUrl || "https://i.ibb.co/VpwB5Hx3/default-avatar.webp",
    // pfp: pfp || "https://i.ibb.co/VpwB5Hx3/default-avatar.webp",
  });

  console.log("log> newUser:-");
  console.log(newUser);

  let result;
  try {
    result = await newUser.save();
    console.log("log> result:-");
    console.log(result);
  } catch (err) {
    const error = new ApiError(`Could not register user!\nError: ${err}`, 500);
    console.log(`log> Could not register user!\nlog> Error: ${err}`);
    if (pfpUrl) await deleteFromCloudinary(pfpUrl);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.MY_JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );
    console.log("log> token:-");
    console.log(token);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong while generating token\nError: ${err} - users.controller.js - signupUser()`,
      422
    );
    console.log(
      `log> Something went wrong while generating token\nError: ${err} - users.controller.js - signupUser()`
    );
    if (pfpUrl) await deleteFromCloudinary(pfpUrl);
    return next(error);
  }

  res.status(201).json({
    registeration: {
      message: "User registered",
      userId: newUser.id,
      email: newUser.email,
      token,
    },
  });
};

const loginUser = async (req, res, next) => {
  console.log("log> POST req in `/users`");

  const { email, password } = req.body;

  let identifiedUser;
  try {
    identifiedUser = await User.findOne({ email });
    console.log("log> identifiedUser:-");
    console.log(identifiedUser);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong! could not check whether the user exist or not in db. Error: ${err}`,
      500
    );
    console.log(
      `log> Something went wrong! could not check whether the user exist or not in db.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!identifiedUser) {
    const error = new ApiError("User is not registered, sign-up first.", 401);
    console.log("log> Error: User is not registered, sign-up first.");

    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, identifiedUser.password);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong while password commarison.\nError: ${err} - users.controller.js - loginUser()`,
      500
    );

    return next(error);
  }

  if (!isValidPassword) {
    const error = new ApiError(`Invalid password, could not log-in`, 401);
    console.log(`log> Error: Invalid password, could not log-in`);

    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: identifiedUser.id, email: identifiedUser.email },
      process.env.MY_JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new ApiError(
      `Something went wrong while generating token\nError: ${err} - users.controller.js - loginUser()`,
      422
    );

    return next(error);
  }

  res.json({
    login: {
      message: "User logged-in",
      userId: identifiedUser.id,
      email: identifiedUser.email,
      token,
    },
  });
};

const editUsername = async (req, res, next) => {
  console.log("log> PATCH req in `/users/edit/username`");

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log("log> Errors:-");
    console.log(errors);
    return next(
      new ApiError("Invalid inputs passed, please ckeck your data.", 422)
    );
  }

  // const { username, userId } = req.body;
  const { username } = req.body;
  const userId = req.userData.userId;

  let user;
  try {
    user = await User.findById(userId);
    console.log("log> user:-");
    console.log(user);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong! could not find user for username updation. Error: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not find user for username updation.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!user) {
    const error = new ApiError(
      "Could not find a user with the provided user id for username updation process.",
      422
    );
    return next(error);
  }

  user.username = username;

  console.log("log> updated `user`:-");
  console.log(user);

  let result;
  try {
    result = await user.save();
    console.log("log> result:-");
    console.log(result);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong! could not save updated user. Error: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not save updated user.\nlog> Error: ${err}`
    );
    return next(error);
  }

  res
    .status(201)
    .json({ updation: { user: user.toObject({ getters: true }), result } });
};

const editUsersPfp = async (req, res, next) => {
  console.log("log> PATCH req in `/users/edit/pfp` ");

  // 1. Securely get userId from JWT middleware
  const userId = req.userData.userId;

  console.log("log> req.file:-");
  console.log(req.file);
  console.log("log> req.body:-");
  console.log(req.body);

  // 2. Initial User Search
  let user;
  try {
    user = await User.findById(userId);
    console.log("log> user:-");
    console.log(user);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong! could not find user for pfp updation. Error: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not find user for pfp updation.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!user) {
    const error = new ApiError(
      "Could not find a user with the provided user id for pfp updation process.",
      422
    );
    return next(error);
  }

  // 3. Securely check for local file path from Multer
  const pfpLocalPath = req.file?.path;
  if (!pfpLocalPath) {
    const error = new ApiError(
      "PfP file is missing locally! - users.controller.js - editUsersPfp()",
      400
    );
    console.log(
      "log> Error: PfP file is missing locally! - users.controller.js - editUsersPfp()"
    );
    return next(error);
  }

  // Handle Cloudinary Upload, URL formatting, DB Saving, and Cloudinary Deletion in one block
  try {
    // 4. Uploading new pfp on cloudinary
    const newPfpRes = await uploadOnCloudinary(pfpLocalPath);
    console.log("log> newPfpRes:-");
    console.log(newPfpRes);

    if (!newPfp || !newPfp.secure_url) {
      const error = new ApiError(
        "`newPfpRes` or `newPfpRes.secure_url` is not present on cloudinary - users.controller.js - editUsersPfp()"
      );
      console.log("log> Error:", error.message);
      return next(error);
    }

    const prevPfpUrl = user.pfp;
    user.pfp = newPfpRes.secure_url;

    console.log("log> updated `user`:-");
    console.log(user);

    // 5. Saving modifications in db
    const result = await user.save();
    console.log("log> result:-");
    console.log(result);

    // 6. deleting prev pfp from cloudinary (Background Task)
    // Only delete if it's not the default-avatar URL
    if (prevPfpUrl && !prevPfpUrl.includes("default-avatar")) {
      deleteFromCloudinary(prevPfpUrl)
        .then((deleteResult) => {
          console.log(
            "log> users.controller.js - editUsersPfp() - deleteFromCloudinary() - deleteResult:-"
          );
          console.log(deleteResult);
        })
        .catch((err) => {
          const error = new ApiError(
            `Could not delete old PFP from Cloudinary. Error: ${err}`
          );
          console.log("log> Error:", error.message);
          return next(error);
        });
    }

    // 7. Successful Response
    return res.status(201).json({
      updation: {
        user: user.toObject({ getters: true }),
        result,
      },
    });
  } catch (err) {
    const error = new ApiError(
      `Something went wrong during the update process! Error: ${err.message} - users.controller.js - editUsersPfp()`,
      400
    );
    console.log(`log> Error: ${error.message}`);
    return next(error);
  }
};

export {
  getAllUsers,
  getUserByUserId,
  signupUser,
  loginUser,
  editUsername,
  editUsersPfp,
};
