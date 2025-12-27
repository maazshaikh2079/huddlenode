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
import { fileUpload } from "../middlewares/file-upload.middleware.js";
import { verifyJwt } from "../middlewares/check-auth.middleware.js";

const router = Router();

router.get("/", getAllUsers);

router.get("/:userId", getUserByUserId);

router.post(
  "/signup",
  fileUpload.single("pfp"),
  [
    check("username").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 8 }),
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
  [check("username").not().isEmpty()],
  editUsername
);

router.patch("/edit/pfp", fileUpload.single("pfp"), editUsersPfp);
// router.patch("/edit/pfp", editUsersPfp);

// router.patch(
//   "/edit/pfp",
//   verifyJwt,           // 1. Check if user is logged in
//   fileUpload.single("pfp"), // 2. Multer parses the file and any body fields
//   editUsersPfp         // 3. Your controller logic
// );

export default router;
