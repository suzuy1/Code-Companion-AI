import React from 'react';

export const ChatBubbleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.722.28c-.443.034-.884.034-1.327 0l-3.722-.28c-1.133-.093-1.98-1.057-1.98-2.193V10.608c0-.97.616-1.813 1.5-2.097L16.5 8.28c.443-.135.903-.135 1.347 0l2.403.231Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 10.387c.848.252 1.5.982 1.5 1.82V18a2.25 2.25 0 0 0 2.25 2.25h1.5M13.5 10.387c.848.252 1.5.982 1.5 1.82V18a2.25 2.25 0 0 0 2.25 2.25h1.5"
    />
  </svg>
);
