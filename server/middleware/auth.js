import jwt from 'jsonwebtoken';
import User from '../models/User.js';

//Middleware to protect routes
export const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers.token // Get token from Authorization header
    const decoded = jwt.verify(token, process.env.JWT_SECRET);// Verify the token using JWT secret
    const user = await User.findById(decoded.userID).select("-password");// Find user by ID and exclude password field
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });// Check if user exists
    }
    req.user = user; // Attach user to request object
    next();// Call next middleware or route handler
  } catch (error) {
    console.log("Token verification failed:", error.message);
    return res.status(401).json({ success: false, message: error.message || "Unauthorized" });// Handle errors and send unauthorized response
  }
}

