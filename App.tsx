import React, { useState, useEffect } from 'react';
import ChatContainer from './components/ChatContainer';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AuroraBackground from './components/AuroraBackground';
import { useChatSessions } from './hooks/useChatSessions';
import { useGeminiChat } from './hooks/useGeminiChat';
import { useSwipe } from './hooks/useSwipe';
import { useViewportHeight } from './hooks/useViewportHeight';
import { DEFAULT_MODEL } from './constants';

const App: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const viewportHeight = useViewportHeight();

  // Implementasi gestur geser untuk UX mobile yang lebih baik
  useSwipe({
    onSwipeRight: () => {
      if (!isSidebarOpen) {
        setSidebarOpen(true);
      }
    },
    edgeThreshold: 60, // Membutuhkan gesekan untuk dimulai dalam 60px dari tepi kiri
  });

  const {
    sessions,
    activeSessionId,
    handleNewChat: baseHandleNewChat,
    handleSelectSession: baseHandleSelectSession,
    handleDeleteSession,
    handleRenameSession,
    updateSession,
    createNewSession,
  } = useChatSessions();

  const { isLoading, handleSendMessage, handleStopGeneration, handleRetry } = useGeminiChat({
    sessions,
    activeSessionId,
    updateSession,
    createNewSession,
    model: DEFAULT_MODEL, // Selalu gunakan model default
  });
  
  const handleNewChat = () => {
    baseHandleNewChat();
    setSidebarOpen(false);
  };
  
  const handleSelectSession = (id: string) => {
    baseHandleSelectSession(id);
    setSidebarOpen(false);
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    // FIX: Menggunakan tinggi viewport dinamis dari hook JS (`useViewportHeight`)
    // lebih andal daripada `h-dvh` di CSS untuk mengatasi masalah keyboard mobile.
    // Ini memastikan container utama selalu menyesuaikan dengan ukuran area yang terlihat.
    <div 
      className="w-screen bg-black text-white flex flex-col relative overflow-hidden"
      style={{ height: viewportHeight }}
    >
      <AuroraBackground />
      
      <Header 
        onToggleSidebar={() => setSidebarOpen(true)}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onNewChat={handleNewChat}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          isOpen={isSidebarOpen}
          setIsOpen={setSidebarOpen}
        />
        
        <main className="flex-1 flex flex-col transition-all duration-300 relative min-w-0">
          <ChatContainer
            messages={activeSession?.messages || []}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onNewChat={handleNewChat}
            onStopGeneration={handleStopGeneration}
            onRetry={handleRetry}
            activeSessionId={activeSessionId}
          />
        </main>
      </div>
    </div>
  );
};

export default App;