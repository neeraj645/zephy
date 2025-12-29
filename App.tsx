
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import { Chat, Message } from './types';
import { generateGeminiResponse } from './services/geminiService';

const App: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const savedChats = localStorage.getItem('zephyr_pro_chats');
    if (savedChats) {
      const parsed = JSON.parse(savedChats);
      setChats(parsed);
      if (parsed.length > 0 && !activeChatId) {
        setActiveChatId(parsed[0].id);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('zephyr_pro_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chats, activeChatId, isThinking]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  const handleNewChat = useCallback(() => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: '',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, []);

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChats(prev => prev.filter(c => c.id !== id));
    if (activeChatId === id) {
      setActiveChatId(null);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isThinking) return;

    let currentChatId = activeChatId;
    let updatedChats = [...chats];

    if (!currentChatId) {
      const newChat: Chat = {
        id: Date.now().toString(),
        title: input.slice(0, 30) + (input.length > 30 ? '...' : ''),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      currentChatId = newChat.id;
      updatedChats = [newChat, ...updatedChats];
      setChats(updatedChats);
      setActiveChatId(currentChatId);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    const targetChat = updatedChats.find(c => c.id === currentChatId)!;
    targetChat.messages.push(userMessage);
    if (!targetChat.title) {
        targetChat.title = input.slice(0, 40) + (input.length > 40 ? '...' : '');
    }
    targetChat.updatedAt = Date.now();
    
    setChats([...updatedChats]);
    setInput('');
    setIsThinking(true);

    try {
      const result = await generateGeminiResponse(targetChat.messages);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.text,
        timestamp: Date.now(),
        groundingSources: result.sources
      };

      setChats(prev => prev.map(c => {
        if (c.id === currentChatId) {
          return {
            ...c,
            messages: [...c.messages, assistantMessage],
            updatedAt: Date.now(),
          };
        }
        return c;
      }));
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: "An unexpected error occurred. Please check your connection or API key.",
        timestamp: Date.now(),
      };
      setChats(prev => prev.map(c => 
        c.id === currentChatId ? { ...c, messages: [...c.messages, errorMessage] } : c
      ));
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#050505] text-[#e5e5e5] overflow-hidden font-jakarta">
      <Sidebar 
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-b from-[#0a0a0a] to-[#050505]">
        {/* Background Decorative Blurs */}
        <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-black/40 backdrop-blur-xl z-20 transition-all duration-300">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition-all border border-transparent hover:border-white/10"
            >
              <i className={`fas ${isSidebarOpen ? 'fa-align-left' : 'fa-align-justify'} text-lg`}></i>
            </button>
            <div className="h-6 w-[1px] bg-white/10"></div>
            <div className="flex items-center gap-2.5">
               <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
               <span className="font-bold tracking-tight text-white/90">Zephyr 3.0 Pro</span>
               <span className="hidden md:inline px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[9px] font-bold text-gray-500 uppercase tracking-widest">Experimental</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="p-2 hover:bg-white/5 text-gray-400 hover:text-white rounded-lg transition-all border border-transparent hover:border-white/10">
               <i className="far fa-share-square"></i>
             </button>
          </div>
        </header>

        {/* Chat Content */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto scroll-smooth relative z-10"
        >
          {!activeChat || activeChat.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in">
              <div className="relative mb-8">
                  <div className="absolute inset-0 bg-teal-500/20 blur-2xl rounded-full scale-150"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-tr from-teal-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl rotate-3">
                    <i className="fas fa-bolt-lightning text-4xl text-white"></i>
                  </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-500 mb-6 tracking-tight">
                Design the Future.
              </h1>
              <p className="text-gray-400 max-w-lg mb-12 text-base md:text-lg leading-relaxed font-medium">
                Welcome to your workspace. Start a conversation or select a prompt to begin exploring possibilities.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
                {[
                  { icon: "fa-code", text: "Refactor this React hook for better performance" },
                  { icon: "fa-pen-nib", text: "Write a high-converting landing page copy" },
                  { icon: "fa-lightbulb", text: "Brainstorm 5 unique startup ideas for 2025" },
                  { icon: "fa-magnifying-glass", text: "Explain how zero-knowledge proofs work" }
                ].map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setInput(item.text)}
                    className="group p-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm text-left text-gray-300 transition-all hover:scale-[1.02] hover:shadow-xl flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-teal-500/10 group-hover:border-teal-500/20 transition-all">
                       <i className={`fas ${item.icon} text-gray-400 group-hover:text-teal-500`}></i>
                    </div>
                    <span className="font-medium">{item.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="pb-40 pt-4">
              {activeChat.messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isThinking && (
                <div className="w-full py-10 bg-white/[0.02] animate-slide-up">
                  <div className="max-w-4xl mx-auto px-6 flex gap-5 md:gap-8">
                    <div className="w-9 h-9 rounded-xl bg-teal-600/20 border border-teal-500/30 flex items-center justify-center text-teal-500 animate-pulse">
                      <i className="fas fa-robot text-sm"></i>
                    </div>
                    <div className="flex flex-col gap-3">
                        <span className="text-[10px] font-bold text-teal-500/80 uppercase tracking-widest">Reasoning...</span>
                        <div className="flex gap-2 items-center">
                          <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Glass Input Area */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-8 pt-10 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent">
          <div className="max-w-4xl mx-auto relative">
            <div className="input-container relative flex items-end w-full bg-[#111111]/80 backdrop-blur-2xl border border-white/10 rounded-[24px] p-2.5 pl-5 transition-all shadow-2xl">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Zephyr anything..."
                rows={1}
                className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-[#f0f0f0] placeholder-gray-500 py-3.5 resize-none max-h-52 text-[15px] font-medium leading-relaxed"
              />
              <div className="flex items-center gap-2 pr-1 pb-1">
                  <button className="p-3 text-gray-500 hover:text-teal-500 hover:bg-white/5 rounded-xl transition-all">
                    <i className="fas fa-paperclip text-sm"></i>
                  </button>
                  <button
                    onClick={() => handleSubmit()}
                    disabled={!input.trim() || isThinking}
                    className={`p-3.5 rounded-2xl transition-all flex items-center justify-center ${input.trim() && !isThinking ? 'bg-teal-500 text-[#0a0a0a] hover:bg-teal-400 hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] scale-100' : 'bg-white/5 text-gray-600 cursor-not-allowed scale-95'}`}
                  >
                    <i className="fas fa-arrow-up text-sm font-bold"></i>
                  </button>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-6">
                <div className="text-[10px] text-gray-500 font-semibold tracking-wider flex items-center gap-2">
                    <i className="fas fa-shield-halved opacity-40"></i> END-TO-END ENCRYPTED
                </div>
                <div className="text-[10px] text-gray-600 font-medium">
                    Engineered with Gemini 3 Flash Preview 
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
