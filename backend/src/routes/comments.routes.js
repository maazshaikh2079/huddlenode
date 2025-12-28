import express, { Router } from "express";
import validator, { check } from "express-validator";

import {
  getAllComments,
  createComment,
  getPostCommentsByPostId,
  getUserCommentsByUserId,
  editComment,
  deleteComment,
} from "../controllers/comments.controller.js";
// import { fileUpload } from "../middlewares/file-upload-local.js";
import { fileUpload } from "../middlewares/file-upload.js";
import { verifyJwt } from "../middlewares/check-auth.js";

const router = Router();

router.get("/", getAllComments);

router.get("/post/:postId", getPostCommentsByPostId);

router.use(verifyJwt);

router.post(
  "/post/:postId",
  fileUpload.single("image"), // req.file for local | req.file.buffer for vercel
  createComment
);

router.get("/user", getUserCommentsByUserId);

router.patch(
  "/:commentId",
  [
    // req.body
    check("text").trim().notEmpty().withMessage("Comment text cannot be empty"),
  ],
  editComment
);

router.delete("/:commentId", deleteComment);

export default router;
