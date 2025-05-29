import { Server } from 'socket.io';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Message } from '../models/messages.js';
import { ChatRoom } from '../models/ChatRoom.js';

dotenv.config();

const socketHandler = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"]
    }
  });

  // JWT authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error: No token'));

    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const user = socket.user;
    const displayName = user.fullname || user.name || user.email || 'Unknown User';

    socket.on('join_room', async ({ roomId }) => {
      if (!roomId) return;

      try {
        let chatRoom = await ChatRoom.findById(roomId);
        if (!chatRoom) {
          chatRoom = new ChatRoom({
            _id: roomId,
            name: `Room ${roomId}`
          });
          await chatRoom.save();
        }

        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);

        const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
        socket.emit('initial_message', messages.map(msg => ({
          _id: msg._id,
          name: msg.name,
          email: msg.email,
          role: msg.role || 'user',
          sender: msg.sender,
          text: msg.content,
          timestamp: msg.timestamp?.toISOString() || msg._id.getTimestamp().toISOString(),
        })));
      } catch (err) {
        console.error(`Error joining room ${roomId}:`, err);
      }
    });

    socket.on('send_message', async ({ roomId, text }) => {
      if (!roomId || !text?.trim()) return;

      const messageData = {
        name: displayName,
        role: user.role || 'user',
        sender: socket.id,
        content: text.trim(),
        timestamp: new Date(),
        roomId,
      };

      io.to(roomId).emit('receive_message', {
        name: messageData.name,
        email: user.email,
        role: messageData.role,
        text: messageData.content,
        timestamp: messageData.timestamp.toISOString(),
      });

      try {
        await new Message(messageData).save();
      } catch (err) {
        console.error('Error saving message:', err);
      }
    });
  });
};

export default socketHandler;
