import validator, { validationResult } from "express-validator";
import mongoose, { startSession } from "mongoose";

import { Forum } from "../models/forum.model.js";
import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";

import { ApiError } from "../utils/ApiError.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
// } from "../utils/cloudinary-local.js";

const getAllForums = async (req, res, next) => {
  console.log("log> GET req in `/forums`");

  let allForums;
  try {
    allForums = await Forum.find().exec();
    console.log("log> allForums :-");
    console.log(allForums);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong! could not get forums. Error: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not get forums.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!allForums) {
    const error = new ApiError("Could not get forums", 404);
    console.log("log> Error: Could not get forums");
    return next(error);
  }

  res.json({
    forums: allForums.map((forum) => forum.toObject({ getters: true })),
  });
};

const getForumByForumId = async (req, res, next) => {
  console.log("log> GET req in `/forums/:forumId`");

  const forumId = req.params.forumId;

  let forum;
  try {
    forum = await Forum.findById(forumId);
    console.log("log> forum:-");
    console.log(forum);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong! could not find forum by forumId.\nError: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not find forum by forumId.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!forum) {
    const error = new ApiError(
      "Could not find a forum with the provided forum id.",
      422
    );
    console.log(`log> Error: ${error.message}`);
    return next(error);
  }

  res.status(201).json({ forum: forum.toObject({ getters: true }) });
};

const createForum = async (req, res, next) => {
  console.log("log> POST req in `/forums`");

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

  // const { title, description, coverImage, userId } = req.body;
  const { title, description } = req.body;
  const userId = req.userData.userId;

  // uploading cover image on cloudinary to get image url before saving it in db ->
  // let coverImageLocalPath = req.file?.path; // for local storage i.e `uploads` directory
  let coverImageBuffer = req.file?.buffer; // for memory storage, here vercel
  let coverImageUrl;

  // if (coverImageLocalPath) {
  if (coverImageBuffer) {
    try {
      // const coverImageRes = await uploadOnCloudinary(coverImageLocalPath);
      const coverImageRes = await uploadOnCloudinary(coverImageBuffer);
      // console.log("log> coverImageRes:-\n", coverImageRes);
      if (coverImageRes?.secure_url) coverImageUrl = coverImageRes.secure_url;
    } catch (err) {
      const error = new ApiError(
        `Something went wrong! could not upload coverImage to cloudinary\nError: ${err} - forums.controller.js - createForums()`,
        400
      );
      console.log(`log> Error: ${error.message}`);
      return next(error);
    }
  }

  const newForum = new Forum({
    title,
    description,
    coverImage:
      coverImageUrl ||
      "https://i.ibb.co/nqyC2z7B/default-image-placeholder.webp",
    // coverImage:
    //   coverImage || "https://i.ibb.co/nqyC2z7B/default-image-placeholder.webp",
    creator: userId,
  });

  let user;
  try {
    user = await User.findById(userId);
    // console.log("log> user:-"); console.log(user);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong while 'User.findById(userId)' Error: ${err} - forums.controller.js - createForum()`,
      500
    );
    console.log(
      `log> Something went wrong while 'User.findById(userId)'\nlog>Error: ${err} - forums.controller.js - createForum()`
    );
    if (coverImageUrl) await deleteFromCloudinary(coverImageUrl);
    return next(error);
  }

  if (!user) {
    const error = new ApiError(
      `User with id: ${userId} does not exist in \`users\` collection of db - forums.controller.js - createForum()`,
      401
    );
    console.log(`log> Error: ${error.message}`);
    if (coverImageUrl) await deleteFromCloudinary(coverImageUrl);
    return next(error);
  }

  let result;
  let session = await startSession();
  session.startTransaction();
  try {
    result = await newForum.save({ session });
    user.createdForums.push(newForum);
    result = await user.save({ session });
    // console.log("log> result:-"); console.log(result);
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    const error = new ApiError(`Could not create a forum! Error: ${err}`, 500);
    console.log(`log> Could not create a forum!\nlog> Error: ${err}`);
    if (coverImageUrl) await deleteFromCloudinary(coverImageUrl);
    return next(error);
  } finally {
    session.endSession();
  }

  res.status(201).json({
    creation: { forum: newForum.toObject({ getters: true }), result },
  });
};

const getUserForumsByUserId = async (req, res, next) => {
  console.log("log> GET req in `/forums/user`");

  const userId = req.userData.userId;
  // const { userId } = req.body;

  let userForums;
  try {
    userForums = await Forum.find({ creator: userId });
    console.log("log> userForums:-");
    console.log(userForums);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong! could not get user forums. Error: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not get user forums.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!userForums) {
    const error = new ApiError(
      "Could not find user forums for the provided user id.",
      404
    );
    return next(error);
  }

  res.json({
    userId,
    userForums: userForums.map((forum) => forum.toObject({ getters: true })),
  });
};

const editForumTexts = async (req, res, next) => {
  console.log("PATCH req in `/forums/:forumId/edit/texts`");

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log("log> Errors:-");
    console.log(errors);
    throw new ApiError("Invalid inputs passed, please check your data.", 422);
  }

  const forumId = req.params.forumId;
  const userId = req.userData.userId;
  const { title, description } = req.body;
  // const { title, description, userId } = req.body;

  let forum;
  try {
    forum = await Forum.findById(forumId);
    console.log("log> forum:-");
    console.log(forum);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong! could not find forum for updation.\nError: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not find frorum for updation.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!forum) {
    const error = new ApiError(
      "Could not find a forum with the provided forum id for updation process.",
      422
    );
    console.log(`log> Error: ${error.message}`);
    return next(error);
  }

  if (forum.creator.toString() !== userId) {
    const error = new ApiError(
      "Forbidden! You are not allowed to edit/update this forum as you are not the creator of this forum - forums.controller.js - editForumTexts()",
      403
    );
    console.log(`log> Error: ${error.message}`);
    return next(error);
  }

  forum.title = title;
  forum.description = description;

  console.log("log> updated `forum`:-");
  console.log(forum);

  let result;
  try {
    result = await forum.save();
    console.log("log> result:-");
    console.log(result);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong! could not save updated forum.\nError: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not save updated forum.\nlog> Error: ${err}`
    );
    return next(error);
  }

  res
    .status(201)
    .json({ updation: { forum: forum.toObject({ getters: true }), result } });
};

const editForumCoverImage = async (req, res, next) => {
  console.log("PATCH req in `/forums/:forumId/edit/cover-image`");

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

  const forumId = req.params.forumId;
  const userId = req.userData.userId;
  // const { coverImage, userId } = req.body;

  let forum;
  try {
    forum = await Forum.findById(forumId);
    console.log("log> forum:-");
    console.log(forum);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong! could not find forum for updation.\nError: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not find forum for updation.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!forum) {
    const error = new ApiError(
      "Could not find a forum with the provided forum id for updation process.",
      422
    );
    console.log(`log> Error: ${error.message}`);
    return next(error);
  }

  if (forum.creator.toString() !== userId) {
    const error = new ApiError(
      "Forbidden! You are not allowed to edit/update this forum as you are not the creator of this forum - forums.controller.js - editForumCoverImage()",
      403
    );
    console.log(`log> Error: ${error.message}`);
    return next(error);
  }

  // uploading cover image on cloudinary to get cover image url before saving it in db ->
  // let coverImageLocalPath = req.file?.path; // for local storage i.e `uploads` directory
  let coverImageBuffer = req.file?.buffer; // for memory storage, here vercel
  // if (!coverImageLocalPath) {
  if (!coverImageBuffer) {
    const error = new ApiError(
      // "coverImage file is missing locally! - forums.controller.js - editForumCoverImage()",
      "coverImage file buffer is not present in memory! - forums.controller.js - editForumCoverImage()",
      400
    );
    console.log("log> Error: ", error.message);
    return next(error);
  }

  // Handle Cloudinary Upload, URL formatting, DB Saving, and Cloudinary Deletion in one block
  try {
    // Uploading new pfp on cloudinary
    // const newCoverImageRes = await uploadOnCloudinary(coverImageLocalPath);
    const newCoverImageRes = await uploadOnCloudinary(coverImageBuffer);
    console.log("log> newCoverImageRes:-");
    console.log(newCoverImageRes);

    if (!newCoverImageRes || !newCoverImageRes.secure_url) {
      const error = new ApiError(
        "`newCoverImageRes` or `newCoverImageRes.secure_url` is not present on cloudinary - forums.controller.js - editForumCoverImage()"
      );
      console.log("log> Error:", error.message);
      return next(error);
    }

    const prevCoverImageUrl = forum.coverImage;
    forum.coverImage = newCoverImageRes.secure_url;

    console.log("log> updated `forum`:-");
    console.log(forum);

    // Saving modifications in db
    const result = await forum.save();
    console.log("log> result:-");
    console.log(result);

    // Deleting prev coverImage from cloudinary (Background Task)
    // Only delete if it's not the default-image-placeholder URL
    if (
      prevCoverImageUrl &&
      !prevCoverImageUrl.includes("default-image-placeholder")
    ) {
      deleteFromCloudinary(prevCoverImageUrl)
        .then((deleteResult) => {
          console.log(
            "log> forums.controller.js - editForumCoverImage() - deleteFromCloudinary() - deleteResult:-"
          );
          console.log(deleteResult);
        })
        .catch((err) => {
          const error = new ApiError(
            `Could not delete old coverImage from Cloudinary. Error: ${err}`
          );
          console.log("log> Error:", error.message);
          return next(error);
        });
    }

    // Successful Response
    return res.status(201).json({
      updation: {
        forum: forum.toObject({ getters: true }),
        result,
      },
    });
  } catch (err) {
    const error = new ApiError(
      `Something went wrong during the update process! Error: ${err.message} - forums.controller.js - editForumCoverImage()`,
      400
    );
    console.log(`log> Error: ${error.message}`);
    return next(error);
  }
};

const deleteForum = async (req, res, next) => {
  console.log("DELETE req in `/forums/:forumId`");

  const forumId = req.params.forumId;
  const userId = req.userData.userId;
  // const { userId } = req.body;

  // ----------- find forum -----------
  let forum;
  try {
    forum = await Forum.findById(forumId).populate("posts");
    console.log("log> forum:-");
    console.log(forum);
  } catch (err) {
    const error = new ApiError(
      `Something went wrong! could not get forum for deletion.\nError: ${err}`,
      500
    );
    console.log(`log> Error: ${error.message}`);
    return next(error);
  }

  if (!forum) {
    const error = new ApiError(
      `Could not find a forum with the provided forum id for deletion process`,
      422
    );
    console.log(`log> Error: ${error.message}`);
    return next(error);
  }

  if (forum.creator.toString() !== userId) {
    const error = new ApiError(
      `Forbidden! you are not allowed to delete this forum as you are not the owner/creator.`,
      403
    );
    console.log(`log> Error: ${error.message}`);
    return next(error);
  }
  // ----------------------

  // for deleting forum posts
  const postIds = forum.posts.map((post) => post._id);

  // for deleting forum posts images after forum, posts and comments deletion from db
  const postImageUrls = forum.posts
    .filter((post) => post.image) // here post.image is condition
    .map((post) => post.image); // here post.image is return value

  // for getting and deleting forum posts comments
  const commentIds = forum.posts.flatMap((post) => post.comments); // here post.comments is return value (i.e. [objId, ...])

  let comments = [];
  try {
    comments = await Comment.find({ _id: { $in: commentIds } });
  } catch (err) {
    const error = new ApiError(
      `Something went wrong! could not get forum posts comments for deletion\nError: ${err}`,
      500
    );
    console.log(`log> Error: ${error.message}`);

    return next(error);
  }

  // for deleting forum posts comments images after forum, posts and comments deletion from db
  const commentImageUrls = comments
    .filter((comment) => comment.image) // here comment.image is condition
    .map((comment) => comment.image); // here comment.image is return value

  // for deleting forum cover-images after forum, posts and comments deletion from db
  const forumCoverImageUrl =
    forum.coverImage !==
    "https://i.ibb.co/nqyC2z7B/default-image-placeholder.webp"
      ? forum.coverImage
      : null;

  // --------- deleting forum, posts and comments from db ------------
  let session = await startSession();
  session.startTransaction();
  try {
    // delete comments + unlink from owners
    await Comment.deleteMany({ _id: { $in: commentIds } }, { session });
    await User.updateMany(
      { comments: { $in: commentIds } },
      { $pull: { comments: { $in: commentIds } } },
      { session }
    );

    // delete posts + unlink from creators
    await Post.deleteMany({ _id: { $in: postIds } }, { session });
    await User.updateMany(
      { createdPosts: { $in: postIds } },
      { $pull: { createdPosts: { $in: postIds } } },
      { session }
    );

    // delete forum + unlink from creator
    await Forum.deleteOne({ _id: forum._id }, { session });
    await User.updateOne(
      { _id: forum.creator },
      { $pull: { createdForums: forum._id } },
      { session }
    );

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    const error = new ApiError(
      `Something went wrong! could not delete forum.\nError: ${err}`,
      500
    );
    console.log(`log> Error: ${error.message}`);

    return next(error);
  } finally {
    session.endSession();
  }
  // ---------------------------

  // ------- deleting images from cloudinary -------
  try {
    const imgUrls = [
      ...commentImageUrls,
      ...postImageUrls,
      forumCoverImageUrl,
    ].filter(Boolean); // `.filter(Boolean)` removes all falsy values from the array
    if (imgUrls.length) {
      await Promise.all(
        imgUrls.map(async (imgUrl) => {
          await deleteFromCloudinary(imgUrl);
        })
      );
      console.log("log> All Cloudinary deletions completed");
    }
  } catch (err) {
    const error = new ApiError(
      `Cloudinary deletion failed\nError: ${err} - forums.controller.js - deleteForum`,
      500
    );
    console.log(`log> Error: ${error.message}`);
    return next(error);
  }

  res.status(200).json({
    deletion: {
      message: `Deleted forum with id: ${forumId} and creator: ${userId}`,
    },
  });
};

{
  // const deleteForum_old = async (req, res, next) => {
  //   console.log("DELETE req in `/forums/:forumId`");
  //   const forumId = req.params.forumId;
  //   // const userId = req.userData.userId;
  //   const { userId } = req.body;
  //   let forum;
  //   try {
  //     forum = Forum.findById(forumId).populate("creator").populate("posts");
  //     console.log("log> forum:-");
  //     console.log(forum);
  //   } catch (err) {
  //     const error = new ApiError(
  //       `Something went wrong! could not get forum for deletion.\nError: ${err}`,
  //       500
  //     );
  //     console.log(
  //       "log> Something went wrong! could not get forum for deletion.\nlog> Error: ${err}"
  //     );
  //     return next(error);
  //   }
  //   if (!forum) {
  //     const error = new ApiError(
  //       `Could not find a forum with the provided forum id for deletion process`,
  //       422
  //     );
  //     console.log(`log> Error: ${error.message}`);
  //     return next(error);
  //   }
  //   if (forum.creator.id !== userId) {
  //     const error = new ApiError(
  //       `Forbidden! you are not allowed to delete this forum as you are not the owner/creator of this forum - fourms.controller.js - deleteForum()`,
  //       403
  //     );
  //     console.log(`log> Error: ${error.message}`);
  //     return next(error);
  //   }
  //   // ----- deleting forum posts and forum posts comments -----
  //   let postIds = [];
  //   for (let i = 0; i < forum.posts.length; i++) {
  //     postIds.push(forum.posts[i].id);
  //   }
  //   let posts = [];
  //   try {
  //     for (let i = 0; i < postIds.length; i++) {
  //       const post = await Post.findById(postIds[i])
  //         .populate("creator")
  //         .populate("comments");
  //       posts.push(post);
  //     }
  //   } catch (err) {
  //     const error = new ApiError(
  //       `Something went wrong! could not get forum posts for deletion\nError: ${err}`,
  //       401
  //     );
  //     console.log(`log> Error: ${error.message}`);
  //     return next(error);
  //   }
  //   let postImageUrls = [];
  //   for (let i = 0; i < posts.length; i++) {
  //     if (posts[i].image) postImageUrls.push(posts[i].image);
  //   }
  //   // ----- deleting forum posts comments -----
  //   let commentIds = [];
  //   // i -> post iterator
  //   for (let i = 0; i < posts.length; i++) {
  //     // j -> post comment iterator
  //     for (let j = 0; j < posts[i].comments.length; j++) {
  //       commentIds.push(posts[i].comments[j].id);
  //     }
  //   }
  //   let comments = [];
  //   try {
  //     for (let i = 0; i < commentIds.length; i++) {
  //       const comment = await Comment.findById(commentIds[i]).populate("owner");
  //       comments.push(comment);
  //     }
  //   } catch (err) {
  //     const error = new ApiError(
  //       `Something went wrong! could not get forum posts comments for deletion\nError: ${err}`,
  //       401
  //     );
  //     console.log(`log> Error: ${error.message}`);
  //     return next(error);
  //   }
  //   // for deleting comment images from cloudniary after deleting comments from db
  //   let commentImageUrls = [];
  //   for (let i = 0; i < comments.length; i++) {
  //     commentImageUrls.push(comments[i].image);
  //   }
  //   let result;
  //   let session = await startSession();
  //   session.startTransition();
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
  //       `Something went wrong! could not delete forum posts comments\nError: ${err}`,
  //       401
  //     );
  //     console.log(`log> Error: ${error.message}`);
  //     return next(error);
  //   } finally {
  //     session.endSession();
  //   }
  //   // deleting forum posts comments images from cloudinary after forum posts comments got deleted from db
  //   {
  //     // try {
  //     //   for (let i = 0; i < commentImageUrls.length; i++) {
  //     //     const result = await deleteFromCloudinary(commentImageUrls[i]);
  //     //     console.log(
  //     //       "log> forums.controller.js -> deleteForum() -> deleteFromCloudinary() -> result:-"
  //     //     );
  //     //     console.log(result);
  //     //   }
  //     // } catch (err) {
  //     //   const error = new ApiError(
  //     //     `Something went wrong while deleteFromCloudinary()! could not delete fourum posts comments images \nError: ${err} - fourms.controller.js - deleteForum()`,
  //     //     400
  //     //   );
  //     //   console.log(`log> Error: ${error.message}`);
  //     //   return next(error);
  //     // }
  //   }
  //   // -------------------------
  //   result = null;
  //   session = await startSession();
  //   session.startTransaction();
  //   try {
  //     for (let i = 0; i < posts.length; i++) {
  //       result = await posts[i].deleteOne({ session });
  //       posts[i].creator.posts.pull(posts[i]);
  //       result = await posts[i].creator.save({ session });
  //       // console.log("log> result:-"); // console.log(result);
  //     }
  //     await session.commitTransaction();
  //   } catch (err) {
  //     await session.abortTransaction();
  //     const error = new ApiError(
  //       `Something went wrong! could not delete forum posts\nError: ${err}`,
  //       401
  //     );
  //     console.log(`log> Error: ${error.message}`);
  //     return next(error);
  //   } finally {
  //     session.endSession();
  //   }
  //   // deleting forum posts images from cloudinary after forum posts got deleted from db
  //   {
  //     // try {
  //     //   for (let i = 0; i < postImageUrls.length; i++) {
  //     //     const result = await deleteFromCloudinary(postImageUrls[i]);
  //     //     console.log(
  //     //       "log> forums.controller.js -> deleteForum() -> deleteFromCloudinary() -> result:-"
  //     //     );
  //     //     console.log(result);
  //     //   }
  //     // } catch (err) {
  //     //   const error = new ApiError(
  //     //     `Something went wrong while deleteFromCloudinary(), could not delete forum posts images\nError: ${err} - forums.controller.js - deleteForum()`,
  //     //     400
  //     //   );
  //     //   console.log(`log> Error: ${error.message}`);
  //     //   return next(error);
  //     // }
  //   }
  //   // ------------------------------
  //   // For deleteing post image from cloudinary after deleting post from db
  //   let coverImageUrl = forum?.coverImage;
  //   // ---- deleteing forum from db and user(creator) ----
  //   result = null;
  //   session = await startSession();
  //   session.startTransaction();
  //   try {
  //     result = await forum.deleteOne({ session });
  //     forum.creator.createdForums.pull(forum);
  //     result = await forum.creator.save({ session });
  //     // console.log("log> result:-"); // console.log(result);
  //     await session.commitTransaction();
  //   } catch (err) {
  //     await session.abortTransaction();
  //     const error = new ApiError(
  //       `Something went wrong! could not delete forum from db.\nError: ${err.message}`,
  //       401
  //     );
  //     console.log(
  //       `log> Something went wrong! could not delete forum from db.\nlog> Error: ${err.message}`
  //     );
  //     return next(error);
  //   } finally {
  //     session.endSession();
  //   }
  //   // -------------------------------
  //   // deleting forum cover-image from cloudinary after forum got deleted from db
  //   {
  //     // if (coverImageUrl) {
  //     //   try {
  //     //     const result = await deleteFromCloudinary(imageUrl);
  //     //     console.log(
  //     //       "log> forum.controller.js -> deleteForum() -> deleteFromCloudinary() -> result:- "
  //     //     );
  //     //     console.log(result);
  //     //   } catch (err) {
  //     //     const error = new ApiError(
  //     //       `Something went wrong while deleteFromCloudinary(), could not delete forum cover-image \nError: ${err} - forum.controller.js - deleteForum()`,
  //     //       400
  //     //     );
  //     //     console.log(`log> Error ${error.message}`);
  //     //     return next(error);
  //     //   }
  //     // }
  //   }
  //   res.status(200).json({
  //     deleteion: {
  //       message: `Deleted forum with id: ${forumId} and creator: ${userId}`,
  //     },
  //   });
  // };
}

export {
  getAllForums,
  getForumByForumId,
  createForum,
  getUserForumsByUserId,
  editForumTexts,
  editForumCoverImage,
  deleteForum,
};
