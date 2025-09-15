import React, { useState } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div 
        className="relative flex items-center"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-xs bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-xs rounded-md py-1 px-3 z-20 pointer-events-none shadow-lg whitespace-nowrap animate-fade-in" role="tooltip">
          {text}
           <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900 dark:border-t-gray-100"></div>
        </div>
      )}
    </div>
  );
};
