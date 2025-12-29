
import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`w-full py-8 group transition-colors duration-300 animate-slide-up ${isAssistant ? 'bg-white/[0.02]' : 'bg-transparent'}`}>
      <div className="max-w-4xl mx-auto px-6 flex gap-5 md:gap-8">
        <div className="flex-shrink-0 pt-1">
          {isAssistant ? (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-[0_4px_12px_rgba(20,184,166,0.3)] flex items-center justify-center text-white text-sm transform transition-transform group-hover:scale-110">
              <i className="fas fa-sparkles"></i>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-[0_4px_12px_rgba(147,51,234,0.3)] flex items-center justify-center text-white text-sm font-bold transform transition-transform group-hover:scale-110">
              U
            </div>
          )}
        </div>
        <div className="flex-1 space-y-4 overflow-hidden">
          <div className="flex items-center gap-3">
             <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
               {isAssistant ? 'Zephyr AI' : 'You'}
             </span>
             <span className="text-[10px] text-gray-600 font-medium">
               {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </span>
          </div>
          <div className="text-gray-200 leading-relaxed whitespace-pre-wrap break-words text-sm md:text-base selection:bg-teal-500/30">
            {message.content}
          </div>
          
          {isAssistant && message.groundingSources && message.groundingSources.length > 0 && (
            <div className="mt-6 pt-5 border-t border-white/5">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <i className="fas fa-earth-americas text-[10px]"></i> Sources & References
              </div>
              <div className="flex flex-wrap gap-2">
                {message.groundingSources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-teal-400/90 transition-all hover:scale-[1.02] shadow-sm"
                  >
                    <i className="fas fa-link text-[10px] text-gray-500"></i>
                    <span className="truncate max-w-[180px] font-medium">{source.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
