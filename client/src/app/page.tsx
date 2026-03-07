"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Send } from 'lucide-react';
import { BASE_URL, FETCH_OPTS, User, Thread, Message } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import ChatContainer from '@/components/ChatContainer';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [errorToast, setErrorToast] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (activeThreadId) {
      loadMessages(activeThreadId);
    } else {
      setMessages([]);
    }
  }, [activeThreadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${BASE_URL}/me`, FETCH_OPTS);
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        loadThreads();
      } else {
        router.replace('/login');
      }
    } catch {
      router.replace('/login');
    } finally {
      setAuthChecking(false);
    }
  };

  const loadThreads = async () => {
    try {
      const res = await fetch(`${BASE_URL}/threads`, FETCH_OPTS);
      if (res.ok) {
        const data = await res.json();
        setThreads(data);
        if (data.length > 0 && !activeThreadId) {
          setActiveThreadId(data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadMessages = async (threadId: number) => {
    try {
      const res = await fetch(`${BASE_URL}/threads/${threadId}/messages`, FETCH_OPTS);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const createNewThread = async () => {
    try {
      const res = await fetch(`${BASE_URL}/threads`, { method: 'POST', ...FETCH_OPTS });
      if (res.ok) {
        const newThread = await res.json();
        setThreads([newThread, ...threads]);
        setActiveThreadId(newThread.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${BASE_URL}/logout`, { method: 'POST', ...FETCH_OPTS });
      router.push('/login');
    } catch (e) {
      console.error(e);
    }
  };

  const showError = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(''), 4000);
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeThreadId) return;

    const userMessageCount = messages.filter(m => m.role === 'user').length;
    if (userMessageCount >= 10) {
      showError('Thread logic limit reached (10 replies max)');
      return;
    }

    const payload = inputText;
    setInputText('');
    
    const tempId = Date.now();
    setMessages(prev => [...prev, { id: tempId, role: 'user', content: payload }]);
    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/threads/${activeThreadId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: payload }),
        ...FETCH_OPTS,
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { id: data.message_id, role: 'assistant', content: data.reply }]);
        
        if (userMessageCount === 0) {
            loadThreads();
        }
      } else {
        const err = await res.json();
        showError(err.detail || 'Failed to send message');
        setMessages(prev => prev.filter(m => m.id !== tempId));
      }
    } catch {
      showError('Network error');
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setIsLoading(false);
    }
  };

  if (authChecking) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="app-layout">
      {/* Extracted Sidebar Component */}
      <Sidebar 
        user={user} 
        threads={threads} 
        activeThreadId={activeThreadId} 
        onSelectThread={setActiveThreadId} 
        onCreateThread={createNewThread} 
        onLogout={handleLogout} 
      />

      <main className="main-content">
        <AnimatePresence>
          {errorToast && (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 20, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', background: 'var(--error-color)', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', zIndex: 100, display: 'flex', gap: '0.5rem', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
            >
              <AlertCircle size={18} />
              {errorToast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Extracted Chat Component */}
        <ChatContainer 
          activeThreadId={activeThreadId}
          messages={messages}
          isLoading={isLoading}
          scrollRef={scrollRef}
          messagesEndRef={messagesEndRef}
        />

        <div className="input-area">
          <form className="input-form" onSubmit={sendMessage}>
            <textarea
              className="chat-input"
              placeholder={activeThreadId ? "Message Nyx..." : "Create a thread first..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!activeThreadId || isLoading}
              rows={1}
            />
            <button 
              type="submit" 
              className="send-btn" 
              disabled={!inputText.trim() || !activeThreadId || isLoading}
            >
              <Send size={16} />
            </button>
          </form>
          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Nyx uses GPT-5 Nano. Threads are strictly limited to 10 replies.
          </div>
        </div>
      </main>
    </div>
  );
}
