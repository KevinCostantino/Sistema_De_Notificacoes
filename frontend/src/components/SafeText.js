import React from 'react';

/**
 * Component to safely render UTF-8 text
 */
const SafeText = ({ children, className, ...props }) => {
  const processText = (text) => {
    if (typeof text !== 'string') return text;
    
    // Ensure proper UTF-8 encoding
    try {
      // If text contains encoded characters, decode them
      if (text.includes('%') || text.includes('&')) {
        return decodeURIComponent(text.replace(/&amp;/g, '&'));
      }
      return text;
    } catch (e) {
      return text;
    }
  };

  return (
    <span className={className} {...props}>
      {processText(children)}
    </span>
  );
};

export default SafeText;