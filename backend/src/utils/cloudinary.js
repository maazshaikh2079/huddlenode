/**
 * NOTE: This file is optimized for Vercel's Serverless environment.
 * Strategy: Memory Storage (Buffers).
 * * Reason: Vercel uses a Read-Only and Stateless file system, which prevents
 * saving temporary files to a local 'uploads' directory. This version uploads
 * image data directly from memory (RAM) to Cloudinary to avoid ENOENT errors.
 */

import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "./ApiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * @description Uploads a file buffer directly to Cloudinary (Serverless Compatible)
 * @param {Buffer} fileBuffer - The file data from req.file.buffer
 */
const uploadOnCloudinary = async (fileBuffer) => {
  if (!fileBuffer) {
    throw new ApiError("No file buffer provided for upload.", 400);
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) {
          console.error("log> Cloudinary Upload Error:", error);
          return reject(
            new ApiError(`Cloudinary upload failed: ${error.message}`, 500)
          );
        }
        console.log(
          "log> Image uploaded to Cloudinary successfully:",
          result.secure_url
        );
        resolve(result);
      }
    );

    // Write the buffer to the stream
    uploadStream.end(fileBuffer);
  });
};

const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl) {
    throw new ApiError("No imageUrl provided for delete.", 400);
  }

  try {
    let imageUrlArray = imageUrl.split("/");
    let imageFilename = imageUrlArray[imageUrlArray.length - 1]; // "tklrxe042qhb5kmu1n9n.jpg"
    const imageId = imageFilename.split(".")[0]; // "tklrxe042qhb5kmu1n9n"
    console.log("imageId:", imageId);

    if (!imageId) {
      throw new ApiError("Could not extract public imageId from URL", 400);
    }

    const response = await cloudinary.uploader.destroy(imageId);
    console.log("log> Cloudinary image deleted:", response);
    return response;
  } catch (err) {
    console.error("log> Cloudinary Delete Error:", err.message);
    throw new ApiError(`Failed to delete image: ${err.message}`, 500);
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
