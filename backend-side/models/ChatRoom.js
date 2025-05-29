import mongoose from 'mongoose';
import { Message } from '../models/messages.js'; // correct import path

const chatRoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  _id: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  participants: [
    {
      type: String,
      required: true,
    }
  ],
  messages: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'Message'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

export { ChatRoom }