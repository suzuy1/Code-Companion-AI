import React from 'react';
import { MenuIcon } from './icons/MenuIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface HeaderProps {
    onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
    return (
        <header className="relative flex items-center justify-center p-2 h-16 flex-shrink-0 border-b border-gray-800 bg-black/60 backdrop-blur-sm">
            <button 
                onClick={onToggleSidebar} 
                className="absolute left-2 p-2 md:hidden text-gray-400 hover:text-gray-200 transition-colors"
                aria-label="Open sidebar"
            >
                <MenuIcon className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
                <SparklesIcon className="w-6 h-6 text-blue-400" />
                <h1 className="text-lg font-semibold text-blue-400">Cognito</h1>
            </div>
        </header>
    );
};

export default Header;
