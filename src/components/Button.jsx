import React from 'react';

const Button = ({ children, variant = 'primary', className = '', onClick, ...props }) => {
  const base = 'px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0';
  const variants = {
    accept: 'bg-emerald-500 text-white hover:bg-emerald-600',
    reject: 'bg-red-500 text-white hover:bg-red-600',
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
