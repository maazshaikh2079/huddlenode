import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";

import express from "express";
import mongoose from "mongoose";

import { ApiError } from "./utils/ApiError.js";

// Disable buffering so queries fail fast if DB isn't connected
mongoose.set("bufferCommands", false);

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

// Database Connection Logic
// Optimized for Vercel Serverless and Local Dev
let isConnected = false;
async function connectDB() {
  if (isConnected) return; // Skip if already connected

  const dbUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.g9wuk9q.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

  try {
    const db = await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    // Connection states: 0 = disconnected, 1 = connected
    isConnected = db.connections[0].readyState === 1;
    console.log("log> MongoDB Connected Successfully");
  } catch (error) {
    console.error("log> MongoDB Connection Error:", error.message);
    throw error;
  }
}

// Global Middleware to ensure DB is connected before processing requests
// Essential for Vercel serverless cold-starts.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res
      .status(503)
      .json({ message: `Database connection failed. Error: ${err.message}` });
  }
});

// BASIC route
app.get("/", (_, res) => res.send("<h1>Server started</h1>"));
app.get("/favicon.ico", (req, res) => res.status(204).end());

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

// Local Listener
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  mongoose
    .connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.g9wuk9q.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`
    )
    .then(() =>
      app.listen(PORT, () => {
        console.log(`log> Local server running on PORT:${PORT}`);
        console.log(`log> Health Check: http://localhost:${PORT}/`);
      })
    )
    .catch((error) => {
      console.log("log> MongoDB connection FAILED!!!");
      console.log("log> Error:-");
      console.error(error);
    });
}

// Error handling:-

// Error handler for Unsupported Routes (Route not found handler)
app.use((req, res, next) => {
  const error = new ApiError("Could not find this route.", 404);
  // throw error;
  return next(error);
});

// General error handler
app.use((error, req, res, next) => {
  console.log("log> server.js - error:-");
  console.error(error); // log for debugging

  // Note: Below `if` block will delete image file from `uploads/images` folder, if request carries image file (i.e req.file) and image file is present in `uploads/images` folder
  if (req.file && fs.existsSync(req.file.path)) {
    fs.unlink(req.file.path, (err) => {
      console.log("log> server.js - file delete err:-");
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

export default app;
