/**
 * NOTE: This middleware is optimized for Vercel's Serverless environment.
 * Strategy: Memory Storage (Buffers).
 * * Reason: Vercel uses a Read-Only and Stateless file system, which prevents
 * saving temporary files to a local 'uploads' directory. This version provides
 * the file as 'req.file.buffer', allowing 'cloudinary.js' to stream the data
 * directly to the cloud and avoid 'ENOENT' errors.
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
