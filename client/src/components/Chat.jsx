import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const ChatPopup = ({ token, roomId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!roomId || !isOpen) return;

    const socket = io(import.meta.env.VITE_BACKEND_URL, {
      auth: { token }
    });

    socket.on('connect', () => {
      socket.emit('join_room', { roomId });
    });

    socket.on('initial_message', setMessages);
    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [roomId, isOpen, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const socket = socketRef.current;
    if (socket && content.trim()) {
      socket.emit('send_message', { roomId, text: content.trim() });
      setContent('');
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-xl hover:bg-blue-700"
        aria-label="Open Chat"
      >
        💬
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 h-[400px] flex flex-col bg-white border border-gray-300 rounded-2xl shadow-2xl">
      {/* Header */}
      <div className="bg-blue-600 text-white p-3 font-semibold flex justify-between items-center rounded-t-2xl">
        Chat
        <button
          onClick={() => setIsOpen(false)}
          className="font-bold hover:text-gray-300"
          aria-label="Close Chat"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-3 text-sm border-b pb-2 border-gray-200">
            <div className="flex justify-between">
              <div>
                <strong>{msg.name}</strong>{' '}
                <em className="text-gray-600">({msg.role})</em>
              </div>
              <div className="text-xs text-gray-400">
                {new Date(msg.timestamp).toLocaleString()}
              </div>
            </div>
            <div className="mt-1">{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex border-t p-2">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 border rounded-l-xl px-3 py-2 focus:outline-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 rounded-r-xl hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPopup;
