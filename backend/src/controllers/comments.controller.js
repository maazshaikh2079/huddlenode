import validator, { validationResult } from "express-validator";
import mongoose, { startSession } from "mongoose";

import { Comment } from "../models/comment.model.js";
import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";

import { ApiError } from "../utils/ApiError.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getAllComments = async (req, res, next) => {
  console.log("log> GET req in `/comments`");

  let allComments;
  try {
    allComments = await Comment.find().exec();
    console.log("log> allComments :-");
    console.log(allComments);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong! could not get comments. Error: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not get comments.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!allComments) {
    const error = new ApiError("Could not get comments", 404);
    console.log("log> Error: Could not get comments");
    return next(error);
  }

  res.json({
    comments: allComments.map((comment) => comment.toObject({ getters: true })),
  });
};

const createComment = async (req, res, next) => {
  console.log("log> POST req in `/comments/post/:postId`");

  console.log("log> req.file:-");
  console.log(req.file);
  console.log("log> req.body:-");
  console.log(req.body);

  // const { text, image, userId } = req.body;
  const { text } = req.body;
  const userId = req.userData.userId;
  const postId = req.params.postId;
  const imageLocalPath = req.file?.path;

  if (!text && !imageLocalPath) {
    // if (!text && !image) {
    const error = new ApiError(
      "Comment must have either text or image - comments.controller.js - createComment()"
    );
    console.log(`log> Error: ${error.message}  `);
    return next(error);
  }

  let type = "text";
  if (text && imageLocalPath) type = "mixed";
  else if (imageLocalPath) type = "image";
  // if (text && image) type = "mixed";
  // else if (image) type = "image";

  // uploading image on cloudinary to get image url before saving it in db ->
  let imageUrl;

  if (type === "mixed" || type === "image") {
    try {
      let imageRes = await uploadOnCloudinary(imageLocalPath);
      // console.log("log> imageRes:-\n", imageRes);
      if (imageRes?.secure_url) imageUrl = imageRes.secure_url;
    } catch (err) {
      const error = new ApiError(
        `Something went wrong! could not upload image to cloudinary\nError: ${err} - comments.controller.js - createPost()`,
        400
      );
      console.log(`log> Error: ${error.message}`);
      return next(error);
    }
  }

  const newComment = new Comment({
    ...(text && { text }),
    ...(imageUrl && { image: imageUrl }),
    // image,
    type,
    author: userId,
    post: postId,
  });

  let user;
  try {
    user = await User.findById(userId);
    // console.log("log> user:-"); console.log(user);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong while 'User.findById(userId)' Error: ${err} - comments.controller.js - createComment()`,
      500
    );
    console.log(
      `log> Something went wrong while 'User.findById(userId)'\nlog>Error: ${err} - comments.controller.js - createComment()`
    );
    if (imageUrl) await deleteFromCloudinary(imageUrl);
    return next(error);
  }

  if (!user) {
    const error = new ApiError(
      `User with id: ${userId} does not exist in \`users\` collection of db - comments.controller.js - createComment()`,
      401
    );
    console.log(`log> Error: ${error.message}`);
    if (imageUrl) await deleteFromCloudinary(imageUrl);
    return next(error);
  }

  let post;
  try {
    post = await Post.findById(postId);
    // console.log("log> post:-"); console.log(post);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong while 'Post.findById(postId)' Error: ${err} - comments.controller.js - createComment()`,
      500
    );
    console.log(
      `log> Something went wrong while 'Post.findById(postId)'\nlog>Error: ${err} - comments.controller.js - createComment()`
    );
    if (imageUrl) await deleteFromCloudinary(imageUrl);
    return next(error);
  }

  if (!post) {
    const error = new ApiError(
      `post with id: ${postId} does not exist in \`posts\` collection of db - comments.controller.js - createComment()`,
      401
    );
    console.log(`log> Error: ${error.message}`);
    if (imageUrl) await deleteFromCloudinary(imageUrl);
    return next(error);
  }

  let result;
  let session = await startSession();
  session.startTransaction();
  try {
    result = await newComment.save({ session });
    // console.log("log> result:-"); console.log(result);
    user.comments.push(newComment);
    post.comments.push(newComment);
    result = await user.save({ session });
    result = await post.save({ session });
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    const error = new ApiError(
      `Could not create a comment! Error: ${err}`,
      500
    );
    console.log(`log> Could not create a comment!\nlog> Error: ${err}`);
    if (imageUrl) await deleteFromCloudinary(imageUrl);
    return next(error);
  } finally {
    session.endSession();
  }

  res.status(201).json({
    creation: { comment: newComment.toObject({ getters: true }) },
  });
};

const getPostCommentsByPostId = async (req, res, next) => {
  console.log("log> GET req in `/comments/post/:postId`");

  const postId = req.params.postId;

  let postComments;
  try {
    postComments = await Comment.find({ post: postId }).populate("author");
    console.log("log> postComments:-");
    console.log(postComments);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong! could not get post comments. Error: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not get post comments.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!postComments) {
    const error = new ApiError(
      "Could not find post comments for the provided post id.",
      404
    );
    return next(error);
  }

  res.json({
    postId,
    postComments: postComments.map((comment) =>
      comment.toObject({ getters: true })
    ),
  });
};

const getUserCommentsByUserId = async (req, res, next) => {
  console.log("log> GET req in `/comments/user`");

  const userId = req.userData.userId;
  // const { userId } = req.body;

  let userComments;
  try {
    userComments = await Comment.find({ author: userId });
    console.log("log> userComments:-");
    console.log(userComments);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong! could not get user comments. Error: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not get user comments.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!userComments) {
    const error = new ApiError(
      "Could not find user comments for the provided post id.",
      404
    );
    return next(error);
  }

  res.json({
    userId,
    userComments: userComments.map((comment) =>
      comment.toObject({ getters: true })
    ),
  });
};

const editComment = async (req, res, next) => {
  console.log("PATCH req in `/comments/:commentId` ");

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // OR  if (errors.not().isEmpty())
    console.log("log> Errors:-");
    console.log(errors);
    return next(
      new ApiError("Invalid inputs passed, please ckeck your data.", 422)
    );
  }

  const commentId = req.params.commentId;
  // const { text, userId } = req.body;
  const { text } = req.body;
  const userId = req.userData.userId;

  let comment;
  try {
    comment = await Comment.findById(commentId);
    console.log("comment:-");
    console.log(comment);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong! could not get comment for updation.\nError: ${err}`,
      500
    );

    console.log(
      `log> Something went wrong! could not get comment for updation.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!comment) {
    const error = new ApiError(
      "Could not find a comment with the provided comment id for updation process.",
      422
    );

    return next(error);
  }

  if (comment.author.toString() !== userId) {
    const error = new ApiError(
      "Forbidden! You are not allowed to edit/update this comment as you are not the author of this comment - comments.controller.js - editComment()",
      403
    );
    console.log(`log> Error: ${error.message}`);
    return next(error);
  }

  comment.text = text;
  comment.edited = true;

  console.log("log> updated `comment`:-");
  console.log(comment);

  let result;
  try {
    result = await comment.save();
    console.log("log> result:-");
    console.log(result);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong! could not save updated comment.\nError: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not save updated comment.\nlog>Error: ${err}`
    );
    return next(error);
  }

  res.status(201).json({
    updation: { comment: comment.toObject({ getters: true }), result },
  });
};

const deleteComment = async (req, res, next) => {
  console.log("log> DELETE req in `/comments/:commentId`");

  const commentId = req.params.commentId;
  const userId = req.userData.userId;
  // const { userId } = req.body;

  let comment;
  try {
    comment = await Comment.findById(commentId);
    // .populate("author")
    // .populate("post");
    console.log("log> comment:-");
    console.log(comment);
    console.log("log> comment.post:-");
    console.log(comment.post);
    console.log("log> comment.author:-");
    console.log(comment.author);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong! could not get comment for deletion process.\nError: ${err}`,
      500
    );

    console.log(
      `log> Something went wrong! could not get comment for deletion process.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!comment) {
    const error = new ApiError(
      "Could not find a comment with the provided comment id for deletion process.",
      422
    );

    return next(error);
  }

  // if (comment.author.id !== userId) {
  if (comment.author.toString() !== userId) {
    const error = new ApiError(
      "Forbidden! You are not allowed to delete this comment as you are not the author of this comment - comments.controller.js - deleteComment()",
      403
    );
    console.log(`log> Error: ${error.message}`);
    return next(error);
  }

  // For deleteing place image from cloudinary after deleting place from db
  let imageUrl = comment?.image;

  // Deleting comment from db, post and user(author)
  let result;
  let session = await startSession();
  session.startTransaction();
  try {
    result = await comment.deleteOne({ session });
    // comment.author.comments.pull(comment);
    // comment.post.comments.pull(comment);
    // result = await comment.author.save({ session });
    // result = await comment.post.save({ session });
    //
    // alt way (Instead of pulling + saving & populating `comment.author` + `comment.post`) :-
    result = await User.updateOne(
      { _id: comment.author },
      { $pull: { comments: comment._id } },
      { session }
    );
    result = await Post.updateOne(
      { _id: comment.post },
      { $pull: { comments: comment._id } },
      { session }
    );

    // Note: add comment image delete logic here for atomicity

    await session.commitTransaction();
    // console.log("log> result:-"); // console.log(result);
  } catch (err) {
    await session.abortTransaction();
    const error = new ApiError(
      `Something went wrong! could not delete comment.\nError: ${err}`
    );
    console.log(
      `log> Something went wrong! could not delete comment. \nlog> Error: ${err}`
    );
    return next(error);
  } finally {
    session.endSession();
  }

  // deleting comment image from cloudinary after comment got deleted from db
  if (imageUrl) {
    try {
      const result = await deleteFromCloudinary(imageUrl);
      console.log(
        "log> comment.controller.js -> deleteComment() -> deleteFromCloudinary() -> result:-"
      );
      console.log(result);
    } catch (err) {
      const error = new ApiError(
        `Something went wrong while deleteFromCloudinary()\nError: ${err} - comments.controller.js - deleteComment()`,
        400
      );
      console.log(`log> Error: ${error.message}`);
      return next(error);
    }
  }

  res.status(200).json({
    deletion: { comment: `Deleted comment with id: ${commentId}` },
  });
};

export {
  getAllComments,
  createComment,
  getPostCommentsByPostId,
  getUserCommentsByUserId,
  editComment,
  deleteComment,
};
