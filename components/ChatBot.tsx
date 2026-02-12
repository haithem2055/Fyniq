import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Loader2, Sparkles } from 'lucide-react';
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
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
        id: '1',
        role: 'bot',
        content: t.chat.welcome
    }
  ]);
  
  // Reset chat welcome message when language changes
  useEffect(() => {
    setMessages(prev => {
        // If the first message is the default welcome message (id '1'), update it
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
        {/* Floating Toggle Button */}
        <button
            onClick={() => setIsOpen(!isOpen)}
            className={`fixed bottom-6 right-6 z-[100] p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 ${
                isOpen ? 'bg-red-500 rotate-90' : 'bg-emerald-600'
            } text-white`}
        >
            {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </button>

        {/* Chat Window */}
        <div 
            className={`fixed bottom-24 right-6 z-[99] w-80 md:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-emerald-100 dark:border-slate-700 flex flex-col transition-all duration-300 origin-bottom-right ${
                isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
            }`}
            style={{ height: '500px', maxHeight: '80vh' }}
        >
            {/* Header */}
            <div className="bg-emerald-900 dark:bg-emerald-950 text-white p-4 rounded-t-2xl flex items-center gap-3">
                <div className="bg-emerald-700 dark:bg-emerald-800 p-2 rounded-lg">
                    <Bot size={20} className="text-emerald-200" />
                </div>
                <div>
                    <h3 className="font-bold text-sm">{t.chat.advisor}</h3>
                    <div className="flex items-center gap-1 text-xs text-emerald-300">
                        <Sparkles size={10} />
                        <span>{t.chat.online}</span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950">
                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div 
                            className={`max-w-[85%] p-3 text-sm rounded-2xl leading-relaxed whitespace-pre-wrap ${
                                msg.role === 'user' 
                                    ? 'bg-emerald-600 text-white rounded-br-none' 
                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-none shadow-sm'
                            }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs text-slate-400">{t.chat.processing}</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-b-2xl">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={t.chat.placeholder}
                        className="flex-1 bg-transparent border-none outline-none text-sm px-2 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                        disabled={isLoading}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={16} className={isLoading ? 'opacity-0' : ''} />
                    </button>
                </div>
                <p className="text-[10px] text-center text-slate-400 mt-2">
                    {t.chat.disclaimer}
                </p>
            </div>
        </div>
    </>
  );
};

export default ChatBot;