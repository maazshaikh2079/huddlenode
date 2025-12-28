import express, { Router } from "express";
import validator, { check } from "express-validator";

import {
  getAllPosts,
  getPostByPostId,
  getForumPostsByForumId,
  createPost,
  getUserCreatedPosts,
  editPostTexts,
  editPostImage,
  deletePost,
} from "../controllers/posts.controller.js";

// import { fileUpload } from "../middlewares/file-upload-local.js";
import { fileUpload } from "../middlewares/file-upload.js";
import { verifyJwt } from "../middlewares/check-auth.js";

const router = Router();

router.get("/", getAllPosts);

router.get("/user", verifyJwt, getUserCreatedPosts);

router.get("/:postId", getPostByPostId);

router.get("/forum/:forumId", getForumPostsByForumId);

router.use(verifyJwt);

router.post(
  "/forum/:forumId",
  fileUpload.single("image"), // req.file for local | req.file.buffer for vercel
  [
    // req.body
    check("title").not().isEmpty().withMessage("Post title is required"),
  ],
  createPost
);

router.patch(
  "/:postId/edit/texts",
  [
    // req.body
    check("title").not().isEmpty().withMessage("Title cannot be empty"),
  ],
  editPostTexts
);

router.patch(
  "/:postId/edit/image",
  fileUpload.single("image"), // req.file for local | req.file.buffer for vercel
  editPostImage
);

router.delete("/:postId", deletePost);

export default router;
