import React from 'react';

export const Logo = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Colored bands exiting the prism downwards */}
    <path d="M 50 45 Q 70 38 90 60 L 90 40 Q 70 20 50 35 Z" fill="#4ade80" /> {/* Green */}
    <path d="M 50 50 Q 75 42 90 70 L 90 60 Q 70 38 50 45 Z" fill="#60a5fa" /> {/* Blue */}
    <path d="M 50 55 Q 80 46 90 80 L 90 70 Q 75 42 50 50 Z" fill="#d4af37" /> {/* Gold */}
    
    {/* White light entering from the left */}
    <line x1="10" y1="58" x2="43" y2="46" stroke="white" strokeWidth="2.5" />
    
    {/* The glass prism (triangle) */}
    <polygon points="50,15 85,80 15,80" fill="none" stroke="#a3a3a3" strokeWidth="4" strokeLinejoin="round" />
  </svg>
);
