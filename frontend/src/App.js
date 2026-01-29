// src/App.jsx
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1/chat';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const messagesEndRef = useRef(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const sessionId = currentChatId || `chat-${Date.now()}`;
      
      const response = await axios.post(API_URL, {
        message: input,
        session_id: sessionId,
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response
      };
      
      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      // Update or create chat in history
      if (!currentChatId) {
        const newChat = {
          id: sessionId,
          title: input.slice(0, 50) + (input.length > 50 ? '...' : ''),
          messages: updatedMessages,
          timestamp: new Date().toISOString()
        };
        setChatHistory(prev => [newChat, ...prev]);
        setCurrentChatId(sessionId);
      } else {
        setChatHistory(prev => 
          prev.map(chat => 
            chat.id === currentChatId 
              ? { ...chat, messages: updatedMessages }
              : chat
          )
        );
      }
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

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
  };

  const loadChat = (chatId) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setCurrentChatId(chatId);
    }
  };

  const deleteChat = (chatId) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      startNewChat();
    }
  };

  const clearAllHistory = () => {
    setChatHistory([]);
    localStorage.removeItem('chatHistory');
    startNewChat();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app">
      <Sidebar
        isOpen={isSidebarOpen}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        onNewChat={startNewChat}
        onLoadChat={loadChat}
        onDeleteChat={deleteChat}
        onClearAll={clearAllHistory}
        onToggleSidebar={toggleSidebar}
      />
      
      <ChatArea
        messages={messages}
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        isSidebarOpen={isSidebarOpen}
        messagesEndRef={messagesEndRef}
        onSubmit={handleSubmit}
        onToggleSidebar={toggleSidebar}
      />
    </div>
  );
}

export default App;