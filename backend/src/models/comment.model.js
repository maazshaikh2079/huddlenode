import mongoose, { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { ApiError } from "../utils/ApiError.js";

const commentSchema = new Schema(
  {
    text: {
      type: String,
      trim: true,
    },
    image: {
      type: String, // cloudinary url
      trim: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "mixed"],
      required: true,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.plugin(mongooseAggregatePaginate);

// Note: Commented as same validation logic is written in `createComment()` - `comments.controller.js`
// Custom validation: require at least one of `content` or `image`
// commentSchema.pre("validate", function (next) {
//   if (!this.content && !this.image) {
//     const error = new ApiError("Comment must have either text or image - comment.model.js");
//     console.log(`log> Error: ${error.message}`);
//     return next(error);
//   }
//   next();
// });

export const Comment = model("Comment", commentSchema);
