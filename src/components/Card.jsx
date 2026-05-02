import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`card hover:shadow-3xl hover:-translate-y-2 transition-all duration-300 group ${className}`}>
      {children}
    </div>
  );
};

export default Card;
