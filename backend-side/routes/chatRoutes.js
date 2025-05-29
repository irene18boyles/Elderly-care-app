import express from 'express';
import { ChatRoom } from '../models/ChatRoom.js';
import mongoose from 'mongoose';

const router = express.Router();

router.post('/', async (req, res) => {
  const { adminId, contactId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(adminId) || !mongoose.Types.ObjectId.isValid(contactId)) {
    return res.status(400).json({ message: 'Invalid IDs' });
  }

  const roomId = `${adminId}_${contactId}`;

  try {
    let chatRoom = await ChatRoom.findOne({ roomId });
    if (!chatRoom) {
      chatRoom = await ChatRoom.create({ roomId, name: `Room ${roomId}`, participants: [adminId, contactId] });
    }
    res.json({ roomId });
  } catch {
    res.status(500).json({ message: 'Error creating chat room' });
  }
});

export default router;
