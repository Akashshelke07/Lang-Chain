// src/components/ChatArea.jsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ChatArea.css';

function ChatArea({ 
  messages, 
  input, 
  setInput, 
  isLoading, 
  isSidebarOpen,
  messagesEndRef,
  onSubmit,
  onToggleSidebar 
}) {
  const examplePrompts = [
    { icon: "📝", text: "Code" },
    { icon: "✍️", text: "Write" },
    { icon: "📊", text: "Strategize" },
    { icon: "🎓", text: "Learn" },
    { icon: "☕", text: "Life stuff" }
  ];

  return (
    <div className={`chat-area ${isSidebarOpen ? 'with-sidebar' : 'full-width'}`}>
      {!isSidebarOpen && (
        <button className="sidebar-toggle-btn" onClick={onToggleSidebar}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 12h18M3 6h18M3 18h18" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      )}
      
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-screen">
            <div className="welcome-icon">☀️</div>
            <h2>Good afternoon, Akash</h2>
            <div className="example-prompts">
              {examplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  className="example-prompt"
                  onClick={() => setInput(prompt.text)}
                >
                  <span>{prompt.icon}</span>
                  <span>{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message-wrapper ${msg.role === 'user' ? 'user' : 'assistant'}`}
              >
                <div className="message-content">
                  <div className="message-avatar">
                    {msg.role === 'user' ? 'A' : '☀️'}
                  </div>
                  <div className="message-text">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="message-wrapper assistant">
                <div className="message-content">
                  <div className="message-avatar">☀️</div>
                  <div className="message-text">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="input-area">
        <form onSubmit={onSubmit} className="input-form">
          <div className="input-wrapper">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit(e);
                }
              }}
              placeholder="How can I help you today?"
              disabled={isLoading}
              rows="1"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="send-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M7 11l5-5 5 5M12 18V6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatArea;