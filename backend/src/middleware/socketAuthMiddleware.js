import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { ENV } from "../lib/env.js";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    
    const token = socket.handshake.headers.cookie
      ?.match(/jwt=([^;]+)/)?.[1];

    if (!token) {
      console.log("Socket auth failed: No token");
      return next(new Error("Unauthorized"));
    }

   
    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      console.log("Socket auth failed: User not found");
      return next(new Error("Unauthorized"));
    }

  
    socket.user = user;
    socket.userId = user._id.toString();

    console.log(`Socket authenticated: ${user.fullName}`);

    next();
  } catch (error) {
    console.error("Socket auth error:", error.message);
    next(new Error("Unauthorized"));
  }
};
