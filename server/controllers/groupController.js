import Group from '../models/Group.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import { io, userSocketMap } from '../server.js'; // Assuming this is where your io instance lives
import cloudinary from '../lib/cloudinary.js';

export const createGroup = async (req, res) => {
  const { name, members } = req.body;
  const adminId = req.user._id;

  try {
    const newGroup = await Group.create({
      name,
      admin: adminId,
      members: [...members, adminId],
    });

    res.status(201).json(newGroup);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create group' });
  }
};

export const getUserGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id }).populate('members', 'fullName profilePic');
    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
};


export const deleteGroup = async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user._id;

  try {
    const group = await Group.findById(groupId);

    if (!group) return res.status(404).json({ error: "Group not found" });
    if (group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Only admin can delete the group" });
    }

    await group.deleteOne();
    res.status(200).json({ message: "Group deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: "Failed to delete group" });
  }
};


export const addMembersToGroup = async (req, res) => {
  const groupId = req.params.id;
  const { newMembers } = req.body; // Array of user IDs to add
  const userId = req.user._id;

  try {
    const group = await Group.findById(groupId);

    if (!group) return res.status(404).json({ error: "Group not found" });
    if (group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Only admin can add members" });
    }

    // Avoid duplicates
    const updatedMembers = [...new Set([...group.members.map(id => id.toString()), ...newMembers])];

    group.members = updatedMembers;
    await group.save();

    const populatedGroup = await group.populate('members', 'fullName profilePic');
    res.status(200).json({ message: "Members added", group: populatedGroup });

  } catch (err) {
    res.status(500).json({ error: "Failed to add members to group" });
  }
};

// ✅ Get all messages for a group
export const getGroupMessages = async (req, res) => {
  const groupId = req.params.id;

  try {
    const messages = await Message.find({ groupId })
      .populate('senderId', 'fullName profilePic')
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (err) {
    console.error("Error fetching group messages:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch group messages" });
  }
};

// ✅ Mark a specific group message as seen (optional if you want per-user tracking)
export const markGroupMessageAsSeen = async (req, res) => {
  const messageId = req.params.id;

  try {
    await Message.findByIdAndUpdate(messageId, { seen: true });
    res.status(200).json({ success: true, message: "Group message marked as seen" });
  } catch (err) {
    console.error("Mark seen failed:", err.message);
    res.status(500).json({ success: false, message: "Failed to mark message as seen" });
  }
};

// ✅ Send group message (with image support & socket.io broadcast)
export const sendGroupMessage = async (req, res) => {
  const groupId = req.params.id;
  const senderId = req.user._id;
  const { text, image } = req.body;

  try {
    let imageUrl;
    if (image) {
      const uploadResult = await cloudinary.uploader.upload(image);
      imageUrl = uploadResult.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      groupId,
      text,
      image: imageUrl,
    });

    const populatedMessage = await newMessage.populate('senderId', 'fullName profilePic');

    // 🔁 Emit to all group members via socket.io
    const group = await (await import('../models/Group.js')).default.findById(groupId);
    if (group) {
      group.members.forEach(memberId => {
        const socketId = userSocketMap[memberId.toString()];
        if (socketId && memberId.toString() !== senderId.toString()) {
          io.to(socketId).emit("newGroupMessage", populatedMessage);
        }
      });
    }

    res.status(201).json({ success: true, newMessage: populatedMessage });

  } catch (err) {
    console.error("Send group message failed:", err.message);
    res.status(500).json({ success: false, message: "Failed to send group message" });
  }
};

export const renameGroup = async (req, res) => {
  const groupId = req.params.id;
  const { newName } = req.body;
  const userId = req.user._id;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    if (group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Only admin can rename the group" });
    }

    group.name = newName;
    await group.save();
    res.status(200).json({ message: "Group renamed", group });
  } catch (err) {
    res.status(500).json({ error: "Failed to rename group" });
  }
};


export const removeMemberFromGroup = async (req, res) => {
  const groupId = req.params.id;
  const { memberId } = req.body;
  const userId = req.user._id;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    if (group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Only admin can remove members" });
    }

    group.members = group.members.filter(
      (id) => id.toString() !== memberId.toString()
    );
    await group.save();
    res.status(200).json({ message: "Member removed", group });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove member" });
  }
};


export const transferAdmin = async (req, res) => {
  const groupId = req.params.id;
  const { newAdminId } = req.body;
  const userId = req.user._id;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    if (group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Only current admin can transfer admin rights" });
    }

    if (!group.members.includes(newAdminId)) {
      return res.status(400).json({ error: "New admin must be a group member" });
    }

    group.admin = newAdminId;
    await group.save();
    res.status(200).json({ message: "Admin transferred", group });
  } catch (err) {
    res.status(500).json({ error: "Failed to transfer admin" });
  }
};

export const leaveGroup = async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user._id;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    // If admin leaves, deny or optionally transfer first
    if (group.admin.toString() === userId.toString()) {
      return res.status(403).json({ error: "Admin cannot leave the group. Transfer admin first." });
    }

    group.members = group.members.filter(
      (id) => id.toString() !== userId.toString()
    );

    await group.save();
    res.status(200).json({ message: "Left group", group });
  } catch (err) {
    res.status(500).json({ error: "Failed to leave group" });
  }
};


