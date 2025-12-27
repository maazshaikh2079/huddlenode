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

import { fileUpload } from "../middlewares/file-upload.middleware.js";
import { verifyJwt } from "../middlewares/check-auth.middleware.js";

const router = Router();

router.get("/", getAllForums);

router.get("/user", verifyJwt, getUserForumsByUserId);

router.get("/:forumId", getForumByForumId);

router.use(verifyJwt);

router.post(
  "/",
  fileUpload.single("coverImage"), // req.file
  [
    // req.body
    check("title").not().isEmpty(),
    check("description").isLength({ min: 2 }),
  ],
  createForum
);

router.patch(
  "/:forumId/edit/texts",
  [
    // req.body
    check("title").trim().notEmpty(),
    check("description").trim().isLength({ min: 2 }),
  ],
  editForumTexts
);

router.patch(
  "/:forumId/edit/cover-image",
  fileUpload.single("coverImage"), // req.file
  editForumCoverImage
);

router.delete("/:forumId", deleteForum);

export default router;
