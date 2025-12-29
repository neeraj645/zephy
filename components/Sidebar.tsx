
import React from 'react';
import { Chat } from '../types';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string, e: React.MouseEvent) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isSidebarOpen,
  toggleSidebar,
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 md:hidden animate-fade-in"
          onClick={toggleSidebar}
        />
      )}

      <aside className={`fixed md:static inset-y-0 left-0 z-30 w-72 bg-[#0a0a0a]/80 backdrop-blur-xl border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:ml-[-288px]'}`}>
        <div className="p-5">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10 hover:border-white/20 text-sm font-medium group shadow-lg"
          >
            <span className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-teal-500 to-blue-500 flex items-center justify-center">
                <i className="fas fa-plus text-[10px]"></i>
              </div>
              New Session
            </span>
            <i className="far fa-edit text-gray-500 group-hover:text-gray-300 transition-colors"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="text-[11px] font-bold text-gray-500 px-4 py-2 uppercase tracking-[0.2em]">
            History
          </div>
          {chats.length === 0 ? (
            <div className="px-4 py-6 text-xs text-gray-600 font-medium italic">
              Your conversations will appear here.
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 border ${activeChatId === chat.id ? 'bg-white/10 border-white/10 text-white shadow-inner' : 'bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full transition-all ${activeChatId === chat.id ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]' : 'bg-transparent'}`}></div>
                <span className="flex-1 truncate text-sm font-medium">
                  {chat.title || 'New Chat'}
                </span>
                <button
                  onClick={(e) => onDeleteChat(chat.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all"
                >
                  <i className="far fa-trash-can text-xs"></i>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3 px-3 py-3 hover:bg-white/5 rounded-xl cursor-pointer text-gray-400 hover:text-white transition-all group">
            <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-blue-500 opacity-20"></div>
                   GC
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-teal-500 border-2 border-[#0a0a0a] rounded-full"></div>
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-tight">Guest Explorer</span>
                <span className="text-[10px] text-gray-500 font-medium group-hover:text-teal-500 transition-colors">Personal Plan</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
