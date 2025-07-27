import React, { useState } from 'react';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const cleanTitle = title.replace(/^###\s*/, '').replace(/\*\*/g, '');

    return (
        <div className="border-t border-gray-800 first:border-t-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center px-3 py-3 sm:p-4 text-left text-gray-300 hover:text-gray-100 transition-colors"
                aria-expanded={isOpen}
            >
                <h3 className="text-sm sm:text-base font-semibold m-0 p-0">{cleanTitle}</h3>
                <ChevronDownIcon
                    className={`w-6 h-6 transition-transform duration-300 ease-in-out flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <div
                className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
              <div className="overflow-hidden">
                <div className="px-3 pt-0 pb-3 sm:px-4 sm:pb-4">
                    {children}
                </div>
              </div>
            </div>
        </div>
    );
};

export default CollapsibleSection;