import React, { useState, ChangeEvent, KeyboardEvent } from 'react';
import './Canvas.css';

interface Message {
  text: string;
  sender: 'user' | 'sender';
}

function LiveChat() {
  const [messages, setMessages] = useState<Message[]>([]); // State to store chat messages
  const [inputValue, setInputValue] = useState(''); // State to store the input value

  // Function to handle sending a message
  const handleSendMessage = () => {
    if (inputValue.trim() !== '') { // Check if the input is not empty
      const userMessage: Message = { text: inputValue, sender: 'user' }; // Create a user message object
      setMessages(prevMessages => [...prevMessages, userMessage]); // Add the user message to the messages array

      const senderMessage = getSenderResponse(inputValue.toLowerCase()); // Get the sender response
      if (senderMessage) {
        setTimeout(() => {
          setMessages(prevMessages => [...prevMessages, senderMessage]); // Add the sender message to the messages array after a delay
        }, 500);
      }

      setInputValue(''); // Clear the input field
    }
  };

  // Function to handle input changes
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value); // Update the input value state
  };

  // Function to handle key down events
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent the default behavior
      handleSendMessage(); // Call the send message function
    }
  };

  // Function to get the sender's response
  const getSenderResponse = (input: string): Message | null => {
    let senderResponse: Message | null = null;

    if (input) {
      senderResponse = { text: 'Thank you for your message!', sender: 'sender' }; // Create a sender response message
    }

    return senderResponse;
  };

  return (
    <div className="livechat-container">
      <div className="header">Live Chat</div> {/* Chat header */}
      <div className="livechat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender === 'user' ? 'user-message' : 'sender-message'}`}
          >
            {message.text} {/* Display message text */}
          </div>
        ))}
      </div>
      <div className="livechat-input">
        <input
          type="text"
          placeholder="Type your message here..."
          value={inputValue} // Bind input value to state
          onChange={handleInputChange} // Handle input changes
          onKeyDown={handleKeyDown} // Handle key down events
        />
        <button onClick={handleSendMessage} className="glowing-icon">Send</button> {/* Send button */}
      </div>
    </div>
  );
}

export default LiveChat;
