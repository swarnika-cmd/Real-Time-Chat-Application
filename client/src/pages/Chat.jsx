// client/src/pages/Chat.jsx

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios'; 

const ENDPOINT = "http://localhost:5000"; 
let socket; 

const Chat = () => {
    const { user, token, dispatch } = useContext(AuthContext); 
    const navigate = useNavigate();
    
    const [allUsers, setAllUsers] = useState([]); 
    const [chatTarget, setChatTarget] = useState(null); 
    const [messages, setMessages] = useState([]); 
    const [messageInput, setMessageInput] = useState(''); // 💡 State for the input field

    // --- EFFECT 1: SOCKET CONNECTION & DISCONNECTION ---
    useEffect(() => {
        socket = io(ENDPOINT); 
        
        socket.on('message_received', (newMessage) => {
            // Check if the received message is for the currently open chat
            if (chatTarget && (newMessage.sender._id === chatTarget._id || newMessage.receiver._id === chatTarget._id)) {
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [chatTarget, user]); // Re-run if chatTarget or user changes

    // --- EFFECT 2: FETCH ALL USERS ---
    useEffect(() => {
        if (!token) return;

        const fetchUsers = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                
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
        setMessages([]); // Clear previous messages
        
        // 1. Join the chat room (Socket.io)
        const roomId = user._id < targetUser._id ? `${user._id}_${targetUser._id}` : `${targetUser._id}_${user._id}`;
        socket.emit('join_chat', roomId);

        // 2. Fetch Message History (REST API)
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            // Call the GET /api/messages/:receiverId endpoint
            const response = await axios.get(`${ENDPOINT}/api/messages/${targetUser._id}`, config);
            
            // Update state with old messages
            setMessages(response.data); 
            
        } catch (error) {
            console.error('Failed to fetch message history:', error.response?.data?.message || error.message);
        }
    };
    
    // --- SEND MESSAGE HANDLER (Socket.io) ---
    const sendChatMessage = async (e) => { // 💡 Make async to send to REST API if needed
        e.preventDefault();
        
        if (messageInput.trim() === '' || !chatTarget) return;

        const messageData = {
            // 💡 Ensure the target ID is passed to the REST API
            receiverId: chatTarget._id, 
            content: messageInput,
            // 💡 Ensure the room ID logic is consistent for broadcasting
            roomId: user._id < chatTarget._id ? `${user._id}_${chatTarget._id}` : `${chatTarget._id}_${user._id}`, 
        };
        
        try {
            // 1. Send to REST API to save to MongoDB
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // The response will contain the saved, populated message object
            const savedMessage = await axios.post(`${ENDPOINT}/api/messages`, messageData, config);
            
            // 2. Emit the SAVED message object to the room via socket
            socket.emit('new_message', savedMessage.data); 
            
            // 3. Add the saved message to local state immediately
            setMessages((prevMessages) => [...prevMessages, savedMessage.data]);
            
            setMessageInput(''); // Clear input
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    // --- COMPONENT RENDER ---
    return (
        // 💡 Use class name for main container
        <div className="chat-container"> 
            {/* LEFT SIDEBAR: USER LIST */}
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

            {/* MAIN CHAT AREA */}
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
                                    // 💡 Dynamic class for sender/receiver alignment
                                    className={`message-bubble ${msg.sender?._id === user._id ? 'sent' : 'received'}`} 
                                >
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
                            <button type="submit" disabled={!chatTarget || !messageInput} className="send-button">Send</button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default Chat;