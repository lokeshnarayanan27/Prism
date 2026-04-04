import React from 'react';

export const Logo = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Colored bands — miniature palette: olive, amber, sky */}
    <path d="M 50 45 Q 70 38 90 60 L 90 40 Q 70 20 50 35 Z" fill="#7FAF4A" /> {/* Olive green */}
    <path d="M 50 50 Q 75 42 90 70 L 90 60 Q 70 38 50 45 Z" fill="#C8A84B" /> {/* Warm amber */}
    <path d="M 50 55 Q 80 46 90 80 L 90 70 Q 75 42 50 50 Z" fill="#7AADCB" /> {/* Sky blue */}

    {/* Warm light entering from the left */}
    <line x1="10" y1="58" x2="43" y2="46" stroke="#F0EAD6" strokeWidth="2.5" />

    {/* The glass prism */}
    <polygon points="50,15 85,80 15,80" fill="none" stroke="#9A8F78" strokeWidth="4" strokeLinejoin="round" />
  </svg>
);
