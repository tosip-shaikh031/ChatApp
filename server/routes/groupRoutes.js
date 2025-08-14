import express from 'express';
import {
  createGroup,
  getUserGroups,
  deleteGroup,
  addMembersToGroup,
  getGroupMessages,
  markGroupMessageAsSeen,
  sendGroupMessage
} from '../controllers/groupController.js';

import {
    renameGroup,
    removeMemberFromGroup,
    transferAdmin,
    leaveGroup
  } from '../controllers/groupController.js';

import { protectRoute } from '../middleware/auth.js';

const groupRouter = express.Router();

// ✅ Create a new group
groupRouter.post('/create', protectRoute, createGroup);

// ✅ Get all groups for logged-in user
groupRouter.get('/my-groups', protectRoute, getUserGroups);

// ✅ Delete a group (admin only)
groupRouter.delete('/:id', protectRoute, deleteGroup);

// ✅ Add members to a group (admin only)
groupRouter.put('/add-members/:id', protectRoute, addMembersToGroup);

// ✅ Get all messages for a specific group
groupRouter.get('/messages/:id', protectRoute, getGroupMessages);

// ✅ Mark a group message as seen
groupRouter.put('/messages/mark/:id', protectRoute, markGroupMessageAsSeen);

// ✅ Send a message in a group
groupRouter.post('/send/:id', protectRoute, sendGroupMessage);

// ✅ Rename group
groupRouter.put('/rename/:id', protectRoute, renameGroup);

// ✅ Remove member (admin only)
groupRouter.put('/remove-member/:id', protectRoute, removeMemberFromGroup);

// ✅ Transfer admin rights (admin only)
groupRouter.put('/transfer-admin/:id', protectRoute, transferAdmin);

// ✅ Leave group
groupRouter.put('/leave/:id', protectRoute, leaveGroup);

export default groupRouter;
