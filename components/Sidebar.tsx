import React, { useState, useRef, useEffect } from 'react';
import { ChatSession } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { XIcon } from './icons/XIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { EllipsisVerticalIcon } from './icons/EllipsisVerticalIcon';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id:string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  isOpen,
  setIsOpen
}) => {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  // Efek untuk menutup menu saat pengguna mengklik di luar area menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        // Jika klik bukan di dalam container menu, tutup menu
        if (!(event.target as Element).closest('[data-menu-container]')) {
            setMenuOpenId(null);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRenameStart = (session: ChatSession) => {
    setRenamingId(session.id);
    setRenameValue(session.title);
    setMenuOpenId(null); // Tutup menu setelah memilih opsi
  };
  
  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (renamingId && renameValue.trim()) {
      onRenameSession(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };
  
  const handleRenameCancel = () => {
    setRenamingId(null);
  };

  const sortedSessions = [...sessions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-20 md:hidden sidebar-transition ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      ></div>
      <aside className={`absolute md:relative z-30 flex flex-col w-64 bg-black h-full text-white flex-shrink-0 sidebar-transition transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex items-center justify-between p-2 border-b border-gray-800">
          <button
            onClick={onNewChat}
            className="flex items-center w-full gap-2 p-2 rounded-md hover:bg-gray-900 transition-all duration-150 active:scale-95 text-sm font-semibold"
          >
            <PlusIcon className="w-5 h-5" />
            Obrolan Baru
          </button>
          <button onClick={() => setIsOpen(false)} className="p-2 md:hidden hover:bg-gray-900 rounded-md transition-colors active:scale-95">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {sortedSessions.map((session) => (
            <div
              key={session.id}
              className={`group flex items-center w-full p-2 rounded-md cursor-pointer transition-all duration-150 active:scale-[0.98] ${
                activeSessionId === session.id ? 'bg-gray-800' : 'hover:bg-gray-900'
              }`}
              onClick={() => renamingId !== session.id && onSelectSession(session.id)}
            >
              <ChatBubbleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
              {renamingId === session.id ? (
                 <form onSubmit={handleRenameSubmit} className="flex-1">
                   <input
                     ref={renameInputRef}
                     type="text"
                     value={renameValue}
                     onChange={(e) => setRenameValue(e.target.value)}
                     onBlur={handleRenameCancel}
                     className="w-full bg-gray-800 text-white p-0.5 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
                   />
                 </form>
              ) : (
                <span className="flex-1 truncate text-sm">{session.title}</span>
              )}
             
              {renamingId !== session.id && activeSessionId === session.id && (
                <div className="ml-auto pl-1" data-menu-container>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === session.id ? null : session.id);
                      }}
                      className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-gray-100 transition-colors active:scale-95"
                      aria-haspopup="true"
                      aria-expanded={menuOpenId === session.id}
                      aria-label="Opsi obrolan"
                    >
                      <EllipsisVerticalIcon className="w-5 h-5" />
                    </button>
                    {menuOpenId === session.id && (
                      <div
                        className="absolute right-0 top-full mt-1.5 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-20 py-1"
                        role="menu"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameStart(session);
                          }}
                          className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-800 transition-colors active:scale-95"
                          role="menuitem"
                        >
                          <PencilIcon className="w-4 h-4 mr-3" />
                          Ubah Nama
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Apakah Anda yakin ingin menghapus obrolan ini?')) {
                              onDeleteSession(session.id);
                            }
                            setMenuOpenId(null);
                          }}
                          className="flex items-center w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors active:scale-95"
                          role="menuitem"
                        >
                          <TrashIcon className="w-4 h-4 mr-3" />
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;