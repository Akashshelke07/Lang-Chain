// src/App.jsx
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1/chat';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Use a fixed or dynamic session ID (you can generate UUID later)
  const sessionId = localStorage.getItem('sessionId') || 'akash-default';
  if (!localStorage.getItem('sessionId')) {
    localStorage.setItem('sessionId', sessionId);
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(API_URL, {
        message: input,
        session_id: sessionId,
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Backend error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    // Optionally create new sessionId here if you want to reset memory
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        Restaurant Branding Assistant 🍽️
        <button onClick={clearChat} className="clear-btn">Clear Chat</button>
      </div>

      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
          </div>
        ))}

        {isLoading && <div className="message assistant-message">Thinking about your restaurant concept...</div>}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g., Suggest upscale names for Maharashtrian fine-dining in Pune"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
}

export default App;