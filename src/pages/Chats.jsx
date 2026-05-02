import React, { useState, useRef, useEffect } from 'react';
import './Chats.css';

const Chats = () => {
  const [chatData, setChatData] = useState([
    { id: 1, name: 'Design Team', message: 'Can we review the new mockups?', time: '10:30 AM', unread: 3, online: true, messages: [
      { id: 1, sender: 'them', text: 'Hey, are the new mockups ready?', time: '10:15 AM' },
      { id: 2, sender: 'me', text: 'Almost done, just adding some finishing touches.', time: '10:20 AM' },
      { id: 3, sender: 'them', text: 'Awesome!', time: '10:25 AM' },
      { id: 4, sender: 'them', text: 'Can we review the new mockups?', time: '10:30 AM' }
    ] },
    { id: 2, name: 'Alice Johnson', message: 'I will send the files shortly.', time: '09:15 AM', unread: 1, online: false, messages: [
      { id: 1, sender: 'me', text: 'Did you get the assets?', time: '09:00 AM' },
      { id: 2, sender: 'them', text: 'I will send the files shortly.', time: '09:15 AM' }
    ] },
    { id: 3, name: 'Bob Smith', message: 'Thanks for the update!', time: 'Yesterday', unread: 0, online: true, messages: [
      { id: 1, sender: 'me', text: 'Server migration is complete.', time: 'Yesterday 4:00 PM' },
      { id: 2, sender: 'them', text: 'Thanks for the update!', time: 'Yesterday 4:05 PM' }
    ] },
    { id: 4, name: 'Marketing Group', message: 'The campaign looks great.', time: 'Yesterday', unread: 0, online: false, messages: [
      { id: 1, sender: 'them', text: 'The campaign looks great.', time: 'Yesterday 2:00 PM' }
    ] },
    { id: 5, name: 'Diana Prince', message: 'Let me know when you are free to chat.', time: 'Tuesday', unread: 5, online: true, messages: [
      { id: 1, sender: 'them', text: 'Let me know when you are free to chat.', time: 'Tuesday' }
    ] },
  ]);

  const [activeChatId, setActiveChatId] = useState(null);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const activeChat = chatData.find(chat => chat.id === activeChatId);

  const handleSelectChat = (id) => {
    setActiveChatId(id);
    // Mark as read
    setChatData(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId) return;

    const newMessage = {
      id: Date.now(),
      sender: 'me',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatData(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          message: inputText, // Update preview
          time: newMessage.time,
          messages: [...chat.messages, newMessage]
        };
      }
      return chat;
    }));

    setInputText('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  return (
    <div className="chats-container">
      <div className="chats-sidebar card">
        <div className="chats-header">
          <h2 className="h2">Chats</h2>
          <div className="search-container chat-search">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search chats..." className="search-input" />
          </div>
        </div>
        
        <ul className="chat-list">
          {chatData.map((chat) => (
            <li 
              key={chat.id} 
              className={`chat-item ${activeChatId === chat.id ? 'active' : ''}`}
              onClick={() => handleSelectChat(chat.id)}
            >
              <div className="chat-avatar-container">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}&background=random`} 
                  alt={chat.name} 
                  className="avatar avatar-lg" 
                />
                {chat.online && <div className="online-indicator"></div>}
              </div>
              
              <div className="chat-info">
                <div className="chat-info-top">
                  <h4 className="chat-name">{chat.name}</h4>
                  <span className="chat-time">{chat.time}</span>
                </div>
                <div className="chat-info-bottom">
                  <p className="chat-message">{chat.message}</p>
                  {chat.unread > 0 && (
                    <span className="chat-unread-badge">{chat.unread}</span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="chats-main card p-0">
        {!activeChat ? (
          <div className="empty-chat-state" style={{ height: '100%', justifyContent: 'center' }}>
            <div className="empty-icon">💬</div>
            <h3 className="h3">Select a chat to start messaging</h3>
          </div>
        ) : (
          <div className="chat-window">
            <div className="chat-window-header">
              <div className="chat-avatar-container">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activeChat.name)}&background=random`} 
                  alt={activeChat.name} 
                  className="avatar" 
                />
              </div>
              <div className="chat-header-info">
                <h3 className="h3">{activeChat.name}</h3>
                <span className="text-muted text-sm">{activeChat.online ? 'Online' : 'Offline'}</span>
              </div>
            </div>
            
            <div className="chat-messages-area">
              {activeChat.messages.map(msg => (
                <div key={msg.id} className={`message-bubble ${msg.sender === 'me' ? 'me' : 'them'}`}>
                  <p>{msg.text}</p>
                  <span className="message-time">{msg.time}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="chat-input-area">
              <form className="chat-input-form" onSubmit={handleSendMessage}>
                <input 
                  type="text" 
                  className="chat-input-field" 
                  placeholder="Type a message..." 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-send">
                  Send
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chats;
