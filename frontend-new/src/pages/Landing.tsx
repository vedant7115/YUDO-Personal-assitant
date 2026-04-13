import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FileText, Database, PenTool, ArrowRight, Play, Shield, Zap, Sparkles, Layers, Cpu } from 'lucide-react';

import yudoHead from '../assets/yudo_3d_icon.jpg';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function Landing() {
  const container = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    const tl = gsap.timeline();

    // Fade in ambient backgrounds
    tl.to('.ambient-bg', { opacity: 1, duration: 2, ease: 'power2.inOut' });

    // Hero Text Stagger
    tl.fromTo('.hero-text', 
      { y: 50, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out' },
      "-=1.5"
    );

    // AI Head Entry
    tl.fromTo('.ai-head-container',
      { scale: 0.8, opacity: 0, y: 30 },
      { scale: 1, opacity: 1, y: 0, duration: 1.5, ease: 'power3.out' },
      "-=1"
    );

    // Initial Floating Cards Entry
    tl.fromTo('.floating-card',
      { opacity: 0, scale: 0.8, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'back.out(1.5)' },
      "-=0.5"
    );

    // Continuous animations
    gsap.to('.ai-head', {
      y: -15,
      rotation: 1,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    gsap.to('.neon-glow', {
      scale: 1.05,
      opacity: 0.6,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    gsap.utils.toArray<HTMLElement>('.floating-card').forEach((card, i) => {
      gsap.to(card, {
        y: -10 + (i * 3), 
        duration: 3 + i * 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.3
      });
    });

    // Scroll Animations for sections
    gsap.utils.toArray<HTMLElement>('.reveal-section').forEach((section) => {
      gsap.fromTo(section, 
        { opacity: 0, y: 50 },
        { 
          opacity: 1, 
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // Parallax on AI Head when scrolling
    gsap.to('.ai-head-container', {
      y: 100,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

  }, { scope: container });

  return (
    <div ref={container} className="min-h-screen bg-black text-white overflow-hidden relative font-body selection:bg-primary/30">
      
      {/* Background Ambience */}
      <div className="ambient-bg opacity-0 fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#020005] z-10" />
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.02] z-20 mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
        
        {/* Top Radial Glow */}
        <div className="absolute top-[-20%] left-[20%] w-[60%] h-[50%] bg-primary/20 rounded-full blur-[150px] z-10 mix-blend-screen" />
      </div>

      {/* Glassmorphism Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl z-50">
        <div className="glass-panel bg-white/5 backdrop-blur-xl border border-white/10 rounded-full py-3 px-6 lg:px-8 flex items-center justify-between shadow-[0_0_30px_rgba(157,80,187,0.15)]">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-secondary" />
            <span className="font-headline font-bold text-xl tracking-tighter text-white">
              YUDO
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-label text-white/70">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="px-5 py-2 rounded-full font-label text-sm text-white/80 hover:text-white transition-colors hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              Log In
            </Link>
            <Link to="/signup" className="px-5 py-2 rounded-full bg-white text-black font-label font-bold text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="hero-section relative z-20 min-h-screen container mx-auto px-6 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-0 pt-32 pb-20">
        
        {/* Glowing Horizon Surface at bottom of hero */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[150%] h-[300px] bg-gradient-to-t from-primary/20 via-primary/5 to-transparent rounded-t-[100%] blur-[50px] mix-blend-screen pointer-events-none z-0" />

        {/* Left Content */}
        <div className="w-full lg:w-1/2 flex flex-col items-start justify-center lg:pr-12 z-20">
          <div className="hero-text mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md shadow-[0_0_20px_rgba(157,80,187,0.2)]">
            <Zap size={14} className="text-primary" />
            <span className="font-label text-xs tracking-widest uppercase text-primary font-semibold">
              Powered by AI
            </span>
          </div>
          
          <h1 className="hero-text font-headline text-6xl md:text-[5.5rem] font-extrabold tracking-tighter mb-6 leading-[1.05]">
            <span className="text-white">Your Second</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#e0aaff] to-secondary drop-shadow-lg">
              Brain
            </span>
          </h1>
          
          <p className="hero-text font-body text-lg md:text-xl text-white/50 mb-10 max-w-md font-light tracking-wide leading-relaxed">
            Store. Recall. Evolve. A premium intelligence vault that organizes your thoughts and accelerates your potential.
          </p>
          
          <div className="hero-text flex flex-col sm:flex-row gap-5 items-center w-full sm:w-auto">
            <Link to="/signup" className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-white to-gray-200 text-black font-headline font-bold tracking-tight hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_35px_rgba(255,255,255,0.5)]">
              Get Started <ArrowRight size={18} />
            </Link>
            
            <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/20 text-white font-headline font-medium hover:bg-white/10 hover:border-white/40 backdrop-blur-md transition-all flex items-center justify-center gap-2 group">
              <Play size={18} className="text-secondary group-hover:text-primary transition-colors" /> Try Demo
            </button>
          </div>
        </div>

        {/* Right Content: AI Head */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-full flex items-center justify-center relative ai-head-container z-20">
          
          {/* Deep Glowing Pulse */}
          <div className="neon-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[600px] md:h-[600px] bg-gradient-to-tr from-primary/30 to-secondary/30 rounded-full blur-[100px] md:blur-[140px] z-0 mix-blend-lighten" />
          
          <div className="ai-head relative w-full max-w-[550px] aspect-square z-10 flex items-center justify-center">
            {/* The 3D Render with edge fading */}
            <img 
              src={yudoHead} 
              alt="YUDO Futuristic AI" 
              className="w-full h-full object-cover mix-blend-lighten"
              style={{
                maskImage: 'radial-gradient(circle closest-side, black 65%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(circle closest-side, black 65%, transparent 100%)'
              }}
            />

            {/* Edge Blackout Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020005] via-transparent to-transparent opacity-90 z-20 pointer-events-none" />

            {/* Glass Card 1 */}
            <div className="floating-card absolute top-[15%] right-[-5%] md:right-[5%] glass-panel backdrop-blur-2xl border border-white/10 bg-black/50 p-4 rounded-2xl flex items-center gap-3 shadow-[0_8px_32px_0_rgba(157,80,187,0.15)] z-30 group hover:border-white/20 transition-colors cursor-default">
               <div className="bg-primary/20 p-2.5 rounded-xl text-primary shadow-[0_0_15px_rgba(157,80,187,0.3)]">
                 <PenTool size={20} />
               </div>
               <div>
                 <p className="font-headline font-bold text-sm text-white group-hover:text-primary transition-colors">Notes Sync</p>
                 <p className="font-label text-xs text-white/50">Active</p>
               </div>
            </div>

            {/* Glass Card 2 */}
            <div className="floating-card absolute bottom-[30%] left-[-5%] md:left-[0%] glass-panel backdrop-blur-2xl border border-white/10 bg-black/50 p-4 rounded-2xl flex items-center gap-3 shadow-[0_8px_32px_0_rgba(0,255,255,0.1)] z-30 group hover:border-white/20 transition-colors cursor-default">
               <div className="bg-secondary/20 p-2.5 rounded-xl text-secondary shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                 <Cpu size={20} />
               </div>
               <div>
                 <p className="font-headline font-bold text-sm text-white group-hover:text-secondary transition-colors">AI Memory</p>
                 <p className="font-label text-xs text-white/50">Processing</p>
               </div>
            </div>

            {/* Glass Card 3 */}
            <div className="floating-card absolute bottom-[10%] right-[0%] md:right-[15%] glass-panel backdrop-blur-2xl border border-white/10 bg-black/50 p-4 rounded-2xl flex items-center gap-3 shadow-[0_8px_32px_0_rgba(255,20,147,0.15)] z-30 group hover:border-white/20 transition-colors cursor-default">
               <div className="bg-tertiary/20 p-2.5 rounded-xl text-tertiary shadow-[0_0_15px_rgba(255,20,147,0.3)]">
                 <Shield size={20} />
               </div>
               <div>
                 <p className="font-headline font-bold text-sm text-white group-hover:text-tertiary transition-colors">Vault</p>
                 <p className="font-label text-xs text-white/50">Secured</p>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. FEATURES SECTION */}
      <section id="features" className="relative z-20 py-24 container mx-auto px-6">
        <div className="reveal-section text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-headline text-4xl md:text-5xl font-bold mb-4 text-white">
            Beyond a generic workspace
          </h2>
          <p className="text-white/50 font-body text-lg">
            YUDO integrates seamless orchestration, military-grade security, and neural search to augment your intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { tag: "Secure", icon: <Shield size={28} />, title: "Titanium Vault", desc: "Your files are encrypted at rest and structured contextually by AI.", color: "text-tertiary", border: "border-tertiary/30", shadow: "shadow-[0_0_30px_rgba(255,20,147,0.1)]" },
            { tag: "Intelligent", icon: <Zap size={28} />, title: "Neural Link", desc: "Talk directly to your documents. Extract answers instantly without searching.", color: "text-primary", border: "border-primary/30", shadow: "shadow-[0_0_30px_rgba(157,80,187,0.1)]" },
            { tag: "Organized", icon: <Layers size={28} />, title: "Auto-Structuring", desc: "Throw raw thoughts into the scratchpad. YUDO formats them into actionable insights.", color: "text-secondary", border: "border-secondary/30", shadow: "shadow-[0_0_30px_rgba(0,255,255,0.1)]" }
          ].map((feat, idx) => (
            <div key={idx} className="reveal-section glass-panel bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl p-8 hover:-translate-y-2 transition-all duration-300 group">
              <span className={`text-[10px] uppercase tracking-widest font-bold ${feat.color} mb-6 block`}>{feat.tag}</span>
              <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-white group-hover:${feat.color} group-hover:${feat.border} group-hover:${feat.shadow} transition-all duration-300`}>
                {feat.icon}
              </div>
              <h3 className="text-2xl font-headline font-bold text-white mb-3">{feat.title}</h3>
              <p className="text-white/50 font-body text-sm leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" className="relative z-20 py-24 container mx-auto px-6 border-t border-white/5 bg-gradient-to-b from-black to-primary/5">
        <div className="reveal-section text-center max-w-2xl mx-auto mb-20">
          <h2 className="font-headline text-4xl md:text-5xl font-bold mb-4">
            Flows at the speed of thought
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center max-w-5xl mx-auto">
          {[
            { step: "01", icon: <Database size={32} />, title: "Ingest Data", desc: "Upload PDFs, type raw notes, or drop links into your secure vault." },
            { step: "02", icon: <Cpu size={32} />, title: "AI Processing", desc: "Our engine vectorizes and connects your information automatically." },
            { step: "03", icon: <Sparkles size={32} />, title: "Instant Recall", desc: "Chat with your AI to pull insights identically as if you never forgot them." }
          ].map((item, idx) => (
            <div key={idx} className="reveal-section relative flex flex-col items-center">
              <div className="text-[120px] font-headline font-black text-white/[0.03] absolute -top-16 left-1/2 -translate-x-1/2 select-none z-0">
                {item.step}
              </div>
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary/20 to-white/5 border border-white/10 flex items-center justify-center text-primary mb-6 z-10 backdrop-blur-md shadow-[0_0_20px_rgba(157,80,187,0.15)]">
                {item.icon}
              </div>
              <h3 className="text-xl font-headline font-bold text-white mb-2 z-10">{item.title}</h3>
              <p className="text-white/50 font-body text-sm z-10 max-w-[250px]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CTA SECTION */}
      <section className="relative z-20 py-32 container mx-auto px-6 flex justify-center">
        <div className="reveal-section relative w-full max-w-4xl glass-panel bg-white/[0.02] border border-white/10 rounded-3xl p-12 md:p-20 text-center overflow-hidden">
          {/* Inner Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/20 blur-[100px] z-0" />
          
          <div className="relative z-10 flex flex-col items-center">
             <h2 className="font-headline text-4xl md:text-5xl font-bold mb-6 text-white max-w-lg leading-tight">
               Start building your <span className="text-primary tracking-tight">second brain</span> today.
             </h2>
             <p className="text-white/50 mb-10 text-lg">Join the beta and reclaim your cognitive bandwidth.</p>
             <Link to="/signup" className="px-10 py-5 rounded-full bg-white text-black font-headline font-bold text-lg hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)]">
               Create Free Account
             </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-20 border-t border-white/5 bg-black py-10 text-center text-white/30 text-sm font-label">
        <p>© {new Date().getFullYear()} YUDO AI Orchestration. All rights reserved.</p>
      </footer>

    </div>
  );
}
