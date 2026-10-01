'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Send, Loader2, Database, Users, BarChart3, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

type Message = {
  id: string;
  type: 'user' | 'bot';
  content: string;
  data?: any[];
  metadata?: {
    description?: string;
    graph_type?: string;
    filters?: string[];
  };
};

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

export default function Home() {
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
          content: `Error: ${data.error} - ${data.details || ''}`
        }]);
      } else {
        setMessages((prev) => [...prev, {
          id: Date.now().toString(),
          type: 'bot',
          content: data.metadata?.description || 'Here are the results:',
          data: data.data,
          metadata: data.metadata,
        }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        type: 'bot',
        content: "Sorry, there was an error processing your request."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderChart = (data: any[], type: string) => {
    if (!data || data.length === 0) return null;
    
    // Attempt to guess keys for chart
    const keys = Object.keys(data[0]);
    const nameKey = keys.find(k => typeof data[0][k] === 'string') || keys[0];
    const valueKey = keys.find(k => typeof data[0][k] === 'number') || keys[1];

    if (!nameKey || !valueKey) return null;

    const chartData = data.slice(0, 10); // Limit chart to top 10

    if (type === 'pie') {
      return (
        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8b5cf6" dataKey={valueKey} nameKey={nameKey}>
                {chartData.map((entry, index) => (
                  <Cell key={'cell-' + index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }

    return (
      <div className="h-64 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={nameKey} stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Bar dataKey={valueKey} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderTable = (data: any[]) => {
    if (!data || data.length === 0) return <p className="text-sm text-gray-500 italic mt-2">No data found.</p>;
    const headers = Object.keys(data[0]);

    return (
      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-purple-50 transition-colors">
                {headers.map((header) => (
                  <td key={header} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-white text-black font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Database className="text-purple-500" /> SkillRAG
          </h1>
          <p className="text-xs text-gray-400 mt-2">Student Intelligence Platform</p>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-3 py-2 bg-purple-900/40 text-purple-300 rounded-md transition-colors border border-purple-500/20">
            <Search size={18} /> Query Data
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-white/5 hover:text-white rounded-md transition-colors">
            <Users size={18} /> Student Profiles
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-white/5 hover:text-white rounded-md transition-colors">
            <BarChart3 size={18} /> Dashboard
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative bg-gray-50">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <h2 className="font-semibold text-lg text-gray-800">Ask the Database</h2>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
              AD
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <Database className="text-purple-600 w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to SkillRAG</h2>
              <p className="text-gray-500 mb-8">
                Upload your student skills database and ask natural language questions. 
                Example: "Show me the top 50 students skilled in UI UX" or "What is the completion rate for C Programming?"
              </p>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto">
              {messages.map((msg) => (
                <div key={msg.id} className={'flex ' + (msg.type === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={'max-w-[85%] rounded-2xl p-5 ' + (
                    msg.type === 'user' 
                      ? 'bg-black text-white rounded-br-none shadow-md' 
                      : 'bg-white border border-gray-200 shadow-sm rounded-bl-none text-gray-800'
                  )}>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    
                    {msg.type === 'bot' && msg.data && (
                      <div className="mt-4">
                        {msg.metadata?.filters && msg.metadata.filters.length > 0 && (
                          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                            <Filter size={14} className="text-gray-400" />
                            {msg.metadata.filters.map(f => (
                              <span key={f} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md border border-purple-100 font-medium whitespace-nowrap">
                                {f}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {msg.metadata?.graph_type && msg.metadata.graph_type !== 'none' && renderChart(msg.data, msg.metadata.graph_type)}
                        
                        {renderTable(msg.data)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                    <span className="text-sm text-gray-500 font-medium">Querying database...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="relative shadow-xl shadow-purple-900/5 rounded-full">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about student skills, e.g., 'Top 10 students in Python'..."
                className="w-full bg-white border border-gray-200 text-gray-900 px-6 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-14 text-sm font-medium placeholder-gray-400"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-2 top-2 p-2.5 bg-black text-white rounded-full hover:bg-purple-600 disabled:opacity-50 transition-colors"
              >
                <Send size={18} className={loading ? "opacity-50" : ""} />
              </button>
            </form>
            <div className="text-center mt-2 text-xs text-gray-400">
              Powered by Next.js, Groq, and PostgreSQL
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
