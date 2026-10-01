'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Database, MessageSquare } from 'lucide-react';

type Message = {
  id: string;
  type: 'user' | 'bot';
  content: string;
};

type ChatPaneProps = {
  onResult: (data: any[], metadata: any) => void;
};

export default function ChatPane({ onResult }: ChatPaneProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { id: Date.now().toString(), type: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage.content }),
      });

      const data = await response.json();

      if (data.error) {
        setMessages((prev) => [...prev, {
          id: Date.now().toString(),
          type: 'bot',
          content: 'Error: ' + data.error + ' - ' + (data.details || '')
        }]);
      } else {
        setMessages((prev) => [...prev, {
          id: Date.now().toString(),
          type: 'bot',
          content: data.metadata?.description || 'Results loaded in the panel.',
        }]);
        onResult(data.data, data.metadata);
      }
    } catch {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        type: 'bot',
        content: 'Sorry, there was an error processing your request.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center gap-2">
        <MessageSquare className="text-purple-400" size={20} />
        <h2 className="font-semibold text-sm">Chat</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 bg-purple-900/40 rounded-xl flex items-center justify-center mb-4">
              <Database className="text-purple-400 w-6 h-6" />
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              Ask a question about student skills. e.g. &quot;Top 20 students in Python&quot;
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={msg.type === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div className={
              msg.type === 'user'
                ? 'bg-purple-600 text-white text-xs px-3 py-2 rounded-xl rounded-br-none max-w-[90%]'
                : 'bg-gray-800 text-gray-200 text-xs px-3 py-2 rounded-xl rounded-bl-none max-w-[90%]'
            }>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-400 text-xs px-3 py-2 rounded-xl rounded-bl-none flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
              Querying...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-800">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about skills..."
            className="w-full bg-gray-900 border border-gray-700 text-white text-xs px-4 py-3 rounded-full focus:outline-none focus:ring-1 focus:ring-purple-500 pr-10 placeholder-gray-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-purple-600 text-white rounded-full hover:bg-purple-500 disabled:opacity-40 transition-colors"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
