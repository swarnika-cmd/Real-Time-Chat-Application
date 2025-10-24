// client/src/pages/Chat.jsx - Modern 3-Panel Chat Interface

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import { 
    FaComments, 
    FaSearch, 
    FaEllipsisH, 
    FaPaperclip, 
    FaSmile, 
    FaPaperPlane,
    FaSignOutAlt,
    FaFile,
    FaDownload,
    FaStar
} from 'react-icons/fa';

const ENDPOINT = "http://localhost:5000";
let socket;

const Chat = () => {
    const { user, token, dispatch } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [allUsers, setAllUsers] = useState([]);
    const [chatTarget, setChatTarget] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // --- EFFECT 1: SOCKET CONNECTION & DISCONNECTION ---
    useEffect(() => {
        socket = io(ENDPOINT);
        
        socket.on('message_received', (newMessage) => {
            if (chatTarget && (newMessage.sender._id === chatTarget._id || newMessage.receiver._id === chatTarget._id)) {
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [chatTarget, user]);

    // --- EFFECT 2: FETCH ALL USERS ---
    useEffect(() => {
        if (!token) return;

        const fetchUsers = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const response = await axios.get(`${ENDPOINT}/api/users/all`, config);
                setAllUsers(response.data);
            } catch (error) {
                console.error('Failed to fetch users:', error);
                if (error.response && error.response.status === 401) {
                    authService.logout();
                    dispatch({ type: 'LOGOUT' });
                    navigate('/login');
                }
            }
        };
        fetchUsers();
    }, [token, dispatch, navigate]);

    // --- LOGOUT HANDLER ---
    const handleLogout = () => {
        authService.logout();
        dispatch({ type: 'LOGOUT' });
        navigate('/login');
    };
    
    // --- HANDLER TO SELECT A CHAT TARGET AND FETCH HISTORY ---
    const selectChatTarget = async (targetUser) => {
        setChatTarget(targetUser);
        setMessages([]);
        
        const roomId = user._id < targetUser._id ? `${user._id}_${targetUser._id}` : `${targetUser._id}_${user._id}`;
        socket.emit('join_chat', roomId);

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${ENDPOINT}/api/messages/${targetUser._id}`, config);
            setMessages(response.data);
        } catch (error) {
            console.error('Failed to fetch message history:', error.response?.data?.message || error.message);
        }
    };
    
    // --- SEND MESSAGE HANDLER ---
    const sendChatMessage = async (e) => {
        e.preventDefault();
        
        if (messageInput.trim() === '' || !chatTarget) return;

        const messageData = {
            receiverId: chatTarget._id,
            content: messageInput,
            roomId: user._id < chatTarget._id ? `${user._id}_${chatTarget._id}` : `${chatTarget._id}_${user._id}`,
        };
        
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const savedMessage = await axios.post(`${ENDPOINT}/api/messages`, messageData, config);
            
            socket.emit('new_message', savedMessage.data);
            setMessages((prevMessages) => [...prevMessages, savedMessage.data]);
            setMessageInput('');
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    // Filter users based on search
    const filteredUsers = allUsers.filter(u => 
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Helper to get initials
    const getInitials = (name) => {
        return name ? name.charAt(0).toUpperCase() : '?';
    };

    // Helper to format time
    const formatTime = (date) => {
        const d = new Date(date);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="chat-app-container">
            {/* 1. LEFT NAVIGATION SIDEBAR */}
            <div className="nav-sidebar">
                <div className="nav-logo">
                    <FaComments size={28} />
                </div>
                
                <div className="nav-icons">
                    <button className="nav-icon-btn active">
                        <FaComments size={20} />
                    </button>
                </div>
                
                <button className="nav-icon-btn logout-nav" onClick={handleLogout}>
                    <FaSignOutAlt size={20} />
                </button>
            </div>

            {/* 2. CHAT LIST PANEL */}
            <div className="chat-list-panel">
                <div className="chat-list-header">
                    <div className="header-title-row">
                        <h2>Chats</h2>
                        <button className="more-btn">
                            <FaEllipsisH />
                        </button>
                    </div>
                    
                    <div className="search-box">
                        <FaSearch />
                        <input 
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="chat-list">
                    {filteredUsers.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#a0aec0', padding: '20px' }}>
                            No users found
                        </p>
                    ) : (
                        filteredUsers.map((targetUser) => (
                            <div
                                key={targetUser._id}
                                className={`chat-list-item ${chatTarget?._id === targetUser._id ? 'active' : ''}`}
                                onClick={() => selectChatTarget(targetUser)}
                            >
                                <div className="chat-avatar">
                                    {getInitials(targetUser.username)}
                                    <span className="online-indicator"></span>
                                </div>
                                <div className="chat-info">
                                    <div className="chat-name">{targetUser.username}</div>
                                    <div className="chat-preview">Click to start chatting</div>
                                </div>
                                <div className="chat-time">now</div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 3. MAIN CHAT AREA */}
            <div className="main-chat-area">
                {!chatTarget ? (
                    <div className="no-chat-selected">
                        <FaComments size={64} style={{ color: '#cbd5e0' }} />
                        <h3>Welcome to PINSTAGRAM</h3>
                        <p>Select a conversation to start messaging</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="chat-area-header">
                            <div className="header-user-info">
                                <div className="chat-avatar large">
                                    {getInitials(chatTarget.username)}
                                    <span className="online-indicator"></span>
                                </div>
                                <div>
                                    <h3>{chatTarget.username}</h3>
                                    <div className="status-text">Active now</div>
                                </div>
                            </div>
                            <button className="more-btn">
                                <FaEllipsisH size={20} />
                            </button>
                        </div>

                        {/* Messages Container */}
                        <div className="messages-container">
                            {messages.length === 0 ? (
                                <div className="empty-messages">
                                    <p>No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const isSent = msg.sender?._id === user._id;
                                    return (
                                        <div key={index} className={`message-row ${isSent ? 'sent' : 'received'}`}>
                                            <div className="message-avatar">
                                                {getInitials(isSent ? user.username : chatTarget.username)}
                                            </div>
                                            <div className="message-content">
                                                <div className="message-bubble">
                                                    {msg.content}
                                                </div>
                                                <div className="message-time">
                                                    {formatTime(msg.createdAt)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Message Input Area */}
                        <div className="message-input-area">
                            <button className="attachment-btn">
                                <FaPaperclip size={18} />
                            </button>
                            
                            <input
                                type="text"
                                className="message-input-field"
                                placeholder="Type a message..."
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        sendChatMessage(e);
                                    }
                                }}
                            />
                            
                            <button className="emoji-btn">
                                <FaSmile size={18} />
                            </button>
                            
                            <button 
                                className="send-message-btn"
                                onClick={sendChatMessage}
                                disabled={!messageInput.trim()}
                            >
                                <FaPaperPlane size={16} />
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* 4. RIGHT SIDEBAR */}
            <div className="right-sidebar">
                {chatTarget ? (
                    <>
                        <div style={{ textAlign: 'center', paddingBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
                            <div className="chat-avatar large" style={{ margin: '0 auto 12px' }}>
                                {getInitials(chatTarget.username)}
                                <span className="online-indicator"></span>
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
                                {chatTarget.username}
                            </h3>
                            <p style={{ fontSize: '13px', color: '#48bb78' }}>Active now</p>
                        </div>

                        <div className="sidebar-section">
                            <button className="collapse-btn">
                                <FaFile />
                                <span>Shared Files</span>
                                <span className="expand-icon">▼</span>
                            </button>
                            
                            <div className="files-list">
                                <div className="file-item">
                                    <div className="file-icon">
                                        <FaFile size={18} />
                                        <FaStar className="star-icon" size={10} />
                                    </div>
                                    <div className="file-details">
                                        <div className="file-name">project_proposal.pdf</div>
                                        <div className="file-size">2.4 MB</div>
                                    </div>
                                    <button className="file-download">
                                        <FaDownload size={14} />
                                    </button>
                                </div>
                                
                                <div className="file-item">
                                    <div className="file-icon">
                                        <FaFile size={18} />
                                    </div>
                                    <div className="file-details">
                                        <div className="file-name">design_mockup.fig</div>
                                        <div className="file-size">1.8 MB</div>
                                    </div>
                                    <button className="file-download">
                                        <FaDownload size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', color: '#a0aec0', padding: '40px 20px' }}>
                        <p>Select a chat to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;