import React, { useState } from 'react';
import axios from 'axios';
import CharacterDisplay from './components/CharacterDisplay';
import ChatWindow from './components/ChatWindow';
import './App.css'; // Assuming you'll create a basic CSS file

function App() {
  const [messages, setMessages] = useState([]);
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [characterImages, setCharacterImages] = useState({
    neutral: '/images/neutral.png',
    joy: '/images/joy.png',
    sorrow: '/images/sorrow.png',
    anger: '/images/anger.png',
    surprise: '/images/surprise.png',
    fun: '/images/fun.png',
    love: '/images/love.png',
    anxiety: '/images/anxiety.png',
    amazement: '/images/amazement.png',
  });
  const [chatHistory, setChatHistory] = useState([]);

  const backendApiUrl = import.meta.env.VITE_BACKEND_API_URL;

  const handleSendMessage = async (message) => {
    const newMessage = { sender: 'user', text: message };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    try {
      const response = await axios.post(`${backendApiUrl}/chat`, {
        message: message,
        history: chatHistory,
      });

      const aiReply = response.data.reply;
      const aiEmotion = response.data.emotion;

      setMessages((prevMessages) => [...prevMessages, { sender: 'AI', text: aiReply }]);
      setCurrentEmotion(aiEmotion);

      // Update chat history for the next turn
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { role: 'user', parts: [{ text: message }] },
        { role: 'model', parts: [{ text: aiReply }] },
      ]);

    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) => [...prevMessages, { sender: 'AI', text: "Sorry, I couldn't process that." }]);
    }
  };

  return (
    <div className="App">
      <h1>AI Character Chat</h1>
      <div className="main-content">
        <div className="left-panel">
          <CharacterDisplay currentEmotion={currentEmotion} characterImages={characterImages} />
        </div>
        <div className="right-panel">
          <ChatWindow messages={messages} onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
}

export default App;
