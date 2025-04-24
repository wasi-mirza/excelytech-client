import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { BASE_URL } from "../../shared/utils/endPointNames";
import { io, Socket } from "socket.io-client";
import axios from "axios";

interface User {
  _id: string;
  name: string;
  role?: string;
  accountManagers?: {
    _id: string;
    name: string;
  };
}

interface Message {
  _id: string;
  sender: string;
  receiver: string;
  message: string;
  file?: string;
  createdAt: string;
}

interface Auth {
  token: string;
  user: User;
}

const ChatSidebar = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newUrl = BASE_URL?.replace("/api", "") || "";
  const [auth] = useAuth();

  // Utility: Format date as "Day, DD MMM YYYY"
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // Utility: Check if the current message starts a new day
  const isNewDay = (currentMessage: Message, index: number) => {
    if (index === 0) return true;
    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const previousDate = new Date(
      messages[index - 1]?.createdAt
    ).toDateString();
    return currentDate !== previousDate;
  };

  useEffect(() => {
    // Fetch users and messages
    const fetchUsers = async () => {
      if (auth?.user?.role === "admin") {
        try {
          const res = await axios.get(`${BASE_URL}/user/users`, {
            headers: { Authorization: `Bearer ${auth?.token}` },
          });
          setUsers(res.data.data);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      }
    };

    fetchUsers();

    const newSocket = io(newUrl, {
      extraHeaders: { token: auth?.token },
    });

    newSocket.on("connected", () => console.log("connected"));
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [auth, newUrl]);

  useEffect(() => {
    // Join room and handle incoming messages
    const userId = auth?.user?._id;
    const receiverId =
      auth?.user?.role === "client"
        ? auth?.user?.accountManagers?._id
        : selectedUser?._id;

    if (receiverId && socket) {
      socket.emit("joinRoom", { userId, receiverId });

      socket.on("previousMessages", (fetchedMessages: Message[]) => {
        setMessages(fetchedMessages);
      });

      socket.on("receiveMessage", (message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
        console.log("receive", message);
      });
    }

    return () => {
      if (socket) {
        socket.off("previousMessages");
        socket.off("receiveMessage");
      }
    };
  }, [selectedUser, socket, auth]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async () => {
    const receiverId =
      auth?.user?.role === "client"
        ? auth?.user?.accountManagers?._id
        : selectedUser?._id;

    if ((newMessage.trim() || selectedFile) && receiverId && socket) {
      let uploadedFileUrl = "";

      if (selectedFile) {
        const formData = new FormData();
        formData.append("image", selectedFile);
        console.log("Selected", selectedFile);

        try {
          const res = await axios.post(
            `${BASE_URL}/upload/productImage`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${auth?.token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
          console.log("File", res.data);

          uploadedFileUrl = res.data?.fileUrl;
        } catch (error) {
          console.error("Error uploading image:", error);
          return;
        }
      }

      const messageData = {
        sender: auth?.user._id,
        receiver: receiverId,
        file: uploadedFileUrl,
        message: newMessage,
        createdAt: new Date().toISOString(),
      };

      socket.emit("sendMessage", messageData);

      setNewMessage("");
      setSelectedFile(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="content-wrapper">
      <section className="content pt-3">
        <div className="row" style={{ height: "calc(100vh - 50px)" }}>
          {auth?.user?.role === "admin" && (
            <div
              className="col-md-4 col-sm-12 border-end bg-light"
              style={{
                height: "100%",
                overflowY: "scroll",
                padding: "10px",
              }}
            >
              <div
                className="p-3 bg-olive text-white text-center mb-3 rounded"
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  lineHeight: "1.5",
                }}
              >
                Users
              </div>
              <ul className="list-group">
                {users.map((user) => (
                  <li
                    key={user._id}
                    className={`list-group-item ${
                      selectedUser?._id === user._id
                        ? "active bg-olive text-white"
                        : ""
                    }`}
                    onClick={() => setSelectedUser(user)}
                    style={{
                      cursor: "pointer",
                      marginBottom: "8px",
                      borderRadius: "8px",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold">{user.name}</span>
                      {selectedUser?._id === user._id && (
                        <span className="text-success small">Active</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
    
          <div
            className={`col-md-${
              auth?.user?.role === "admin" ? "8" : "12"
            } col-sm-12`}
            style={{ height: "100%", padding: "10px" }}
          >
            <div className="d-flex flex-column h-100 bg-white shadow-sm rounded">
              <div
                className="p-3 bg-olive text-white rounded-top"
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  lineHeight: "1.5",
                }}
              >
                {auth?.user?.accountManagers?.name ||
                  "Account Manager"}
              </div>
    
              <div className="flex-grow-1 p-3 bg-light overflow-auto">
                {messages.map((msg, index) => (
                  <React.Fragment key={msg._id || index}>
                    {isNewDay(msg, index) && (
                      <div className="text-center my-2">
                        <span className="badge bg-secondary">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                    )}
                    <div
                      className={`d-flex ${
                        msg.sender === auth?.user._id
                          ? "justify-content-end"
                          : ""
                      }`}
                    >
                      <div
                        className={`p-2 m-1 shadow-sm rounded ${
                          msg.sender === auth?.user._id
                            ? "bg-olive text-white"
                            : "bg-light text-dark"
                        }`}
                        style={{
                          maxWidth: "75%",
                          lineHeight: "1.5",
                          borderRadius: "12px",
                        }}
                      >
                        {msg.file && (
                          <div className="mb-2">
                            <img
                              src={`${newUrl}${msg.file}`}
                              alt="Sent"
                              className="img-fluid rounded"
                              style={{
                                maxWidth: "100%",
                                objectFit: "contain",
                              }}
                              onClick={() =>
                                window.open(
                                  `${newUrl}${msg.file}`,
                                  "_blank"
                                )
                              }
                            />
                          </div>
                        )}
                        <div>{msg.message}</div>
                        <div className="small text-end text-dark mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
                <div ref={messagesEndRef}></div>
              </div>
    
              {selectedFile && (
                <div className="p-2 border-top text-center">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="img-fluid rounded mb-2"
                    style={{ maxWidth: "25%" }}
                  />
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    Remove
                  </button>
                </div>
              )}
    
              <div className="p-3 border-top">
                <div className="input-group">
                  <span
                    className="input-group-text bg-light"
                    style={{
                      cursor: "pointer",
                      borderRadius: "50%",
                    }}
                    onClick={triggerFileInput}
                  >
                    <i className="fas fa-paperclip"></i>
                  </span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && sendMessage()
                    }
                  />
                  <button
                    className="btn btn-success"
                    onClick={sendMessage}
                  >
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ChatSidebar;
