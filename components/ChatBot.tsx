
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { InvoiceData } from '../types';
import { sendFinancialQuery } from '../services/geminiService';

interface ChatBotProps {
  invoices: InvoiceData[];
  translations: any;
}

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ invoices, translations: t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
        id: '1',
        role: 'bot',
        content: t.chat.welcome
    }
  ]);
  
  // Show greeting bubble after 3 seconds to attract attention
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setShowGreeting(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Hide greeting if user interacts with something else or after 8 seconds
  useEffect(() => {
    if (showGreeting) {
        const timer = setTimeout(() => setShowGreeting(false), 8000);
        return () => clearTimeout(timer);
    }
  }, [showGreeting]);

  // Reset chat welcome message when language changes
  useEffect(() => {
    setMessages(prev => {
        const newMsgs = [...prev];
        if (newMsgs.length > 0 && newMsgs[0].id === '1') {
            newMsgs[0].content = t.chat.welcome;
        }
        return newMsgs;
    });
  }, [t.chat.welcome]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setShowGreeting(false);

    try {
      const historyForApi = messages.map(m => ({ role: m.role, content: m.content }));
      const responseText = await sendFinancialQuery(invoices, input, historyForApi);
      
      const botMsg: Message = { 
          id: (Date.now() + 1).toString(), 
          role: 'bot', 
          content: responseText 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = { 
          id: (Date.now() + 1).toString(), 
          role: 'bot', 
          content: t.chat.error 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  };

  return (
    <>
        {/* Floating AI Assistant UI */}
        <div className={`fixed bottom-24 md:bottom-6 right-6 z-[100] flex flex-col items-end`}>
            
            {/* Greeting Bubble */}
            {showGreeting && !isOpen && (
                <div className="mb-3 animate-bounce">
                    <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-2xl rounded-br-none shadow-xl border border-emerald-500 relative">
                        {t.chat.advisor === 'Financial Advisor' ? 'Need help with invoices?' : 'هل لديك سؤال عن أموالك؟'}
                        <div className="absolute -bottom-2 right-4 w-4 h-4 bg-emerald-600 rotate-45 border-r border-b border-emerald-500"></div>
                    </div>
                </div>
            )}

            {/* Main Toggle Button */}
            <div className="relative group">
                {/* Background Ping Effect */}
                {!isOpen && (
                    <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20 group-hover:opacity-40"></span>
                )}
                
                <button
                    onClick={() => {
                        setIsOpen(!isOpen);
                        setShowGreeting(false);
                    }}
                    className={`relative p-4 rounded-2xl shadow-2xl transition-all duration-500 transform hover:scale-110 active:scale-95 flex items-center justify-center overflow-hidden ${
                        isOpen 
                        ? 'bg-rose-500 rotate-90 rounded-full' 
                        : 'bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500'
                    } text-white`}
                >
                    {/* Glossy Overlay */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 -skew-y-12"></div>
                    
                    {isOpen ? (
                        <X size={24} />
                    ) : (
                        <div className="relative">
                            <Bot size={28} strokeWidth={2} className="drop-shadow-md" />
                            <Sparkles size={14} className="absolute -top-2 -right-2 text-yellow-300 animate-pulse" />
                        </div>
                    )}
                </button>
            </div>
        </div>

        {/* Chat Window */}
        <div 
            className={`fixed bottom-40 md:bottom-24 right-6 z-[99] w-[85vw] md:w-96 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-emerald-100 dark:border-slate-700 flex flex-col transition-all duration-500 origin-bottom-right ${
                isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10 pointer-events-none'
            }`}
            style={{ height: '550px', maxHeight: '70vh' }}
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white p-5 rounded-t-[2rem] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/20">
                        <Bot size={22} className="text-emerald-300" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">{t.chat.advisor}</h3>
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                            <span>{t.chat.online}</span>
                        </div>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                    >
                        <div 
                            className={`max-w-[85%] p-4 text-sm rounded-2xl leading-relaxed whitespace-pre-wrap shadow-sm ${
                                msg.role === 'user' 
                                    ? 'bg-emerald-600 text-white rounded-br-none font-medium' 
                                    : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-none'
                            }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-3">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
                            </div>
                            <span className="text-xs font-bold text-emerald-600/70 dark:text-emerald-400/70">{t.chat.processing}</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-[2rem]">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={t.chat.placeholder}
                        className="flex-1 bg-transparent border-none outline-none text-sm px-3 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                        disabled={isLoading}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-90"
                    >
                        <Send size={18} />
                    </button>
                </div>
                <div className="flex items-center justify-center gap-1 mt-3">
                   <Wand2 size={10} className="text-emerald-500" />
                   <p className="text-[9px] text-slate-400">
                       {t.chat.disclaimer}
                   </p>
                </div>
            </div>
        </div>
    </>
  );
};

export default ChatBot;
