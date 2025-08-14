import Message from '../models/Message.js';
import User from '../models/User.js';
import cloudinary from '../lib/cloudinary.js';
import { io, userSocketMap } from '../server.js'; // Import the Socket.IO instance and user socket map

//Get all users except the logged-in user
export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id; // Get the logged-in user's ID from the request object
        const filteredUsers = await User.find({ _id: { $ne: userId } }) // Find all users except the logged-in user
            .select("-password") // Exclude sensitive fields

        const unseenMessages = {};
        const promises = filteredUsers.map(async (user) => {
            const messages = await Message.find({ senderId: user._id, receiverId: userId, seen: false }) // Find unseen messages for each user
            if (messages.length > 0) {
                unseenMessages[user._id] = messages.length; // Store the count of unseen messages
            }
        });
        await Promise.all(promises); // Wait for all promises to resolve
        res.json({ success: true, users: filteredUsers, unseenMessages }); // Send the list of users as a response
    } catch (error) {
        console.log("Error fetching users for sidebar:", error.message);
        res.json({ success: false, message: error.message || "Failed to fetch users" });
    }
}

//Get all messages between two users
export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params; // Get the selected user ID from the request parameters
        const myId = req.user._id; // Get the logged-in user's ID from the request object
        if (!selectedUserId) {
            return res.json({ success: false, message: "Selected user ID is required" });
        }
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId }, // Messages sent by the logged-in user to the selected user
                { senderId: selectedUserId, receiverId: myId } // Messages sent by the selected user to the logged-in user
            ]
        })
        await Message.updateMany(
            { senderId: selectedUserId, receiverId: myId, seen: false }, // Find unseen messages sent by the selected user to the logged-in user
            { seen: true } // Mark them as seen
        );
        res.json({ success: true, messages }); // Send the list of messages as a response
    } catch (error) {
        console.log("Error fetching messages:", error.message);
        res.json({ success: false, message: error.message || "Failed to fetch messages" });
    }
}

// api to mark message seen using message id
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params; // Get the message ID from the request parameters
        if (!id) {
            return res.json({ success: false, message: "Message ID is required" });
        }
        await Message.findByIdAndUpdate(id, { seen: true }); // Update the message to mark it as seen
        res.json({ success: true, message: "Message marked as seen" }); // Send the updated message as a response
    } catch (error) {
        console.log("Error marking message as seen:", error.message);
        res.json({ success: false, message: error.message || "Failed to mark message as seen" });
    }
}

//Controller to send a message
export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body; // Get the text, and image from the request body
        const receiverId = req.params.id; // Get the receiver ID from the request parameters
        const senderId = req.user._id; // Get the logged-in user's ID from the request object

        let imageUrl;
        if (image) {
            // If an image is provided, upload it to Cloudinary
            const uploadResult = await cloudinary.uploader.upload(image);
            imageUrl = uploadResult.secure_url; // Get the secure URL of the uploaded image
        }

        const newMessage = await Message.create({
            senderId, // Set the sender ID
            receiverId, // Set the receiver ID
            text, // Set the text of the message
            image: imageUrl // Set the image URL if provided
        });

        // Emit the new message to the receiver's socket
        const receiverSocketId = userSocketMap[receiverId]; // Get the socket ID of the receiver from the userSocketMap
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage); // Emit the new message to the receiver's socket
        }

        res.json({ success: true, newMessage }); // Send the newly created message as a response
    } catch (error) {
        console.log("Error sending message:", error.message);
        res.json({ success: false, message: error.message || "Failed to send message" });
    }
}