import express, { Router } from "express";
import validator, { check } from "express-validator";

import {
  getAllForums,
  getForumByForumId,
  createForum,
  getUserForumsByUserId,
  editForumTexts,
  editForumCoverImage,
  deleteForum,
} from "../controllers/forums.controller.js";

// import { fileUpload } from "../middlewares/file-upload-local.js";
import { fileUpload } from "../middlewares/file-upload.js";
import { verifyJwt } from "../middlewares/check-auth.js";

const router = Router();

router.get("/", getAllForums);

router.get("/user", verifyJwt, getUserForumsByUserId);

router.get("/:forumId", getForumByForumId);

router.use(verifyJwt);

router.post(
  "/",
  fileUpload.single("coverImage"), // req.file for local | req.file.buffer for vercel
  [
    // req.body
    check("title").not().isEmpty().withMessage("Title is required"),
    check("description")
      .isLength({ min: 2 })
      .withMessage("Description must be at least 2 characters"),
  ],
  createForum
);

router.patch(
  "/:forumId/edit/texts",
  [
    // req.body
    check("title").trim().notEmpty().withMessage("Title cannot be empty"),
    check("description")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Description is too short"),
  ],
  editForumTexts
);

router.patch(
  "/:forumId/edit/cover-image",
  fileUpload.single("coverImage"), // req.file for local | req.file.buffer for vercel
  editForumCoverImage
);

router.delete("/:forumId", deleteForum);

export default router;
