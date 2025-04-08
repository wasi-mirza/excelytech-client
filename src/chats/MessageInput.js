import React, { useState } from "react";
import axios from "axios";

const MessageInput = ({ activeChat, setMessages }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const handleSend = async () => {
    const formData = new FormData();
    formData.append("sender", "me"); // Use real user id in production
    formData.append("receiver", activeChat.id);
    formData.append("message", text);
    if (file) formData.append("file", file);

    const response = await axios.post("/api/chat", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setMessages((prev) => [...prev, response.data]);
    setText("");
    setFile(null);
  };

  return (
    <div className="p-3 border-top d-flex align-items-center">
      <input
        type="file"
        className="form-control me-2"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <input
        type="text"
        className="form-control me-2"
        placeholder="Type a message"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button className="btn btn-success" onClick={handleSend}>
        Send
      </button>
    </div>
  );
};

export default MessageInput;
