import validator, { validationResult } from "express-validator";
import mongoose, { startSession } from "mongoose";

import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Forum } from "../models/forum.model.js";
import { Comment } from "../models/comment.model.js";

import { ApiError } from "../utils/ApiError.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
// } from "../utils/cloudinary-local.js";

const getAllPosts = async (req, res, next) => {
  console.log("log> GET req in `/posts`");

  let allPosts;
  try {
    allPosts = await Post.find().exec();
    console.log("log> allPosts :-");
    console.log(allPosts);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong! could not get posts. Error: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not get posts.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!allPosts) {
    const error = new ApiError("Could not get posts", 404);
    console.log("log> Error: Could not get posts");
    return next(error);
  }

  res.json({
    posts: allPosts.map((post) => post.toObject({ getters: true })),
  });
};

const getPostByPostId = async (req, res, next) => {
  console.log("log> GET req in `/posts/:postId`");

  const postId = req.params.postId;

  let post;
  try {
    post = await Post.findById(postId).populate("creator");
    console.log("log> post:-");
    console.log(post);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong! could not get post by postId. Error: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not get post by postId.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!post) {
    const error = new ApiError(
      "Could not find post for the provided post id.",
      404
    );
    return next(error);
  }

  res.json({
    postId,
    post: post.toObject({ getters: true }),
  });
};

const createPost = async (req, res, next) => {
  console.log("log> POST req in `/posts/forum/:forumId`");

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log("log> Errors:-");
    console.log(errors);
    return next(
      new ApiError("Invalid inputs passed, please ckeck your data.", 422)
    );
  }

  // console.log("log> req.file (Local Storage):-");
  // console.log(req.file);
  console.log("log> req.file (Memory Storage):-\n", {
    fieldname: req.file?.fieldname,
    originalname: req.file?.originalname,
    mimetype: req.file?.mimetype,
    size: req.file?.size,
    bufferExists: !!req.file?.buffer, // Confirms buffer is present for Cloudinary
  });
  console.log("log> req.body:-");
  console.log(req.body);

  const { title, content } = req.body;
  const userId = req.userData.userId;
  // const { title, content, image, userId } = req.body;
  const forumId = req.params.forumId;

  // uploading image on cloudinary to get image url before saving it in db ->
  // const imageLocalPath = req.file?.path; // for local storage i.e `uploads` directory
  const imageBuffer = req.file?.buffer; // for memory storage, here vercel
  let imageUrl;

  // if (imageLocalPath) {
  if (imageBuffer) {
    try {
      const imageRes = await uploadOnCloudinary(imageLocalPath);
      // console.log("log> imageRes:-\n", imageRes);
      if (imageRes?.secure_url) imageUrl = imageRes.secure_url;
    } catch (err) {
      const error = new ApiError(
        `Something went wrong! could not upload image to cloudinary\nError: ${err} - posts.controller.js - createPost()`,
        400
      );
      console.log(`log> Error: ${error.message}`);
      return next(error);
    }
  }

  const newPost = new Post({
    title,
    content,
    ...(imageUrl && { image: imageUrl }),
    forum: forumId,
    creator: userId,
  });

  let user;
  try {
    user = await User.findById(userId);
    // console.log("log> user:-"); console.log(user);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong while 'User.findById(userId)' Error: ${err} - posts.controller.js - createPost()`,
      500
    );
    console.log(
      `log> Something went wrong while 'User.findById(userId)'\nlog>Error: ${err} - posts.controller.js - createPost()`
    );
    if (imageUrl) await deleteFromCloudinary(imageUrl);
    return next(error);
  }

  if (!user) {
    const error = new ApiError(
      `User with id: ${creator} does not exist in \`users\` collection of db - posts.controller.js - createPost()`,
      401
    );
    console.log(`log> Error: ${error.message}`);
    if (imageUrl) await deleteFromCloudinary(imageUrl);
    return next(error);
  }

  let forum;
  try {
    forum = await Forum.findById(forumId);
    // console.log("log> forum:-"); console.log(forum);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong while 'Forum.findById(forumId)' Error: ${err} - posts.controller.js - createPost()`,
      500
    );
    console.log(
      `log> Something went wrong while 'Forum.findById(forumId)'\nlog>Error: ${err} - posts.controller.js - createPost()`
    );
    if (imageUrl) await deleteFromCloudinary(imageUrl);
    return next(error);
  }

  if (!forum) {
    const error = new ApiError(
      `forum with id: ${forumId} does not exist in \`forums\` collection of db - posts.controller.js - createPost()`,
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
    result = await newPost.save({ session });
    // console.log("log> result:-"); console.log(result);
    user.createdPosts.push(newPost);
    forum.posts.push(newPost);
    result = await user.save({ session });
    result = await forum.save({ session });
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    const error = new ApiError(`Could not create a post! Error: ${err}`, 500);
    console.log(`log> Could not create a post!\nlog> Error: ${err}`);
    if (imageUrl) await deleteFromCloudinary(imageUrl);
    return next(error);
  } finally {
    session.endSession();
  }

  res.status(201).json({
    creation: { post: newPost.toObject({ getters: true }), result },
  });
};

const getForumPostsByForumId = async (req, res, next) => {
  console.log("log> GET req in `/posts/forum/:forumId`");

  // const userId = req.userData.userId;
  const forumId = req.params.forumId;

  let forumPosts;
  try {
    forumPosts = await Post.find({ forum: forumId }).populate("creator");
    console.log("log> forumPosts:-");
    console.log(forumPosts);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong! could not get forum posts. Error: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not get forum posts.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!forumPosts) {
    const error = new ApiError(
      "Could not find forum posts for the provided forum id.",
      404
    );
    return next(error);
  }

  res.json({
    forumId,
    forumPosts: forumPosts.map((post) => post.toObject({ getters: true })),
  });
};

const getUserCreatedPosts = async (req, res, next) => {
  console.log("log> GET req in `/posts/user`");

  const userId = req.userData.userId;
  // const { userId } = req.body;

  let userPosts;
  try {
    userPosts = await Post.find({ creator: userId });
    console.log("log> userPosts:-");
    console.log(userPosts);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong! could not get user posts. Error: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not get user posts.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!userPosts) {
    const error = new ApiError(
      "Could not find user posts for the provided forum id.",
      404
    );
    return next(error);
  }

  res.json({
    userId,
    userPosts: userPosts.map((post) => post.toObject({ getters: true })),
  });
};

const editPostTexts = async (req, res, next) => {
  console.log("PATCH req in `/:postId/edit/texts`");

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log("log> Errors:-");
    console.log(errors);
    throw new ApiError("Invalid inputs passed, please check your data.", 422);
  }

  const postId = req.params.postId;
  const userId = req.userData.userId;
  const { title, content } = req.body;
  // const { title, content, userId } = req.body;

  let post;
  try {
    post = await Post.findById(postId);
    console.log("log> post:-");
    console.log(post);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong! could not find post for updation.\nError: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not find post for updation.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!post) {
    const error = new ApiError(
      "Could not find a post with the provided post id for updation process.",
      422
    );
    console.log(`log> Error: ${error.message}`);
    return next(error);
  }

  if (post.creator.toString() !== userId) {
    const error = new ApiError(
      "Forbidden! You are not allowed to edit/update this post as you are not the creator of this post - posts.controller.js - editPostTexts()",
      403
    );
    console.log(`log> Error: ${error.message}`);
    return next(error);
  }

  post.title = title;
  if (content) post.content = content;
  post.edited = true;

  console.log("log> updated `post`:-");
  console.log(post);

  let result;
  try {
    result = await post.save();
    console.log("log> result:-");
    console.log(result);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong! could not save updated post.\nError: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not save updated post.\nlog> Error: ${err}`
    );
    return next(error);
  }

  res
    .status(200)
    .json({ updation: { post: post.toObject({ getters: true }), result } });
};

const editPostImage = async (req, res, next) => {
  console.log("PATCH req in `/:postId/edit/image`");

  // console.log("log> req.file (Local Storage):-");
  // console.log(req.file);
  console.log("log> req.file (Memory Storage):-\n", {
    fieldname: req.file?.fieldname,
    originalname: req.file?.originalname,
    mimetype: req.file?.mimetype,
    size: req.file?.size,
    bufferExists: !!req.file?.buffer, // Confirms buffer is present for Cloudinary
  });
  console.log("log> req.body:-");
  console.log(req.body);

  const postId = req.params.postId;
  const userId = req.userData.userId;
  // const { image, userId } = req.body;

  let post;
  try {
    post = await Post.findById(postId);
    console.log("log> post:-");
    console.log(post);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong! could not find post for updation.\nError: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not find post for updation.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!post) {
    const error = new ApiError(
      "Could not find a post with the provided post id for updation process.",
      422
    );
    console.log(`log> Error: ${error.message}`);
    return next(error);
  }

  if (post.creator.toString() !== userId) {
    const error = new ApiError(
      "Forbidden! You are not allowed to edit/update this post as you are not the creator of this post - posts.controller.js - editPostImage()",
      403
    );
    console.log(`log> Error: ${error.message}`);
    return next(error);
  }

  if (!post.image) {
    const error = new ApiError(
      "This post does not contain an image - posts.controller.js - editPostImage()",
      404
    );
    console.log(`log> Error: ${error.message}`);
    return next(error);
  }

  // uploading image on cloudinary to get image url before saving it in db ->
  // const imageLocalPath = req.file?.path; // for local storage i.e `uploads` directory
  const imageBuffer = req.file?.buffer; // for memory storage, here vercel
  if (!imageBuffer) {
    const error = new ApiError(
      // "Post image file is missing locally! - forums.controller.js - editForumCoverImage()",
      "Post image file buffer is not present in memory! - forums.controller.js - editForumCoverImage()",
      400
    );
    console.log("log> Error: ", error.message);
    return next(error);
  }

  // Handle Cloudinary Upload, URL formatting, DB Saving, and Cloudinary Deletion in one block
  try {
    // Uploading new pfp on cloudinary
    const newImageRes = await uploadOnCloudinary(imageLocalPath);
    console.log("log> newImageRes:-");
    console.log(newImageRes);

    if (!newImageRes || !newImageRes.secure_url) {
      const error = new ApiError(
        "`newImageRes` or `newImageRes.secure_url` is not present on cloudinary - posts.controller.js - editPostImage()"
      );
      console.log("log> Error:", error.message);
      return next(error);
    }

    const prevImageUrl = post.image;
    post.image = newImageRes.secure_url;

    console.log("log> updated `post`:-");
    console.log(post);

    // Saving modifications in db
    const result = await post.save();
    console.log("log> result:-");
    console.log(result);

    // Deleting prev coverImage from cloudinary (Background Task)
    // Only delete if it's not the default-image-placeholder URL
    if (prevImageUrl) {
      deleteFromCloudinary(prevImageUrl)
        .then((deleteResult) => {
          console.log(
            "log> posts.controller.js - editPostImage() - deleteFromCloudinary() - deleteResult:-"
          );
          console.log(deleteResult);
        })
        .catch((err) => {
          const error = new ApiError(
            `Could not delete old post image from Cloudinary. Error: ${err}`
          );
          console.log("log> Error:", error.message);
          return next(error);
        });
    }

    // Successful Response
    return res.status(201).json({
      updation: {
        post: post.toObject({ getters: true }),
        result,
      },
    });
  } catch (err) {
    const error = new ApiError(
      `Something went wrong during the update process! Error: ${err.message} - posts.controller.js - editPostImage()`,
      400
    );
    console.log(`log> Error: ${error.message}`);
    return next(error);
  }
};

const deletePost = async (req, res, next) => {
  console.log("DELETE req in `/posts/:postsId`");

  const postId = req.params.postId;
  const userId = req.userData.userId;
  // const { userId } = req.body;

  // ----------- finding post -----------
  let post;
  try {
    post = await Post.findById(postId).populate("comments");
    console.log("log> post:-");
    console.log(post);
  } catch (err) {
    const error = new ApiError(
      `Somthing went wrong! could not get post for deletion.\nError ${err}`,
      500
    );
    console.log(`log> Error: ${error.message}`);
    return next(error);
  }

  if (!post) {
    const error = new ApiError(
      "Could not find the post with provided post-id for deletion",
      422
    );
    console.log(`log> Error: ${error.message}`);
    return next(error);
  }

  if (post.creator.toString() !== userId) {
    const error = new ApiError(
      "Forbidden! You are not allowed to delete this post as you are not the owner/creator of this post - post.controller.js - deletePost()",
      403
    );
    console.log(`log> Error: ${error.message}`);
    return next(error);
  }
  // -------------------------------

  // for deleting post comments
  let commentIds = post.comments.map((comment) => comment._id);

  // for deleting post comments images after post and comments deletion from db
  let commentImageUrls = post.comments
    .filter((comment) => comment.image) // here comment.image is condition
    .map((comment) => comment.image); // here comment.image is return value

  // for deleting post image after post and comments deletion from db
  const postImageUrl = post?.image;

  // ---- deleteing post and comments from db ------------
  const session = await startSession();
  session.startTransaction();
  try {
    // deleting post comments (if exists)
    if (commentIds.length) {
      const deletedComment = await Comment.deleteMany(
        { _id: { $in: commentIds } },
        { session }
      );
      console.log(`log> Deleted ${deletedComment.deletedCount} comments`);

      // Remove comments from their owners(Users)
      const updatedUsers = await User.updateMany(
        { comments: { $in: commentIds } },
        { $pull: { comments: { $in: commentIds } } },
        { session }
      );
      console.log(
        `log> Updated ${updatedUsers.modifiedCount} users (removed comments)`
      );
    }

    // deleting post
    const deletedPost = await post.deleteOne({ session });
    console.log("log> Deleted post:", deletedPost);

    // Remove post reference from Forum and User(creator)
    const updatedForum = await Forum.updateOne(
      { _id: post.forum },
      { $pull: { posts: post._id } },
      { session }
    );
    // console.log("log> updatedForum:", updatedForum);
    const updatedUser = await User.updateOne(
      { _id: post.creator },
      { $pull: { createdPosts: post._id } },
      { session }
    );
    // console.log("log> updatedUser:", updatedUser);

    // Note: add post and comments images deletion from cloudinary code here if you want true atomicity (DB + Cloudinary must stay in sync)

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    const error = new ApiError(
      `Something went wrong! could not delete post from db.\nError: ${err.message}`,
      500
    );
    console.log(error.message);
    return next(error);
  } finally {
    session.endSession();
  }
  // ------------------------------

  // ---- Delete post and comment images (if exists) from cloudinary  ----
  try {
    if (postImageUrl) {
      const result = await deleteFromCloudinary(postImageUrl);
      console.log("log> Successfully deleted post image from cloudinary");
    }
    if (commentImageUrls.length) {
      const result = await Promise.all(
        commentImageUrls.map((imgUrl) => deleteFromCloudinary(imgUrl))
      );
      console.log("log> Successfully deleted comment images from cloudinary");
    }
  } catch (err) {
    const error = new ApiError(
      `Something went wrong while deleteFromCloudinary(), could not delete images.\nError: ${err} - posts.controller.js - deletePost()`,
      400
    );
    console.log(`log> Error: ${error.message}`);
    return next(error);
  }
  // ------------------------------

  res.status(200).json({
    deletion: {
      message: `Deleted post with id: ${postId} and creator: ${userId}`,
    },
  });
};

{
  // const deletePost_old = async (req, res, next) => {
  //   console.log("DELETE req in `/posts/:postId`");
  //   const postId = req.params.postId;
  //   // const userId = req.userData.userId;
  //   const { userId } = req.body;
  //   let post;
  //   try {
  //     post = await Post.findById(postId)
  //       .populate("comments")
  //       .populate("forum")
  //       .populate("creator");
  //     console.log("log> post:-");
  //     console.log(post);
  //   } catch (err) {
  //     const error = new ApiError(
  //       `Something went wrong! could not get post for deletion.\nError: ${err}`,
  //       500
  //     );
  //     console.log(
  //       `Something went wrong! could not get post for deletion.\nError: ${err}`
  //     );
  //     return next(error);
  //   }
  //   if (!post) {
  //     const error = new ApiError(
  //       `Could not find a post with the provided post id for deletion process`,
  //       422
  //     );
  //     console.log(`log> Error: ${error.message}`);
  //     return next(error);
  //   }
  //   if (post.creator.id !== userId) {
  //     const error = new ApiError(
  //       "Forbidden! You are not allowed to delete this post as you are not the owner/creator of this post - post.controller.js - deletePost()",
  //       403
  //     );
  //     console.log(`log> Error: ${error.message}`);
  //     return next(error);
  //   }
  //   // ---- deleting post comments ----
  //   let commentIds = [];
  //   for (let i = 0; i < post.comments.length; i++) {
  //     commentIds.push(post.comments[i].id);
  //   }
  //   let comments = [];
  //   try {
  //     for (let i = 0; i < commentIds.length; i++) {
  //       const comment = await Comment.findById(commentIds[i]).populate("owner");
  //       comments.push(comment);
  //     }
  //   } catch (err) {
  //     const error = new ApiError(
  //       `Something went wrong! could not get post comments for deletion\nError: ${err}`,
  //       500
  //     );
  //     console.log(`log> Error: ${error.message}`);
  //     return next(error);
  //   }
  //   // avoid below code in this controller function
  //   // if (!comments.length) {
  //   //   const error = new ApiError(
  //   //     `comments array for deletion is empty - posts.controller.js - deletePost()`,
  //   //     500
  //   //   );
  //   //   console.log(`log> Error: ${error.message}`);
  //   //   return next(error);
  //   // }
  //   // for deleting comment images from cloudniary after deleting comments from db
  //   let commentImageUrls = [];
  //   for (let i = 0; i < comments.length; i++) {
  //     if (comments[i].image) commentImageUrls.push(comments[i].image);
  //   }
  //   let result;
  //   let session = await startSession();
  //   session.startTransaction();
  //   try {
  //     for (let i = 0; i < comments.length; i++) {
  //       result = await comments[i].deleteOne({ session });
  //       comments[i].owner.comments.pull(comments[i]);
  //       result = await comments[i].owner.save({ session });
  //     }
  //     await session.commitTransaction();
  //   } catch (err) {
  //     await session.abortTransaction();
  //     const error = new ApiError(
  //       `Something went wrong! could not delete post comments\nError: ${err}`,
  //       500
  //     );
  //     console.log(`log> Error: ${error.message}`);
  //     return next(error);
  //   } finally {
  //     session.endSession();
  //   }
  //   // deleting post comments images from cloudinary after post comments got deleted from db
  //   {
  //     // try {
  //     //   for (let i = 0; i < commentImageUrls.length; i++) {
  //     //     const result = await deleteFromCloudinary(commentImageUrls[i]);
  //     //     console.log(
  //     //       "log> posts.controller.js -> deletePost() -> deleteFromCloudinary() -> result:-"
  //     //     );
  //     //     console.log(result);
  //     //   }
  //     // } catch (err) {
  //     //   const error = new ApiError(
  //     //     `Something went wrong while deleteFromCloudinary()! could not delete post comments images \nError: ${err} - posts.controller.js - deletePost()`,
  //     //     400
  //     //   );
  //     //   console.log(`log> Error: ${error.message}`);
  //     //   return next(error);
  //     // }
  //   }
  //   // -------------------------------
  //   // For deleteing post image from cloudinary after deleting post from db
  //   let imageUrl = post?.image;
  //   // ---- deleteing post from db, forum and user(creator) ----
  //   result = null;
  //   session = await startSession();
  //   session.startTransaction();
  //   try {
  //     result = await post.deleteOne({ session });
  //     post.forum.posts.pull(post);
  //     post.creator.createdPosts.pull(post);
  //     result = await post.forum.save({ session });
  //     result = await post.creator.save({ session });
  //     // console.log("log> result:-"); // console.log(result);
  //     await session.commitTransaction();
  //   } catch (err) {
  //     await session.abortTransaction();
  //     const error = new ApiError(
  //       `Something went wrong! could not delete post from db.\nError: ${err.message}`,
  //       500
  //     );
  //     console.log(
  //       `log> Something went wrong! could not delete post from db.\nlog> Error: ${err.message}`
  //     );
  //     return next(error);
  //   } finally {
  //     session.endSession();
  //   }
  //   // -------------------------------
  //   // deleting post image from cloudinary after post got deleted from db
  //   {
  //     // if (imageUrl) {
  //     //   try {
  //     //     const result = await deleteFromCloudinary(imageUrl);
  //     //     console.log(
  //     //       "log> post.controller.js -> deletePost() -> deleteFromCloudinary() -> result:- "
  //     //     );
  //     //     console.log(result);
  //     //   } catch (err) {
  //     //     const error = new ApiError(
  //     //       `Something went wrong while deleteFromCloudinary(), could not delete post image \nError: ${err} - post.controller.js - deletePost()`,
  //     //       400
  //     //     );
  //     //     console.log(`log> Error ${error.message}`);
  //     //     return next(error);
  //     //   }
  //     // }
  //   }
  //   res.status(200).json({
  //     deletion: {
  //       message: `Deleted post with id: ${postId} and creator: ${userId}`,
  //     },
  //   });
  // };
}

export {
  getAllPosts,
  getPostByPostId,
  getForumPostsByForumId,
  createPost,
  getUserCreatedPosts,
  editPostTexts,
  editPostImage,
  deletePost,
};
