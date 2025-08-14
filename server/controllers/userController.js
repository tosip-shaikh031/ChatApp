import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

// Signup a new user
export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;

  try {
    // Check for missing fields
    if (!fullName || !email || !password || !bio) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // Check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.json({ success: false, message: "Account already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({ fullName, email, password : hashedPassword , bio });
    const token = generateToken(newUser._id);
    res.json({ success: true, userData :newUser, token, message: "Account created successfully" });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//Cntroller to login a user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for missing fields
        if (!email || !password) {
        return res.json({ success: false, message: "Missing Details" });
        }
    
        // Find user by email
        const userData = await User.findOne({ email });
        if (!userData) {
        return res.json({ success: false, message: "Account does not exist" });
        }
    
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, userData.password);
        if (!isPasswordValid) {
        return res.json({ success: false, message: "Invalid Password" });
        }
    
        const token = generateToken(userData._id);
        res.json({ success: true, userData, token, message: "Login successful" });
    
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

//Controller to check user is authenticated
export const checkAuth = (req, res) => {
  res.json({
    success: true,
    user: req.user, // User is attached to req by protectRoute middleware
    message: "User is authenticated"
  });
};

//Controller to update user profile
export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body;
        const userId = req.user._id; // Get user ID from authenticated request
        let updatedUser;

        if(!profilePic) {
            await User.findByIdAndUpdate(
                userId,
                { bio, fullName },
                { new: true }
            );
        } else{
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(
                userId,
                { profilePic: upload.secure_url, bio, fullName },
                { new: true }
            );
        }
        res.json({ success: true, user:updatedUser, message: "Profile updated successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
    }
