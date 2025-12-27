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
import { fileUpload } from "../middlewares/file-upload.middleware.js";
import { verifyJwt } from "../middlewares/check-auth.middleware.js";

const router = Router();

router.get("/", getAllPosts);

router.get("/user", verifyJwt, getUserCreatedPosts);

router.get("/:postId", getPostByPostId);

router.get("/forum/:forumId", getForumPostsByForumId);

router.use(verifyJwt);

router.post(
  "/forum/:forumId",
  fileUpload.single("image"), // req.file
  [
    // req.body
    check("title").not().isEmpty(),
    // check("content").isLength({ min: 5 }),
  ],
  createPost
);

router.patch(
  "/:postId/edit/texts",
  [
    // req.body
    check("title").not().isEmpty(),
  ],
  editPostTexts
);

router.patch(
  "/:postId/edit/image",
  fileUpload.single("image"), // req.file
  editPostImage
);

router.delete("/:postId", deletePost);

export default router;
