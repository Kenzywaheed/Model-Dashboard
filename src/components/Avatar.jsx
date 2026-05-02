import React from 'react';

const Avatar = ({ src, size = 'w-12 h-12', className = '' }) => {
  return (
    <img
      src={src}
      alt="Avatar"
      className={`${size} rounded-full object-cover border-2 border-white shadow-md ${className}`}
    />
  );
};

export default Avatar;
