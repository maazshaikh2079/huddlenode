import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

export const verifyJwt = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    // Check if the authorization header exists first
    const authHeader = req.headers.authorization; // Authorization: 'Bearer TOKEN(i.e. fbvndfh...)'

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Authentication failed: No token provided.");
    }

    const token = authHeader.split(" ")[1]; // 'Bearer TOKEN(i.e. fbvndfh...)'

    /* Error if token is invalid ->
    {
      "message": "Something went worng while jwt(token) verification\nError: TypeError: Cannot read properties of undefined (reading 'split')- check-auth.middleware.js"
    }
    */

    if (!token) {
      console.log("log> Error: `token` is empty - check-auth.middleware.js");
      throw new Error("`token` is empty - check-auth.middleware.js");
    }

    const decodedToken = jwt.verify(token, process.env.MY_JWT_SECRET_KEY);

    req.userData = { userId: decodedToken.userId };

    next();
  } catch (err) {
    const error = new ApiError(
      `Something went worng while jwt(token) verification\nError: ${err} - check-auth.middleware.js`,
      401
    );
    console.log(`log> ${error.message}`);

    return next(error);
  }
};
