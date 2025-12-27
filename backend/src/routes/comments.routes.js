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
import { fileUpload } from "../middlewares/file-upload.middleware.js";
import { verifyJwt } from "../middlewares/check-auth.middleware.js";

const router = Router();

router.get("/", getAllComments);

router.get("/post/:postId", getPostCommentsByPostId);

router.use(verifyJwt);

router.post(
  "/post/:postId",
  fileUpload.single("image"), // req.file
  createComment
);

router.get("/user", getUserCommentsByUserId);

router.patch(
  "/:commentId",
  [
    // req.body
    check("text").trim().notEmpty(),
  ],
  editComment
);

router.delete("/:commentId", deleteComment);

export default router;
