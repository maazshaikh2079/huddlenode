import mongoose, { Schema, model } from "mongoose";

const forumSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      // index: true,
    },
    coverImage: {
      type: String, // cloudinary url
      required: true,
      trim: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
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

export const Forum = model("Forum", forumSchema);
// Note: above code line will create `forums` collection in `forums_db` database
