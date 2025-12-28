import express, { Router } from "express";
import validator, { check } from "express-validator";

import {
  getAllUsers,
  getUserByUserId,
  loginUser,
  signupUser,
  editUsername,
  editUsersPfp,
} from "../controllers/users.controller.js";
// import { fileUpload } from "../middlewares/file-upload-local.js";
import { fileUpload } from "../middlewares/file-upload.js";
import { verifyJwt } from "../middlewares/check-auth.js";

const router = Router();

router.get("/", getAllUsers);

router.get("/:userId", getUserByUserId);

router.post(
  "/signup",
  fileUpload.single("pfp"),
  [
    check("username").not().isEmpty().withMessage("Username is required"),
    check("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("Please provide a valid email"),
    check("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
  ],
  signupUser
);

router.post(
  "/login",
  [
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 8 }),
  ],
  loginUser
);

router.use(verifyJwt);

router.patch(
  "/edit/username",
  [check("username").not().isEmpty().withMessage("Username cannot be empty")],
  editUsername
);

router.patch("/edit/pfp", fileUpload.single("pfp"), editUsersPfp);
// router.patch("/edit/pfp", editUsersPfp);

export default router;
