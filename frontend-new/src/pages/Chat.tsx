import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User } from 'lucide-react';

export function Chat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am YUDO, your personal neural assistant. I have access to your vault. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Optimistic append
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    const currentInput = input;
    setInput('');
    
    // Simulate thinking and response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: `I received your query: "${currentInput}". I am currently running in offline mock mode, but my Fast API connection will process this soon!` }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full z-10 relative max-w-4xl mx-auto space-y-4">
       <header>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface tracking-tight">Neural Chat</h1>
      </header>

      <div className="flex-1 glass-panel border border-white/5 rounded-xl overflow-hidden flex flex-col p-4">
        <div className="flex-1 overflow-y-auto space-y-6 p-4">
           {messages.map((msg, i) => (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               key={i} 
               className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
             >
                <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'}`}>
                      {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                   </div>
                   <div className={`p-4 rounded-xl text-sm font-body leading-relaxed ${msg.role === 'user' ? 'bg-secondary/10 text-on-surface' : 'bg-surface-container-high text-on-surface-variant'}`}>
                      {msg.content}
                   </div>
                </div>
             </motion.div>
           ))}
        </div>

        <form onSubmit={handleSend} className="mt-4 flex gap-2">
           <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your documents, schedule, or notes..."
              className="flex-1 bg-surface-container-lowest border border-white/10 rounded-full px-6 py-3 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-body"
           />
           <button 
             type="submit"
             disabled={!input.trim()}
             className="w-12 h-12 rounded-full bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:hover:bg-primary flex items-center justify-center text-on-primary transition-colors text-white"
           >
              <Send size={18} />
           </button>
        </form>
      </div>
    </div>
  );
}
