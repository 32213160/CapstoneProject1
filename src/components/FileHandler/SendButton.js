// src/components/FileHandler/SendButton.js
import React from 'react';

function SendButton({ onClick, disabled, text = "전송" }) {
  return (
    <button 
      className="send-button" 
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}

export default SendButton;
