import React from 'react';

export const GlobeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c.502 0 1.004-.028 1.5-.083M12 15a9.004 9.004 0 0 0-8.716-6.747M12 15c.502 0 1.004-.028 1.5-.083M12 15a9.004 9.004 0 0 1 8.716-6.747M12 3c.502 0 1.004.028 1.5.083M12 3a9.004 9.004 0 0 0-8.716 6.747M12 3v18M3.284 8.251a9.002 9.002 0 0 1 17.432 0" 
    />
  </svg>
);