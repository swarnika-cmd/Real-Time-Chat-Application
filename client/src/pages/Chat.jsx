// client/src/pages/Chat.jsx (Structurally Modified for 3-Panel UI)

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios'; 
// Optional: Import a placeholder icon like FaPaperclip for the right panel aesthetic
// import { FaPaperclip } from 'react-icons/fa'; 

const ENDPOINT = "http://localhost:5000"; 
let socket; 

const Chat = () => {
    const { user, token, dispatch } = useContext(AuthContext); 
    const navigate = useNavigate();
    
    const [allUsers, setAllUsers] = useState([]); 
    const [chatTarget, setChatTarget] = useState(null); 
    const [messages, setMessages] = useState([]); 
    const [messageInput, setMessageInput] = useState(''); 

    // --- EFFECT 1: SOCKET CONNECTION & DISCONNECTION ---
    useEffect(() => {
        // ... (existing socket connection logic remains the same) ...
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
        // ... (existing fetchUsers logic remains the same) ...
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
    
    // --- SEND MESSAGE HANDLER (Socket.io) ---
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

    // --- COMPONENT RENDER ---
    return (
        // 💡 Use class name for main container
        <div className="chat-container"> 
            {/* 1. LEFT SIDEBAR: USER LIST */}
            <div className="sidebar"> 
                <header className="sidebar-header">
                    <p>Logged in as: <strong>{user?.username}</strong></p>
                    <button onClick={handleLogout} className="logout-button">Log Out</button>
                </header>
                
                <h4 className="online-title">Online Users</h4>
                {allUsers.length === 0 ? (
                    <p className="no-users">No other users available</p>
                ) : (
                    allUsers.map((target) => (
                        <div 
                            key={target._id} 
                            onClick={() => selectChatTarget(target)}
                            className={`user-item ${chatTarget?._id === target._id ? 'selected' : ''}`}
                        >
                            {target.username}
                        </div>
                    ))
                )}
            </div>

            {/* 2. MAIN CHAT AREA */}
            <div className="chat-main">
                <header className="chat-header">
                    <h2>Chatting with {chatTarget?.username || 'Select a User'}</h2>
                </header>
                
                {!chatTarget ? (
                    <div className="welcome-message-area">
                        <p>Select a user from the left sidebar to start chatting.</p>
                    </div>
                ) : (
                    <>
                        <div className="message-area">
                            {messages.map((msg, index) => (
                                <div 
                                    key={index} 
                                    className={`message-bubble ${msg.sender?._id === user._id ? 'sent' : 'received'}`} 
                                >
                                    {/* Display content and sender name (optional, useful for debugging) */}
                                    {msg.content}
                                </div>
                            ))}
                        </div>

                        <form onSubmit={sendChatMessage} className="message-form">
                            <input 
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                placeholder="Type a message..."
                                className="message-input"
                                disabled={!chatTarget}
                            />
                            {/* 💡 Right panel button placeholder (optional) */}
                            {/* <button type="button" className="attachment-button"> <FaPaperclip /> </button> */}
                            <button type="submit" disabled={!chatTarget || !messageInput} className="send-button">Send</button>
                        </form>
                    </>
                )}
            </div>
            
            {/* 3. NEW RIGHT PANEL: Placeholder for attachments/info */}
            <div className="right-panel">
                <div className="info-box">
                    <h4 className="accent-color" style={{marginBottom: '15px'}}>Conversation Info</h4>
                    <p style={{color: '#B0BACC'}}>This panel can display shared files, starred messages, or user details.</p>
                    <p style={{color: '#B0BACC', marginTop: '10px'}}>User: {chatTarget?.username || 'None'}</p>
                </div>
            </div>
        </div>
    );
};

export default Chat;