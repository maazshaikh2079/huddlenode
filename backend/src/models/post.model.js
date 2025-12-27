import mongoose, { Schema, model } from "mongoose";

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    content: {
      type: String,
      // required: true,
      trim: true,
    },
    image: {
      type: String, // cloudinary url
      //   required: true,
      trim: true,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    forum: {
      type: Schema.Types.ObjectId,
      ref: "Forum",
      required: true,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    // timestamp: {
    //   type: Date,
    //   default: Date.now,
    // },
  },
  {
    timestamps: true,
  }
);

export const Post = model("Post", postSchema);
