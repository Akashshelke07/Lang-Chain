// src/components/Sidebar.jsx
import React, { useState } from 'react';
import './Sidebar.css';

function Sidebar({ 
  isOpen, 
  chatHistory, 
  currentChatId, 
  onNewChat, 
  onLoadChat, 
  onDeleteChat,
  onClearAll,
  onToggleSidebar
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const groupChatsByDate = () => {
    const groups = {
      'Recents': []
    };

    chatHistory.forEach(chat => {
      groups['Recents'].push(chat);
    });

    return groups;
  };

  const groupedChats = groupChatsByDate();

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <button className="new-chat-btn" onClick={onNewChat}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>New chat</span>
        </button>
      </div>

      <div className="chat-list">
        {Object.entries(groupedChats).map(([group, chats]) => (
          chats.length > 0 && (
            <div key={group} className="chat-group">
              <div className="group-title">{group}</div>
              {chats.map(chat => (
                <div
                  key={chat.id}
                  className={`chat-item ${currentChatId === chat.id ? 'active' : ''}`}
                  onClick={() => onLoadChat(chat.id)}
                >
                  <div className="chat-title">{chat.title}</div>
                  <button 
                    className="delete-chat-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )
        ))}
      </div>

      <div className="sidebar-footer">
        {chatHistory.length > 0 && (
          <button 
            className="clear-all-btn"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" strokeWidth="2"/>
            </svg>
            Clear conversations
          </button>
        )}
        
        <div className="user-info">
          <div className="user-avatar">A</div>
          <div className="user-name">Akash</div>
          <button className="toggle-sidebar" onClick={onToggleSidebar}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Clear all conversations?</h3>
            <p>This will delete all your chat history permanently.</p>
            <div className="modal-actions">
              <button 
                className="btn-cancel"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-delete"
                onClick={() => {
                  onClearAll();
                  setShowDeleteConfirm(false);
                }}
              >
                Delete all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;