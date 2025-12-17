import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { ENV } from "../lib/env.js";
import cookie from "cookie";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    
     const rawCookie = socket.handshake.headers.cookie;

    if (!rawCookie) {
      console.log("Socket auth failed: No cookies sent");
      return next(new Error("Unauthorized"));
    }

    const cookies = cookie.parse(rawCookie);
    const token = cookies.jwt; 

   
     const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (!decoded) {
      console.log("Socket connection rejected: Invalid token");
      return next(new Error("Unauthorized - Invalid Token"));
    }


    
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      console.log("Socket connection failed: User not found");
      return next(new Error("Unauthorized"));
    }

  // attach user info to socket object
    socket.user = user;
    socket.userId = user._id.toString();

    console.log(`Socket authenticated for user : ${user.fullName} (${user._id.toString()}) `);

    next();
  } catch (error) {
    console.error("Socket auth error:", error.message);
    next(new Error("Unauthorized - Authentication failed"));
  }
};
