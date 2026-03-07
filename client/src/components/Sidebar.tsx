import { Bot, MessageSquarePlus, LogOut } from 'lucide-react';
import { User, Thread } from '@/lib/api';

type SidebarProps = {
  user: User | null;
  threads: Thread[];
  activeThreadId: number | null;
  onSelectThread: (id: number) => void;
  onCreateThread: () => void;
  onLogout: () => void;
};

export default function Sidebar({ user, threads, activeThreadId, onSelectThread, onCreateThread, onLogout }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand">
          <Bot size={28} color="#58a6ff" />
          Nyx
        </div>
      </div>

      <button className="new-chat-btn" onClick={onCreateThread}>
        <MessageSquarePlus size={20} />
        New Thread
      </button>

      <div className="threads-list">
        {threads.map(thread => (
          <div 
            key={thread.id} 
            className={`thread-item ${activeThreadId === thread.id ? 'active' : ''}`}
            onClick={() => onSelectThread(thread.id)}
          >
            {thread.title}
          </div>
        ))}
      </div>

      <div className="user-profile">
        <div className="user-profile-info">
          {user && (
            <>
              <div className="avatar">{user.email[0].toUpperCase()}</div>
              <div style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email.split('@')[0]}
              </div>
            </>
          )}
        </div>
        <button className="logout-btn" onClick={onLogout} title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
