import React, { useState } from 'react';
import './Canvas.css';

interface UserProps {
    userImageSrc: string; // Source URL for the user's image
    userName: string; // Name of the user
    userCount: number; // Count of users
}

const User: React.FC<UserProps> = ({
    userImageSrc,
    userName,
    userCount,
}) => {
    const [hovered, setHovered] = useState(false); // State to track if the user count is hovered

    // Function to handle mouse enter event
    const handleMouseEnter = () => {
        setHovered(true);
    };

    // Function to handle mouse leave event
    const handleMouseLeave = () => {
        setHovered(false);
    };

    return (
        <div className="user-container">
            <div className="user-info" title={userName}>
                <img
                    src={userImageSrc}
                    alt="User"
                    className="user-image"
                    onMouseEnter={handleMouseEnter} // Show tooltip on mouse enter
                    onMouseLeave={handleMouseLeave} // Hide tooltip on mouse leave
                />
                <div 
                    className="user-count" 
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {userCount}
                    {hovered && (
                        <div className="tooltip">
                            {userCount === 0 ? 'No user joined' : userName} {/* Display tooltip */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default User;
