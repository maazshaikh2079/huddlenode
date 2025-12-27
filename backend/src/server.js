import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";

import express from "express";
import mongoose from "mongoose";

import { ApiError } from "./utils/ApiError.js";

const app = express();

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins

  // const allowedOrigins = [
  //   "http://localhost:5173",
  //   "https://your-frontend-link.vercel.app",
  // ];
  // const origin = req.headers.origin;
  // if (allowedOrigins.includes(origin)) {
  //   res.setHeader("Access-Control-Allow-Origin", origin);
  // } else {
  //   res.setHeader("Access-Control-Allow-Origin", "*");
  // }

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // For preflight requests (OPTIONS), return OK
  if (req.method === "OPTIONS") return res.sendStatus(200);

  next();
});

// Serve static files
// app.use("/uploads/images", express.static(path.join("uploads", "images")));

// Test route
app.get("/", (_, res) => res.send("<h1>Server started</h1>"));

// routes import
import userRouter from "./routes/users.routes.js";
import forumRouter from "./routes/forums.routes.js";
import postRouter from "./routes/posts.routes.js";
import commentRouter from "./routes/comments.routes.js";

// routes declaration in middleware `use`
app.use("/api/users", userRouter);
app.use("/api/forums", forumRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);

// Error handling:-

// Error handler for Unsupported Routes (Route not found handler)
app.use((req, res, next) => {
  const error = new ApiError("Could not find this route.", 404);
  // throw error;
  return next(error);
});

// General error handler
app.use((error, req, res, next) => {
  console.log("log> app.js - error:-");
  console.error(error); // log for debugging

  // Note: Below `if` block will delete image file from `uploads/images` folder, if request carries image file (i.e req.file) and image file is present in `uploads/images` folder
  if (req.file && fs.existsSync(req.file.path)) {
    fs.unlink(req.file.path, (err) => {
      console.log("log> app.js - file delete err:-");
      console.log(err);
    });
  }

  if (res.headersSent) {
    return next(error);
  }

  // Ensure error.code is numeric; fallback to 500
  const status = typeof error.code === "number" ? error.code : 500;

  res.status(status).json({
    message:
      error.message ||
      "Something went wrong! An unknown error occurred - app.js",
  });
});

// mongoose
//   .connect(
//     `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.g9wuk9q.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`
//   )
//   .then(() =>
//     app.listen(process.env.PORT || 5000, () => {
//       console.log("log> Connected to database!");
//       console.log(`log> app listening on PORT:${process.env.PORT || 5000}`);
//     })
//   )
//   .catch((error) => {
//     console.log("log> MongoDB connection FAILED!!!");
//     console.log("log> Error:-");
//     console.error(error);
//   });

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    console.log("log> Attempting to connect to MongoDB..."); // Add this
    const db = await mongoose.connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.g9wuk9q.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`
      // { useNewUrlParser: true, useUnifiedTopology: true }
    );
    // 1 = connected, 2 = connecting
    isConnected = db.connections[0].readyState === 1;
    console.log("log> Successfully connected to MongoDB!");
  } catch (error) {
    console.log("log> MongoDB connection FAILED!!!");
    console.error(error);
  }
}

// Ensure DB is connected before any route logic runs
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Vercel handles the "listening" part automatically.
// We only call app.listen() if we are NOT on Vercel (local dev).
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`log> Local server running on PORT:${PORT}`);
  });
}

export default app;
