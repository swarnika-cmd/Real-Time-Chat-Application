// client/src/components/AvatarSelector.jsx (NEW FILE - Placeholder Structure)

import React, { useState } from 'react';

const EMOJI_AVATARS = ['😊', '🚀', '🎨', '🎮', '🎵', '⚡', '🌟', '🔥', '💎', '🦄', '🐱', '🌈'];

const AvatarSelector = ({ selectedAvatar, currentAvatarType, onSelect, onClose }) => {
    const [tempAvatar, setTempAvatar] = useState(selectedAvatar);
    const [tempAvatarType, setTempAvatarType] = useState(currentAvatarType);

    const handleSave = () => {
        onSelect(tempAvatar, tempAvatarType);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Update Your Avatar</h3>
                <div className="current-selection" style={{ fontSize: '3em' }}>
                    {tempAvatar}
                </div>

                <div className="avatar-picker-grid">
                    {EMOJI_AVATARS.map((emoji) => (
                        <button
                            key={emoji}
                            className={`emoji-btn ${tempAvatar === emoji ? 'selected' : ''}`}
                            onClick={() => {
                                setTempAvatar(emoji);
                                setTempAvatarType('emoji');
                            }}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>

                <div className="modal-actions">
                    <button onClick={onClose} className="cancel-btn">Cancel</button>
                    <button onClick={handleSave} className="save-btn">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default AvatarSelector;