import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { FileText, Bot, AlertCircle } from 'lucide-react';
import { Message } from '@/lib/api';
import React from 'react';

type ChatContainerProps = {
  activeThreadId: number | null;
  messages: Message[];
  isLoading: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
};

export default function ChatContainer({ activeThreadId, messages, isLoading, scrollRef, messagesEndRef }: ChatContainerProps) {
  if (!activeThreadId) {
    return (
      <div className="chat-empty-state">
        <Bot size={64} color="#58a6ff" opacity={0.5} />
        <h2>Welcome to Nyx</h2>
        <p>Create a new thread to get started.</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="chat-empty-state" style={{ marginTop: 'auto', marginBottom: 'auto' }}>
        <h2>Start a Conversation</h2>
        <div className="limits-pill">
          <AlertCircle size={14} /> Only 10 replies allowed per thread
        </div>
      </div>
    );
  }

  const userCount = messages.filter(m => m.role === 'user').length;

  return (
    <div className="chat-container" ref={scrollRef}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="limits-pill">
          {10 - userCount} replies remaining
        </div>
      </div>
      
      {messages.map((msg) => {
        const isReadme = msg.role === 'assistant' && msg.content.length > 50 && msg.content.includes('# ');

        return (
          <motion.div 
            key={msg.id}
            className={`message-wrapper ${msg.role}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div 
              className={`message-bubble ${msg.role}`} 
              style={isReadme ? { padding: '1.5rem', border: '1px solid var(--accent-color)', boxShadow: '0 4px 24px rgba(88, 166, 255, 0.15)', width: '100%', maxWidth: '90%' } : {}}
            >
              {isReadme && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-color)', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
                  <FileText size={18} />
                  README Preview
                </div>
              )}
              {msg.role === 'assistant' ? (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </motion.div>
        );
      })}
      
      {isLoading && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
          className="message-wrapper assistant"
        >
          <div className="message-bubble assistant" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-secondary)' }}>
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>•</motion.div>
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}>•</motion.div>
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}>•</motion.div>
          </div>
        </motion.div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
