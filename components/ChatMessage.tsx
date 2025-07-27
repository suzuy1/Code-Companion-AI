import React, { useEffect, useRef } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { Message, MessageRole } from '../types';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import ThinkingIndicator from './ThinkingIndicator';
import CollapsibleSection from './CollapsibleSection';

marked.setOptions({
    breaks: true,
    gfm: true,
});

interface ChatMessageProps {
  message: Message;
  onRetry?: (messageId: string) => void;
}

const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
    const [copied, setCopied] = React.useState(false);
    const codeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (codeRef.current) {
            hljs.highlightElement(codeRef.current);
        }
    }, [code]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-lg my-4 overflow-hidden border border-gray-800 transition-all duration-200 hover:shadow-lg hover:shadow-gray-500/10 hover:ring-1 hover:ring-gray-700">
            <div className="flex justify-between items-center px-4 py-2 bg-black/50 text-xs text-gray-400">
                <span className="font-mono lowercase">{language || 'code'}</span>
                <button 
                    onClick={handleCopy} 
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-gray-300 transition-colors disabled:cursor-not-allowed disabled:bg-transparent disabled:text-green-400 hover:bg-gray-800/50 active:scale-95" 
                    disabled={copied}
                >
                    {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                    {copied ? 'Disalin!' : 'Salin'}
                </button>
            </div>
            <pre className="p-3 sm:p-4 text-sm overflow-x-auto m-0">
                <code ref={codeRef} className={`language-${language}`}>{code}</code>
            </pre>
        </div>
    );
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onRetry }) => {
  const isUser = message.role === MessageRole.USER;
  
  const renderMarkdown = (markdownContent: string) => {
    if (!markdownContent) return null;
    
    const parts = markdownContent.split(/(\`\`\`[a-zA-Z]*\n[\s\S]*?\n\`\`\`)/g);

    return parts.map((part, index) => {
      if (!part) return null;

      const codeBlockMatch = part.match(/\`\`\`([a-zA-Z]*)\n([\s\S]*?)\n\`\`\`/);
      
      if (codeBlockMatch) {
        const language = codeBlockMatch[1];
        const code = codeBlockMatch[2];
        return <CodeBlock key={index} language={language} code={code.trim()} />;
      } else {
        const rawMarkup = marked.parse(part.trim());
        return (
          <div
            key={index}
            className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:my-5 prose-ul:my-5 prose-ul:list-disc prose-ul:pl-6 prose-ol:my-5 prose-li:my-2 prose-h3:hidden prose-h4:mt-8 prose-h4:mb-4 prose-h5:mt-6 prose-h5:mb-3 prose-a:text-gray-400 hover:prose-a:underline prose-code:text-gray-300 prose-code:before:content-[''] prose-code:after:content-[''] prose-code:bg-black/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-strong:font-semibold prose-strong:text-gray-200"
            dangerouslySetInnerHTML={{ __html: rawMarkup as string }}
          />
        );
      }
    });
  };


  const renderContent = (content: string) => {
    if (message.isError) return null; // Error handled separately

    if (!content) {
        if (!isUser) {
            if (message.thinkingState) {
                return <ThinkingIndicator thinkingState={message.thinkingState} />;
            }
            return <div className="dot-flashing"></div>
        }
        return null;
    }

    const sectionRegex = /(^###\s.*$)/m;
    // Jika konten tidak mengikuti format terstruktur, render seperti biasa
    if (!sectionRegex.test(content)) {
        return renderMarkdown(content);
    }
    
    const rawParts = content.split(sectionRegex);
    
    const sections: { title: string; content: string }[] = [];
    const initialContent = rawParts[0] ? rawParts[0].trim() : '';

    if (rawParts.length > 1) {
        for (let i = 1; i < rawParts.length; i += 2) {
            const title = rawParts[i].trim();
            const sectionContent = rawParts[i + 1] ? rawParts[i + 1].trim() : '';
            sections.push({ title, content: sectionContent });
        }
    }
    
    if(sections.length === 0 && initialContent) {
        return renderMarkdown(initialContent);
    }

    return (
        <>
            {initialContent && renderMarkdown(initialContent)}
            <div className="mt-2 sm:mt-4 rounded-lg overflow-hidden border border-gray-800 bg-black/20">
              {sections.map(({ title, content }, index) => (
                  <CollapsibleSection
                      key={index}
                      title={title}
                      defaultOpen={title.includes('🛠️') || title.includes('✅')}
                  >
                      {renderMarkdown(content)}
                  </CollapsibleSection>
              ))}
            </div>
        </>
    );
  };
  
  return (
    <div className={`w-full ${isUser ? '' : 'bg-gray-950/70'} message-appear`}>
      <div className="max-w-3xl mx-auto px-2 py-4 sm:p-5">
        <div className={`w-full min-w-0 ${isUser ? 'flex flex-col items-end' : ''}`}>
            <p className={`font-semibold text-sm mb-1.5 ${isUser ? 'text-gray-200' : 'text-blue-400'}`}>
                {isUser ? 'Anda' : 'Cognito'}
            </p>

            {isUser ? (
                <>
                    {message.imageUrl && (
                        <div className="mb-2">
                            <a href={message.imageUrl} target="_blank" rel="noopener noreferrer">
                                <img src={message.imageUrl} alt="User upload" className="max-w-[200px] sm:max-w-xs max-h-64 rounded-lg border border-gray-800 hover:ring-2 ring-gray-500 transition-all" />
                            </a>
                        </div>
                    )}
                    {message.content && (
                        <div className="bg-blue-900/40 border border-blue-800/60 rounded-xl rounded-tr-none px-4 py-3 text-gray-200 max-w-full">
                            <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                    )}
                </>
            ) : (
                <>
                    {message.isError ? (
                         <div role="alert" className="p-3 sm:p-4 rounded-lg bg-red-900/20 border border-red-500/30 text-red-300 flex flex-col gap-3 animate-shake">
                            <div className="flex items-center gap-2 font-semibold">
                                <ExclamationTriangleIcon className="w-5 h-5" />
                                <span>Terjadi Kesalahan</span>
                            </div>
                            <p className="text-sm text-red-300/80 prose prose-invert max-w-none">{message.content}</p>
                            {onRetry && (
                               <button 
                                 onClick={() => onRetry(message.id)} 
                                 className="flex items-center justify-center gap-2 self-start mt-2 px-3 py-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-semibold transition-all active:scale-95"
                                >
                                 <ArrowPathIcon className="w-4 h-4" />
                                 Coba Lagi
                               </button>
                            )}
                         </div>
                    ) : renderContent(message.content)}

                   {message.sources && message.sources.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-gray-800 sm:mt-6 sm:pt-4">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-400 mb-3 animate-fadeInUp">
                          <GlobeIcon className="w-4 h-4" />
                          <span>Sumber Informasi</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                          {message.sources.map((source, i) => (
                            <a 
                              key={i} 
                              href={source.uri} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs bg-gray-900 hover:bg-gray-800 p-2 sm:p-3 rounded-lg truncate block transition-colors border border-gray-800 animate-fadeInUp"
                              title={source.title}
                              style={{ animationDelay: `${i * 100}ms` }}
                            >
                              <p className="truncate font-medium text-gray-400">{source.title}</p>
                              <p className="truncate text-gray-500 mt-1">{source.uri}</p>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                </>
            )}
        </div>
      </div>
      <style>{`
        .dot-flashing {
          position: relative;
          width: 8px;
          height: 8px;
          border-radius: 5px;
          background-color: #9ca3af; /* gray-400 */
          color: #9ca3af;
          animation: dotFlashing 1s infinite linear alternate;
          animation-delay: 0.5s;
          margin: 10px 0;
        }
        .dot-flashing::before,
        .dot-flashing::after {
          content: "";
          display: inline-block;
          position: absolute;
          top: 0;
        }
        .dot-flashing::before {
          left: -12px;
          width: 8px;
          height: 8px;
          border-radius: 5px;
          background-color: #9ca3af;
          color: #9ca3af;
          animation: dotFlashing 1s infinite alternate;
          animation-delay: 0s;
        }
        .dot-flashing::after {
          left: 12px;
          width: 8px;
          height: 8px;
          border-radius: 5px;
          background-color: #9ca3af;
          color: #9ca3af;
          animation: dotFlashing 1s infinite alternate;
          animation-delay: 1s;
        }

        @keyframes dotFlashing {
          0% {
            background-color: #9ca3af;
          }
          50%,
          100% {
            background-color: rgba(156, 163, 175, 0.2);
          }
        }
      `}</style>
    </div>
  );
};

export default ChatMessage;