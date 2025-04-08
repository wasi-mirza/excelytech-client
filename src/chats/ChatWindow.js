import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MessageInput from './MessageInput';

const ChatWindow = ({ activeChat }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await axios.get(`/api/chat/${activeChat.id}`);
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
