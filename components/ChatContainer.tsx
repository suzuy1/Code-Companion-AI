import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message } from '../types';
import ChatMessage from './ChatMessage';
import { SendIcon } from './icons/SendIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { StopIcon } from './icons/StopIcon';

interface WelcomeScreenProps {
    onExampleClick: (prompt: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onExampleClick }) => {
    const examplePrompts = [
        { title: "Rancang komponen React lengkap", description: "untuk galeri gambar yang dapat digeser dengan lazy loading dan tampilan modal" },
        { title: "Buat kode dari gambar", description: "unggah screenshot desain UI dan minta saya membuatkan komponen React-nya" },
        { title: "Bandingkan framework JS terbaru", description: "dan berikan ringkasan pro dan kontranya berdasarkan info web terbaru" },
        { title: "Tulis skrip Python", description: "untuk melakukan web scraping pada sebuah situs dan menyimpan data ke file CSV, lengkap dengan penanganan kesalahan" },
    ];
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="w-16 h-16 rounded-full bg-gray-800/50 backdrop-blur-md flex items-center justify-center mb-6 border border-gray-700 animate-fadeInUp">
                <SparklesIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-100 animate-fadeInUp" style={{ animationDelay: '100ms' }}>Saya Cognito, Arsitek Perangkat Lunak AI Anda.</h1>
            <p className="text-base sm:text-lg text-gray-300 mt-2 animate-fadeInUp" style={{ animationDelay: '200ms' }}>Bagaimana kita bisa membangun sesuatu yang luar biasa hari ini?</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-12 w-full max-w-3xl">
                {examplePrompts.map((prompt, i) => (
                    <button 
                        key={i}
                        onClick={() => onExampleClick(`${prompt.title}${prompt.description.startsWith('dan') ? ' ' : ': '}${prompt.description}`)}
                        className="p-3 sm:p-4 bg-gray-950/70 backdrop-blur-sm rounded-xl text-left hover:bg-gray-900 transition-all duration-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-gray-500 border border-gray-800 animate-fadeInUp active:scale-95"
                        style={{ animationDelay: `${300 + i * 100}ms` }}>
                        <p className="font-semibold text-gray-200">{prompt.title}</p>
                        <p className="text-gray-400 text-sm">{prompt.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};


interface ChatContainerProps {
    messages: Message[];
    onSendMessage: (prompt: string, image?: { data: string; mimeType: string; preview: string }, useWebSearch?: boolean) => void;
    isLoading: boolean;
    onNewChat: () => void;
    onStopGeneration: () => void;
    onRetry: (sessionId: string, messageId: string) => void;
    activeSessionId: string | null;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ messages, onSendMessage, isLoading, onNewChat, onStopGeneration, onRetry, activeSessionId }) => {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [fileError, setFileError] = useState<string|null>(null);
  const [globeRotation, setGlobeRotation] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputAreaContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
      scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);
  
  useEffect(() => {
    // Reset state input hanya ketika sesi aktif berubah.
    // Ini mencegah reset yang tidak diinginkan saat re-render pada layar selamat datang (misalnya saat keyboard mobile muncul).
    setInput('');
    setImage(null);
    setUseWebSearch(false);
  }, [activeSessionId]);

  const handleInputFocus = useCallback(() => {
    // Perilaku ini untuk perangkat seluler di mana keyboard virtual dapat menutupi input.
    if (window.innerWidth < 768) { // Sesuai dengan breakpoint 'md' Tailwind
      // Kami menggunakan timeout untuk memungkinkan keyboard muncul dan viewport mengubah ukuran sebelum menggulir.
      setTimeout(() => {
        inputAreaContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 300);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setFileError("File is too large. Please select an image under 4MB.");
        setTimeout(() => setFileError(null), 4000);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        if (image?.preview) URL.revokeObjectURL(image.preview);
        setImage({
          data: base64String,
          mimeType: file.type,
          preview: URL.createObjectURL(file)
        });
        setUseWebSearch(false); // Disable web search when image is attached
        setFileError(null);
        textareaRef.current?.focus();
      };
      reader.readAsDataURL(file);
    }
    if(e.target) e.target.value = '';
  };

  const handleRemoveImage = () => {
    if (image) {
      URL.revokeObjectURL(image.preview);
      setImage(null);
      textareaRef.current?.focus();
    }
  };

  const handleSend = () => {
    if ((!input.trim() && !image) || isLoading) return;
    onSendMessage(input, image, useWebSearch);
    setInput('');
    if(image) {
      // Jangan revoke object URL di sini karena mungkin masih digunakan oleh App.tsx
      setImage(null);
    }
    // Don't reset web search, user might want to use it again.
  };
  
  const handleRetryClick = (messageId: string) => {
    if (activeSessionId) {
      onRetry(activeSessionId, messageId);
    }
  }

  const handleExampleClick = (prompt: string) => {
    if (isLoading) return;
    setInput(prompt);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  const canAttachImage = !useWebSearch;
  const canUseWebSearch = !image;

  const handleWebSearchToggle = () => {
    if (isLoading || !canUseWebSearch) return;
    const isTurningOn = !useWebSearch;
    setUseWebSearch(isTurningOn);
    setGlobeRotation(r => r + (isTurningOn ? 360 : -360));
  };

  const hasContent = input.trim().length > 0 || image !== null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-black/30">
        <div 
          className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6" 
          role="log"
          aria-live="polite"
        >
            {messages.length === 0 ? (
                <WelcomeScreen onExampleClick={handleExampleClick} />
            ) : (
                <div className="space-y-0">
                    {messages.map((msg) => (
                      <ChatMessage 
                        key={msg.id} 
                        message={msg} 
                        onRetry={msg.role === 'model' && msg.retryable ? handleRetryClick : undefined} 
                      />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            )}
        </div>

      <div className="w-full self-end px-2 sm:px-4 pb-3 pt-2">
         {fileError && <p className="text-red-400 text-sm mb-2 text-center" role="alert">{fileError}</p>}
        <div className="max-w-3xl mx-auto" ref={inputAreaContainerRef}>
          {image && (
              <div className="relative mb-2 w-16 h-16 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-gray-800 bg-gray-900 p-1 animate-fadeInUp">
                  <img src={image.preview} alt="Image preview" className="w-full h-full object-cover rounded" />
                  <button 
                      onClick={handleRemoveImage}
                      className="absolute top-0.5 right-0.5 bg-black/60 rounded-full text-white hover:bg-black/80 backdrop-blur-sm transition-all active:scale-95"
                      aria-label="Remove image"
                  >
                      <XCircleIcon className="w-6 h-6" />
                  </button>
              </div>
          )}
          <div className={`relative flex items-center bg-gray-950 backdrop-blur-md rounded-2xl border border-gray-800 shadow-lg transition-all overflow-hidden pl-1 mb-1 after:content-[''] after:absolute after:inset-0 after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)] after:transition-transform after:duration-700 ${isLoading ? 'after:animate-shimmer' : 'after:-translate-x-full'}`}>
              <style>{`
                @keyframes shimmer {
                    from {
                        transform: translateX(-100%);
                    }
                    to {
                        transform: translateX(100%);
                    }
                }
                .after\\:animate-shimmer::after {
                    animation: shimmer 1.5s infinite linear;
                }
              `}</style>
              <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  className="hidden" 
                  accept="image/*"
                  disabled={isLoading || !canAttachImage}
              />
              <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || !canAttachImage}
                  className="p-3 sm:p-1 text-gray-400 hover:text-gray-200 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-full disabled:text-gray-600 disabled:cursor-not-allowed"
                  aria-label="Attach image"
                  title={!canAttachImage ? "Cannot attach image when web search is enabled" : "Attach image"}
              >
                  <PaperclipIcon className="w-6 h-6" />
              </button>
              <button
                  onClick={handleWebSearchToggle}
                  disabled={isLoading || !canUseWebSearch}
                  className={`p-2 sm:p-1 transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full disabled:text-gray-600 disabled:cursor-not-allowed ${
                    useWebSearch
                        ? 'text-blue-400 shadow-[0_0_12px_2px_rgba(59,130,246,0.5)] bg-gray-900'
                        : 'text-gray-400 hover:text-gray-200'
                  }`}
                  aria-label="Toggle web search"
                  title={!canUseWebSearch ? "Cannot use web search with an image" : `Web search: ${useWebSearch ? 'On' : 'Off'}`}
              >
                  <GlobeIcon 
                    className="w-6 h-9 transition-transform duration-500 ease-in-out" 
                    style={{ transform: `rotate(${globeRotation}deg)` }} 
                  />
              </button>
              <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={handleInputFocus}
                  placeholder={image ? "Describe the image..." : "Kirim pesan ke Cognito..."}
                  className="w-full bg-transparent py-3 pl-2 pr-12 sm:pr-14 text-gray-200 placeholder-gray-500 focus:outline-none resize-none max-h-64"
                  rows={1}
                  disabled={isLoading}
                  aria-label="Chat input"
              />
              {isLoading ? (
                <button
                    onClick={onStopGeneration}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-white bg-red-600 hover:bg-red-500 transition-colors active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400"
                    aria-label="Stop generation"
                >
                    <StopIcon className="w-5 h-5" />
                </button>
              ) : (
                <button
                    onClick={handleSend}
                    disabled={!hasContent}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-white transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-500 enabled:bg-gray-700 enabled:hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed"
                    aria-label="Send message"
                >
                    <SendIcon className="w-5 h-5" />
                </button>
              )}
          </div>
          <p className="text-[10px] sm:text-xs text-center text-gray-600 pt-2">
              Cognito dapat membuat kesalahan. Pertimbangkan untuk memeriksa informasi penting.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;