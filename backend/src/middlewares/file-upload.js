/**
 * NOTE: This middleware is optimized for Vercel's Serverless environment.
 * Strategy: Memory Storage.
 * * Reason: Vercel's file system is Read-Only. Using 'multer.memoryStorage()'
 * allows us to receive the file as a Buffer (req.file.buffer) which is then
 * streamed directly to Cloudinary, avoiding 'ENOENT' directory errors.
 */

import multer from "multer";

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

export const fileUpload = multer({
  limits: {
    fileSize: 500000, // 500 KB limit
  },
  // Switch to memoryStorage for Vercel/Serverless compatibility
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("Invalid mime type!");
    cb(error, isValid);
  },
});
