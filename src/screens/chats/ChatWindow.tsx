import React, { useEffect, useState, Dispatch, SetStateAction } from 'react';
import axios from 'axios';
import MessageInput from './MessageInput';

interface Message {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
}

interface Chat {
  id: string;
  name: string;
  participants: string[];
}

interface ChatWindowProps {
  activeChat: Chat;
}

const ChatWindow = ({ activeChat }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await axios.get<Message[]>(`/api/chat/${activeChat.id}`);
      setMessages(response.data);
    };
    fetchMessages();
  }, [activeChat]);

  return (
    <div className="flex-grow-1 d-flex flex-column">
      <div className="p-3 border-bottom">
        <h5>{activeChat.name}</h5>
      </div>
      <div className="flex-grow-1 p-3" style={{ overflowY: 'auto' }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`d-flex ${msg.sender === 'me' ? 'justify-content-end' : 'justify-content-start'}`}
          >
            <div className={`mb-2 p-2 rounded ${msg.sender === 'me' ? 'bg-primary text-white' : 'bg-light'}`}>
              {msg.message}
            </div>
          </div>
        ))}
      </div>
      <MessageInput activeChat={activeChat} setMessages={setMessages} />
    </div>
  );
};

export default ChatWindow;
