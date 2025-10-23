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
        <div className="chat-container" style={{ display: 'flex', height: '100vh' }}>
            {/* LEFT SIDEBAR: USER LIST */}
            <div className="sidebar" style={{ width: '250px', borderRight: '1px solid #ccc', padding: '10px' }}>
                <header style={{ paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                    <p>Logged in as: <strong>{user?.username}</strong></p>
                    <button onClick={handleLogout}>Log Out</button>
                </header>
                
                <h4 style={{ marginTop: '15px' }}>Online Users</h4>
                {allUsers.length === 0 ? (
                    <p>No other users available</p>
                ) : (
                    allUsers.map((target) => (
                        <div 
                            key={target._id} 
                            onClick={() => selectChatTarget(target)}
                            style={{ 
                                padding: '10px', 
                                cursor: 'pointer', 
                                backgroundColor: chatTarget?._id === target._id ? '#e0f7fa' : 'transparent',
                                borderBottom: '1px dotted #eee'
                            }}
                        >
                            {target.username}
                        </div>
                    ))
                )}
            </div>

            {/* MAIN CHAT AREA */}
            <div className="chat-main" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <header style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
                    <h2>Chatting with {chatTarget?.username || 'Select a User'}</h2>
                </header>
                
                {!chatTarget ? (
                    <div style={{ flexGrow: 1, display: 'grid', placeItems: 'center' }}>
                        <p>Select a user from the left sidebar to start chatting.</p>
                    </div>
                ) : (
                    <>
                        <div className="message-area" style={{ flexGrow: 1, overflowY: 'scroll', padding: '10px' }}>
                            {messages.map((msg, index) => (
                                <div 
                                    key={index} 
                                    style={{ textAlign: msg.sender?._id === user._id ? 'right' : 'left', margin: '5px' }}
                                >
                                    <strong>{msg.sender?.username}:</strong> {msg.content}
                                </div>
                            ))}
                        </div>

                        <form onSubmit={sendChatMessage} style={{ display: 'flex', padding: '10px', borderTop: '1px solid #eee' }}>
                            <input 
                                type="text"
                                value={messageInput} // 💡 Bind value to new state
                                onChange={(e) => setMessageInput(e.target.value)} // 💡 Update new state
                                placeholder="Type a message..."
                                style={{ flexGrow: 1, padding: '10px' }}
                                disabled={!chatTarget}
                            />
                            <button type="submit" disabled={!chatTarget || !messageInput} style={{ padding: '10px' }}>Send</button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default Chat;