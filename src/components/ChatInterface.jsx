import React, { useState } from 'react';
import axios from 'axios'; // 🔄 use axios for file upload
import { sendChatMessageToAI } from '../api';

function ChatInterface() {
  const [userInput, setUserInput] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [file, setFile] = useState(null);

  const handleSendMessage = async () => {
    let fileUrl = null;

    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await axios.post("http://localhost:5000/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        fileUrl = res.data.fileUrl;
      } catch (err) {
        console.error("File upload failed:", err);
      }
    }

    const newMessage = {
      user: 'You',
      message: userInput,
      fileUrl,
    };
    setChatLog([...chatLog, newMessage]);
    setUserInput('');
    setFile(null);

    // Send message to AI (or mock if not needed)
    const aiResponseData = await sendChatMessageToAI(userInput);
    if (aiResponseData) {
      const responseMessage = {
        user: 'AI',
        message: aiResponseData.response || 'No response from AI.',
        fileUrl: aiResponseData.fileUrl || null,
      };
      setChatLog((prev) => [...prev, responseMessage]);
    } else {
      setChatLog((prev) => [...prev, { user: 'AI', message: 'Error getting AI response.' }]);
    }
  };

  const renderMessageContent = (msg) => (
    <>
      {msg.message && <div>{msg.message}</div>}
      {msg.fileUrl && msg.fileUrl.match(/\.(jpeg|jpg|gif|png)$/) ? (
        <img
  src={`process.env.REACT_APP_API_URL${msg.fileUrl}`}  // this is important!
  alt="uploaded"
  style={{ maxWidth: '200px', marginTop: '8px', borderRadius: '8px' }}
/>

      ) : msg.fileUrl ? (
        <a href={`http://localhost:5000${msg.fileUrl}`} download style={{ color: 'cyan' }}>Download file</a>
      ) : null}
    </>
  );

  return (
    <div style={{ background: '#1e1e1e', padding: '16px', color: 'white' }}>
      <div style={{ marginBottom: '16px' }}>
        {chatLog.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: '12px' }}>
            <strong>{msg.user}:</strong> {renderMessageContent(msg)}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message..."
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatInterface;
