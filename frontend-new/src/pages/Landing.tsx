import React from 'react';
import { motion } from 'framer-motion';
import { Bot, ArrowRight, Shield, Zap, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Landing() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden nebula-bg text-on-surface">
      <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-[0_0_15px_rgba(237,177,255,0.3)]">
             <Bot size={24} className="text-on-primary" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            YUDO
          </span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-5 py-2 rounded-full font-label text-sm text-on-surface hover:text-primary transition-colors">
            Log In
          </Link>
          <Link to="/signup" className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-on-surface font-label text-sm hover:bg-white/10 transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center p-6 relative z-10 pt-24 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <div className="mb-6 inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary font-label text-xs tracking-wider uppercase">
             Meet Your New Second Brain
          </div>
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-on-surface via-primary to-secondary mb-6">
            Ethereal Intelligence<br />Awaits You
          </h1>
          <p className="font-body text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed">
            YUDO is a cutting-edge personal assistant that organizes your documents, structures your thoughts, and empowers your daily life using seamless AI orchestration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/signup" className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold tracking-tight shadow-[0_0_20px_rgba(157,80,187,0.4)] hover:shadow-[0_0_30px_rgba(157,80,187,0.6)] hover:-translate-y-1 transition-all flex items-center gap-2">
              Start Free Trial <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl"
        >
          {[
            { title: "Military-grade Vault", icon: <Shield size={24} />, desc: "Complete end-to-end encryption for your most sensitive documents.", color: "text-tertiary", border: "border-tertiary/20" },
            { title: "Neural Sync", icon: <Zap size={24} />, desc: "Instant contextual generation pulling directly from your personal knowledge base.", color: "text-primary", border: "border-primary/20" },
            { title: "Infinite Memory", icon: <Database size={24} />, desc: "Never forget a detail again. YUDO remembers everything you show it.", color: "text-secondary", border: "border-secondary/20" }
          ].map(feature => (
             <div key={feature.title} className="glass-panel p-8 rounded-2xl border border-white/5 text-left hover:-translate-y-1 transition-transform cursor-pointer">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-white/5 ${feature.color} border ${feature.border} mb-6`}>
                   {feature.icon}
                </div>
                <h3 className="font-headline font-bold text-xl mb-3 text-on-surface">{feature.title}</h3>
                <p className="font-body text-on-surface-variant leading-relaxed text-sm">{feature.desc}</p>
             </div>
          ))}
        </motion.div>
      </main>

      {/* Decorative cosmic elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[150px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[150px]" />
      </div>
      <div className="fixed inset-0 z-[-1] opacity-20">
         <img 
            className="w-full h-full object-cover mix-blend-screen" 
            alt="deep space nebula" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWP9Wv7AxUhHV-0mp7ul5o5aHP2FAcHXmwkXnsUJqBjHI79TswQ2H6Hq1uyX4d7jssv_fhKqGFPyV8YFhrSr8_6h8wtgI6l62MWEnb--JMoAZTFd3Yui7ZI1FRcvC61UeoxNhdmxh-QQzXes7Nw4-980Y-FWwvt7UBRsEZd2E6SHbap9jAxcm9M8Ooq8d1ie9qh69wCgedKLvBCEOgUu4zjVlBCK_879vfbWdRTpxSOOqrsdUw3RSaBexwrM6Fysb_lYFzOBTCYeU" 
         />
      </div>
    </div>
  );
}
