
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { askChatbot } from '../services/geminiService';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatbotProps {
  currentUser: string;
  currentCategory: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ currentUser, currentCategory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      const initialGreet = async () => {
        setLoading(true);
        const response = await askChatbot(
          "Hello! I just logged in. Can you introduce yourself and tell me what I should do here?",
          [],
          { role: currentUser, category: currentCategory }
        );
        setMessages([{ role: 'model', text: response }]);
        setLoading(false);
      };
      initialGreet();
    }
  }, [currentUser, currentCategory]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    const response = await askChatbot(userMessage, messages, {
      role: currentUser,
      category: currentCategory
    });

    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-emerald-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-emerald-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm">EcoAssistant</h3>
                <p className="text-[10px] text-emerald-100 uppercase tracking-widest font-bold">AI Support</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${m.role === 'user' ? 'bg-emerald-100 text-emerald-600' : 'bg-white border border-emerald-100 text-emerald-600 shadow-sm'}`}>
                    {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-gray-700 border border-emerald-50 shadow-sm rounded-tl-none'}`}>
                    {m.text}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-2 items-center bg-white border border-emerald-50 p-3 rounded-2xl rounded-tl-none shadow-sm">
                  <Loader2 size={16} className="animate-spin text-emerald-600" />
                  <span className="text-xs text-gray-400 font-medium">Assistant is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about EcoChain..."
              className="flex-grow bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-900"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-all shadow-md active:scale-95"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-2xl shadow-2xl flex items-center gap-2 transition-all duration-300 transform active:scale-95 ${isOpen ? 'bg-white text-emerald-600 rotate-90 scale-0 opacity-0' : 'bg-emerald-600 text-white hover:bg-emerald-700 scale-100 opacity-100'}`}
      >
        <MessageSquare size={24} />
      </button>

      {/* Alternate Close State for Button */}
      {isOpen && (
        <button
          onClick={() => setIsOpen(false)}
          className="p-4 rounded-2xl bg-white text-emerald-600 shadow-2xl border border-emerald-100 hover:bg-emerald-50 transition-all active:scale-95 animate-in zoom-in"
        >
          <X size={24} />
        </button>
      )}
    </div>
  );
};

export default Chatbot;
