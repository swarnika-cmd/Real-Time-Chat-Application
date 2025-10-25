// client/src/components/EmojiPicker.jsx (Final Simplified Version)

import React, { useState, useRef, useEffect } from 'react';
import { FaSmile } from 'react-icons/fa'; // Icon for the button

// 💡 Use the defined list of emojis (from your provided context)
const EMOJIS = [
    '👍', '😂', '🔥', '❤️', '🙏', '💯', '🤔', '😊', '😭', '🤯', 
    '🚀', '⭐', '🍕', '🍻', '🎉', '💻', '💡', '✅', '❌', '🥳'
];

const EmojiPicker = ({ onEmojiSelect }) => {
    const [showPicker, setShowPicker] = useState(false);
    const pickerRef = useRef(null);

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setShowPicker(false);
            }
        };

        if (showPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPicker]);

    // Handler for static emoji click
    const handleEmojiClick = (emoji) => {
        onEmojiSelect(emoji);
        setShowPicker(false);
    };

    return (
        <div className="emoji-picker-container" ref={pickerRef}>
            <button
                type="button"
                className="icon-btn emoji-toggle-btn" // Use the established icon-btn class
                onClick={() => setShowPicker(!showPicker)}
                title="Open emoji picker"
            >
                <FaSmile size={18} /> 
            </button>

            {showPicker && (
                <div className="emoji-dropdown-panel">
                    {/* 💡 CORRECTION: Render the simple static emoji list */}
                    {EMOJIS.map((emoji) => (
                        <span
                            key={emoji}
                            className="emoji-item"
                            onClick={() => handleEmojiClick(emoji)}
                        >
                            {emoji}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EmojiPicker;