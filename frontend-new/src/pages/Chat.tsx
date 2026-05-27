import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Loader2, Cpu, Sparkles } from 'lucide-react';
import { chatWithAgent } from '../lib/api';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export function Chat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am YUDO, your personal neural assistant. I have access to your vault. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useGSAP(() => {
    gsap.fromTo(".gsap-reveal", 
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }
    );

    // Background slow floating particles
    gsap.to(".gsap-particle", {
      y: "random(-30, 30)",
      x: "random(-30, 30)",
      opacity: "random(0.1, 0.5)",
      scale: "random(0.5, 1.5)",
      duration: "random(3, 6)",
      repeat: -1,
      yoyo: true,
      stagger: 0.2,
      ease: "sine.inOut"
    });

    if (orbRef.current) {
      gsap.to(orbRef.current, {
        scale: 1.1,
        opacity: 0.8,
        duration: 3,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });
    }
  }, []);

  // Animate new messages as they come in
  useEffect(() => {
    if (messages.length > 1) {
      gsap.fromTo(`.gsap-msg-${messages.length - 1}`,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.2)" }
      );
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    const currentInput = input;
    // Optimistic append
    setMessages(prev => [...prev, { role: 'user', content: currentInput }]);
    setInput('');
    setLoading(true);
    
    try {
      const response = await chatWithAgent(currentInput);
      setMessages(prev => [...prev, { role: 'assistant', content: response.answer }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message || 'Failed to communicate with YUDO Backend.'}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative" ref={containerRef}>
      {/* Neural Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20 mix-blend-screen" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-tr from-primary/10 via-background to-secondary/10 blur-[100px]"></div>

      {/* Floating Particles */}
      {[...Array(8)].map((_, i) => (
        <div key={i} className={`gsap-particle fixed rounded-full blur-[4px] ${i % 2 === 0 ? 'bg-primary/30' : 'bg-secondary/30'}`} style={{
          width: Math.random() * 20 + 10 + 'px',
          height: Math.random() * 20 + 10 + 'px',
          top: Math.random() * 100 + '%',
          left: Math.random() * 100 + '%',
          pointerEvents: 'none',
          zIndex: 0
        }}></div>
      ))}

      <header className="mb-6 relative z-10 gsap-reveal flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-white tracking-tight flex items-center gap-3 drop-shadow-lg">
            <Cpu size={28} className="text-secondary" /> Neural Interface
          </h1>
          <p className="font-body text-on-surface-variant text-sm mt-1">Direct connection to YUDO's semantic core.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-lg">
           <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
           <span className="text-[10px] font-label uppercase tracking-widest text-green-400 font-bold">Online</span>
        </div>
      </header>

      <div className="flex-1 glass-panel border border-white/10 rounded-3xl overflow-hidden flex flex-col relative shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-5xl mx-auto w-full z-10 gsap-reveal">
        
        {/* Decorative corner glows */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 blur-[60px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/10 blur-[60px] pointer-events-none"></div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar relative z-10">
           {messages.map((msg, i) => (
             <div 
               key={i} 
               className={`flex w-full gsap-msg-${i} ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
             >
                <div className={`flex gap-4 max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                   
                   {/* Avatar */}
                   <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg relative ${msg.role === 'user' ? 'bg-gradient-to-br from-secondary/40 to-secondary/10 text-white border border-secondary/30' : 'bg-surface-container border border-white/10'}`}>
                      {msg.role === 'user' ? (
                        <User size={18} />
                      ) : (
                        <>
                          <div ref={i === messages.length - 1 && loading ? orbRef : null} className="absolute inset-0 bg-primary/20 blur-md rounded-2xl"></div>
                          <img src="/images/YUDO ICON.webp" alt="YUDO" className="w-6 h-6 object-contain relative z-10" />
                        </>
                      )}
                   </div>
                   
                   {/* Message Bubble */}
                   <div className={`p-5 rounded-3xl text-sm font-body leading-relaxed shadow-xl border ${msg.role === 'user' ? 'bg-secondary/20 text-white border-secondary/30 rounded-tr-sm' : 'bg-surface-container/60 text-on-surface-variant border-white/10 rounded-tl-sm backdrop-blur-md'}`}>
                      {msg.content}
                   </div>
                </div>
             </div>
           ))}
           
           {loading && (
             <div className="flex justify-start gsap-msg-loading">
               <div className="flex gap-4 max-w-[85%] md:max-w-[70%]">
                 <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg relative bg-surface-container border border-white/10">
                    <div className="absolute inset-0 bg-primary/20 blur-md rounded-2xl animate-pulse"></div>
                    <img src="/images/YUDO ICON.webp" alt="YUDO" className="w-6 h-6 object-contain relative z-10 opacity-70" />
                 </div>
                 <div className="p-5 rounded-3xl bg-surface-container/60 border border-white/10 rounded-tl-sm flex items-center gap-2 backdrop-blur-md shadow-xl">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                 </div>
               </div>
             </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Floating Input Area */}
        <div className="p-4 relative z-20">
          <form onSubmit={handleSend} className="relative flex items-center bg-surface-container/80 backdrop-blur-xl border border-white/10 rounded-full p-2 shadow-[0_10px_40px_rgba(0,0,0,0.8)] max-w-4xl mx-auto focus-within:border-primary/50 transition-colors">
             <div className="pl-4 pr-2 text-on-surface-variant opacity-50">
               <Sparkles size={20} />
             </div>
             <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask YUDO anything about your memories or documents..."
                className="flex-1 bg-transparent border-0 text-white placeholder:text-on-surface-variant/50 focus:ring-0 py-3 outline-none font-body text-sm"
             />
             <button 
               type="submit"
               disabled={!input.trim() || loading}
               className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary-container hover:shadow-[0_0_15px_rgba(157,80,187,0.6)] disabled:opacity-50 disabled:shadow-none flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:cursor-not-allowed shrink-0"
             >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-1" />}
             </button>
          </form>
          <div className="text-center mt-3">
             <p className="text-[10px] font-label text-on-surface-variant/50 uppercase tracking-widest">
               YUDO AI can make mistakes. Verify important information.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
