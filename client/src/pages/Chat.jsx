// client/src/pages/Chat.jsx - Final Integration for Emoji Sending

import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

// Context and Services
import { AuthContext } from '../context/AuthContext';
import authService from '../services/authService';

// 💡 NEW IMPORTS: Import API URLs and EmojiPicker component
import { API_BASE_URL } from '../config/api'; 
import EmojiPicker from '../components/EmojiPicker'; // Assuming you created this component

// Icons
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

const ENDPOINT = API_BASE_URL; 
let socket;

const Chat = () => {
    const { user, token, dispatch } = useContext(AuthContext);
    const navigate = useNavigate();
    
    // State
    const [allUsers, setAllUsers] = useState([]);
    const [chatTarget, setChatTarget] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState(''); // Text input state
    const [searchQuery, setSearchQuery] = useState('');
    
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null); // Ref added for potential future file uploads

    // --- UTILITY FUNCTIONS ---
    const getInitials = (name) => name ? name.charAt(0).toUpperCase() : '?';
    
    const formatTime = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    // 💡 EMOJI HANDLER: Inserts emoji into the message input field
    const handleEmojiSelect = (emoji) => {
        setMessageInput(prev => prev + emoji);
    };
    
    // Placeholder for isUserOnline (to avoid errors with the advanced UI structure)
    const isUserOnline = () => false; 

    // --- EFFECTS & DATA FETCHING ---

    // Socket connection
   // --- EFFECTS & DATA FETCHING ---

// Socket connection - Initialize ONCE
useEffect(() => {
    socket = io(ENDPOINT, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });

    // Connection established
    socket.on('connect', () => {
        console.log('✅ Socket connected:', socket.id);
        if (user?._id) {
            socket.emit('user-online', user._id);
        }
    });

    // Connection error
    socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
    });

    // Listen for user status changes
    socket.on('user-status-change', ({ userId, status }) => {
        console.log(`👤 User ${userId} is now ${status}`);
        // You can update user list here if needed
    });

    return () => {
        console.log('🔌 Disconnecting socket');
        socket.disconnect();
    };
}, [user]); // Only depend on user, not chatTarget!

// Separate useEffect for listening to messages
useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage) => {
        console.log('📨 Message received:', newMessage);
        
        // Update messages if it's for the current conversation
        if (chatTarget) {
            const isForCurrentChat = 
                (newMessage.sender?._id === chatTarget._id || newMessage.sender === chatTarget._id) ||
                (newMessage.receiver?._id === chatTarget._id || newMessage.receiver === chatTarget._id);
            
            if (isForCurrentChat) {
                setMessages((prevMessages) => {
                    // Prevent duplicate messages
                    const isDuplicate = prevMessages.some(msg => 
                        msg._id === newMessage._id || 
                        (msg.content === newMessage.content && 
                         msg.createdAt === newMessage.createdAt)
                    );
                    
                    if (isDuplicate) return prevMessages;
                    return [...prevMessages, newMessage];
                });
            }
        }
    };

    socket.on('receive-message', handleReceiveMessage);

    // Cleanup
    return () => {
        socket.off('receive-message', handleReceiveMessage);
    };
}, [chatTarget, socket]);

// Handle room joining when chat target changes
useEffect(() => {
    if (!chatTarget || !socket) return;

    const roomId = user._id < chatTarget._id 
        ? `${user._id}_${chatTarget._id}` 
        : `${chatTarget._id}_${user._id}`;

    console.log('🚪 Joining room:', roomId);
    socket.emit('join_chat', roomId);

    return () => {
        console.log('🚪 Leaving room:', roomId);
        socket.emit('leave_chat', roomId);
    };
}, [chatTarget, socket, user._id]);
    // Fetch all users
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

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Logout handler
    const handleLogout = () => {
        authService.logout();
        dispatch({ type: 'LOGOUT' });
        navigate('/login');
    };
    
    // Select chat target
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
    
    // 💡 SEND MESSAGE HANDLER (Called by form onSubmit)
    // 💡 SEND MESSAGE HANDLER (Called by form onSubmit)
const sendChatMessage = async (e) => {
    e.preventDefault(); 
    
    if (messageInput.trim() === '' || !chatTarget) return;

    const messageData = {
        receiverId: chatTarget._id,
        content: messageInput,
    };
    
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const savedMessage = await axios.post(`${ENDPOINT}/api/messages`, messageData, config);
        
        console.log('📤 Sending message via socket:', savedMessage.data);
        
        // Emit with the CORRECT event name that backend is listening for
        socket.emit('send-message', savedMessage.data);
        
        // Add message to UI immediately
        setMessages((prevMessages) => [...prevMessages, savedMessage.data]);
        setMessageInput('');
    } catch (error) {
        console.error("Failed to send message:", error);
        alert('Failed to send message. Please try again.');
    }
};

    // Filter users
    const filteredUsers = allUsers.filter(u => 
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="chat-app-container">
            {/* LEFT NAVIGATION SIDEBAR & CHAT LIST PANEL (Omitted for brevity, assumed correct) */}
            {/* ... */}

            {/* 2. CHAT LIST PANEL */}
            <div className="chat-list-panel">
                 {/* ... chat list rendering ... */}
                 <div className="chat-list-header">
                    <div className="header-title-row">
                        <h2>Chats</h2>
                        <button className="more-btn"><FaEllipsisH /></button>
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
                        <p style={{ textAlign: 'center', color: '#a0aec0', padding: '20px' }}>No users found</p>
                    ) : (
                        filteredUsers.map((targetUser) => (
                            <div key={targetUser._id} className={`chat-list-item ${chatTarget?._id === targetUser._id ? 'active' : ''}`} onClick={() => selectChatTarget(targetUser)}>
                                <div className="chat-avatar">{getInitials(targetUser.username)}<span className="online-indicator"></span></div>
                                <div className="chat-info"><div className="chat-name">{targetUser.username}</div><div className="chat-preview">Click to start chatting</div></div>
                                <div className="chat-time">now</div>
                            </div>
                        ))
                    )}
                 </div>
            </div>

            {/* MAIN CHAT AREA */}
            <div className="main-chat-area">
                {!chatTarget ? (
                    <div className="no-chat-selected">
                        <FaComments size={64} style={{ color: '#cbd5e0' }} />
                        <h3>Welcome to PINSTAGRAM</h3>
                        <p>Select a conversation to start messaging</p>
                    </div>
                ) : (
                    <>
                        <div className="chat-area-header">
                            <div className="header-user-info">
                                <div className="chat-avatar large">{getInitials(chatTarget.username)}<span className="online-indicator"></span></div>
                                <div><h3>{chatTarget.username}</h3><div className="status-text">Active now</div></div>
                            </div>
                            <button className="more-btn"><FaEllipsisH size={20} /></button>
                        </div>

                        <div className="messages-container">
                            {messages.length === 0 ? (
                                <div className="empty-messages"><p>No messages yet. Start the conversation!</p></div>
                            ) : (
                                messages.map((msg, index) => {
                                    const isSent = msg.sender?._id === user._id;
                                    return (
                                        <div key={index} className={`message-row ${isSent ? 'sent' : 'received'}`}>
                                            <div className="message-avatar">{getInitials(isSent ? user.username : chatTarget.username)}</div>
                                            <div className="message-content"><div className="message-bubble">{msg.content}</div><div className="message-time">{formatTime(msg.createdAt)}</div></div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* 💡 MESSAGE INPUT AREA - Corrected to use <form> */}
                        <div className="message-input-area">
                            
                            {/* Input for file uploads (must be outside the main form controls) */}
                            <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} /> 

                            {/* 💡 The Form wraps the input and send button */}
                            <form className="message-form-controls" onSubmit={sendChatMessage}>
                                
                                {/* Attachment Button (Type=Button, prevents submission) */}
                                <button type="button" className="attachment-btn">
                                    <FaPaperclip size={18} />
                                </button>
                                
                                {/* 💡 Emoji Picker Component */}
                                <EmojiPicker onEmojiSelect={handleEmojiSelect} />

                                <input
                                    type="text"
                                    className="message-input-field"
                                    placeholder="Type a message..."
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                />
                                
                                {/* Send Message Button (Type=Submit, triggers form) */}
                                <button 
                                    type="submit" 
                                    className="send-message-btn"
                                    disabled={!messageInput.trim()}
                                >
                                    <FaPaperPlane size={16} />
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>

            {/* RIGHT SIDEBAR (Omitted for brevity, remains the same) */}
            {/* ... */}
        </div>
    );
};

export default Chat;