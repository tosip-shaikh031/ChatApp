import express from 'express';
import { protectRoute } from '../middleware/auth.js';
import {
  getMessages,
  getUsersForSidebar,
  markMessageAsSeen,
  sendMessage
} from '../controllers/messageController.js';

const messageRouter = express.Router();

// ✅ Get all users except logged-in (for sidebar)
messageRouter.get('/users', protectRoute, getUsersForSidebar);

// ✅ Get all messages (supports direct and group with query ?type=group)
messageRouter.get('/:id', protectRoute, getMessages); 

// ✅ Mark a message as seen
messageRouter.put('/mark/:id', protectRoute, markMessageAsSeen);

// ✅ Send a message to user or group (pass { group: true } in body for group)
messageRouter.post('/send/:id', protectRoute, sendMessage);

export default messageRouter;
