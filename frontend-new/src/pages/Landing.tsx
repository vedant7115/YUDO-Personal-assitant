import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FileText, Database, PenTool, ArrowRight, Play, Shield, Zap, Sparkles, Brain, Cpu, Lock, Globe } from 'lucide-react';

import finalBg from '../assets/final-bg.png';
import finalWhyYudo from '../assets/final-why-yudo.png';
import yudoIconMain from '../assets/yudo-icon-main.webp';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function Landing() {
  const container = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    // ---------------------------------------------
    // INITIAL LOAD ANIMATIONS (HERO)
    // ---------------------------------------------
    const tl = gsap.timeline();

    tl.to('.main-bg-image', { opacity: 1, duration: 2, ease: 'power2.inOut' });

    tl.fromTo('.hero-text', 
      { y: 50, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out' },
      "-=1.5"
    );

    // Initial Floating Cards Entry
    tl.fromTo('.floating-card',
      { opacity: 0, scale: 0.8, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'back.out(1.5)' },
      "-=0.5"
    );

    gsap.utils.toArray<HTMLElement>('.floating-card').forEach((card, i) => {
      gsap.to(card, {
        y: -15 + (i * 4), 
        duration: 3 + i * 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.3
      });
    });

    // ---------------------------------------------
    // SCROLL ANIMATIONS
    // ---------------------------------------------
    
    // User requested: main bg image fades out / becomes transparent as you scroll down
    gsap.to('.main-bg-image', {
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    gsap.utils.toArray<HTMLElement>('.reveal-section').forEach((section) => {
      gsap.fromTo(section, 
        { opacity: 0, y: 50 },
        { 
          opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // Parallax floating elements on hero right side
    gsap.to('.hero-right-visual', {
      y: 100,
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom center',
        scrub: true
      }
    });

  }, { scope: container });

  return (
    <div ref={container} className="min-h-screen bg-[#050505] text-white overflow-hidden relative font-body selection:bg-primary/30">
      
      {/* ------------------------------------------- */}
      {/* GLOBAL BACKGROUND - FINAL USER IMAGE */}
      {/* ------------------------------------------- */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[#050505]">
          {/* Main User Requested Top-Level Texture: Opaque initially, transparent on scroll */}
          <img 
             src={finalBg} 
             alt="YUDO Core Main Background" 
             className="main-bg-image absolute inset-0 w-full h-full object-cover opacity-0 z-10" 
          />
          
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505] z-20" />
      </div>

      {/* ------------------------------------------- */}
      {/* NAVBAR */}
      {/* ------------------------------------------- */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl z-50">
        <div className="glass-panel bg-[#111111]/80 backdrop-blur-3xl border border-white/5 rounded-full py-3 px-6 lg:px-8 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-2">
            <img src={yudoIconMain} alt="YUDO" className="w-6 h-6 object-contain" />
            <span className="font-headline font-bold text-xl tracking-tighter text-white">YUDO</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-label text-white/50 hover:[&>a]:text-white transition-colors">
            <a href="#why-yudo">Why YUDO</a>
            <a href="#features">Architecture</a>
            <a href="#developer">Developer</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="px-5 py-2 rounded-full font-label text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
              Log In
            </Link>
            <Link to="/signup" className="px-5 py-2.5 rounded-full bg-white text-black font-label font-bold text-sm hover:scale-[1.03] transition-transform shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ------------------------------------------- */}
      {/* 1. HERO SECTION */}
      {/* ------------------------------------------- */}
      <section className="hero-section relative z-30 min-h-screen container mx-auto px-6 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-0 pt-20">
        
        {/* Left Content */}
        <div className="w-full lg:w-1/2 flex flex-col items-start justify-center lg:pr-12 text-left">
          
          <div className="hero-text mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-md">
            <Brain size={14} className="text-white" />
            <span className="font-label text-xs tracking-widest uppercase text-white font-medium">
              V1.0 Intelligence Core
            </span>
          </div>
          
          <h1 className="hero-text font-headline text-6xl md:text-[5.5rem] font-extrabold tracking-tighter mb-4 leading-[1.05]">
            <span className="text-white drop-shadow-md">Your Second</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500 drop-shadow-lg">
              Brain
            </span>
          </h1>
          
          <p className="hero-text font-body text-xl md:text-2xl text-white/60 mb-10 max-w-lg font-light tracking-wide leading-relaxed drop-shadow-md bg-black/20 p-2 rounded-lg">
            Store your life. Recall anything. Instantly.<br />
            <span className="text-white/40 text-lg">Documents. Memories. Notes. Powered by AI.</span>
          </p>
          
          <div className="hero-text flex flex-col sm:flex-row gap-5 items-center w-full sm:w-auto">
            <Link to="/signup" className="w-full sm:w-auto px-9 py-4.5 rounded-full bg-white text-black font-headline font-bold text-base hover:scale-105 transition-all flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Get Started Free
            </Link>
            
            <button className="w-full sm:w-auto px-9 py-4.5 rounded-full bg-black/40 border border-white/20 text-white font-headline font-medium hover:bg-white/10 hover:border-white/40 backdrop-blur-md transition-all flex items-center justify-center gap-2">
              <Play size={18} className="text-white" /> Watch Demo
            </button>
          </div>
        </div>

        {/* Right Content: Clean minimal floating cards over the new background */}
        <div className="hero-right-visual w-full lg:w-1/2 h-[50vh] flex items-center justify-center relative">
          
          <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center z-10 scale-90 md:scale-100">
            
            <div className="floating-card absolute top-[20%] left-[10%] glass-panel backdrop-blur-2xl border border-white/10 bg-black/70 p-5 rounded-2xl flex items-center gap-4 shadow-[0_15px_30px_rgba(0,0,0,0.8)] z-30 w-64 hover:border-white/30 transition-colors">
               <div className="bg-white/10 p-3 rounded-xl text-white">
                 <FileText size={24} />
               </div>
               <div>
                 <p className="font-headline font-bold text-sm text-white">Document Vault</p>
                 <p className="font-label text-xs text-white/50">Stored securely</p>
               </div>
            </div>

            <div className="floating-card absolute top-[40%] right-[5%] glass-panel backdrop-blur-2xl border border-white/10 bg-black/70 p-5 rounded-2xl flex items-center gap-4 shadow-[0_15px_30px_rgba(0,0,0,0.8)] z-30 w-64 hover:border-white/30 transition-colors">
               <div className="bg-white/10 p-3 rounded-xl text-white">
                 <PenTool size={24} />
               </div>
               <div>
                 <p className="font-headline font-bold text-sm text-white">Smart Notes</p>
                 <p className="font-label text-xs text-white/50">Semantic Math Ready</p>
               </div>
            </div>

            <div className="floating-card absolute bottom-[20%] left-[20%] glass-panel backdrop-blur-2xl border border-white/10 bg-black/70 p-5 rounded-2xl flex items-center gap-4 shadow-[0_15px_30px_rgba(0,0,0,0.8)] z-30 w-64 hover:border-white/30 transition-colors">
               <div className="bg-white/10 p-3 rounded-xl text-white">
                 <Brain size={24} />
               </div>
               <div>
                 <p className="font-headline font-bold text-sm text-white">Neural Memorizer</p>
                 <p className="font-label text-xs text-white/50">Context Synced</p>
               </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* ------------------------------------------- */}
      {/* 2. THE 4 PILLARS (DIRECT IMAGE OVERLAY) */}
      {/* ------------------------------------------- */}
      <section id="why-yudo" className="relative z-30 py-32 container mx-auto px-6 bg-[#050505]">
        <div className="reveal-section text-center max-w-2xl mx-auto mb-16">
          <span className="font-label text-xs tracking-widest uppercase text-white/40 mb-2 block">Why YUDO?</span>
          <h2 className="font-headline text-4xl md:text-5xl font-bold mb-4 text-white tracking-tight">
            The 4 Core Pillars
          </h2>
          <p className="text-white/50 font-body text-xl">
            Everything about you, organically mapped into the Master Core.
          </p>
        </div>

        {/* Custom Container encapsulating the user's specific 4-panel image */}
        <div className="relative w-full max-w-6xl mx-auto rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,1)] bg-black reveal-section group">
           
           {/* The Image (acts as size driver for the entire grid) */}
           <img 
              src={finalWhyYudo} 
              alt="YUDO Architecture Panels" 
              className="w-full h-auto object-cover relative z-0 transition-transform duration-1000 group-hover:scale-[1.01]" 
           />
           
           {/* The Overlay Boxes - positioned absolutely via precise percentages into the image's drawn borders */}
           <div className="absolute inset-0 z-10">
               
               {/* Panel 1 Overlay (Top Left) */}
               <div className="absolute flex flex-col justify-start md:justify-center items-start md:items-center text-left md:text-center p-2 lg:p-4 overflow-hidden" 
                    style={{ top: '22.8%', left: '9.3%', width: '20.2%', height: '23.2%' }}>
                  <h3 className="text-[10px] sm:text-sm md:text-lg lg:text-xl font-headline font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 mb-2 px-3 py-1 border border-white/10 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.05)] backdrop-blur-md">
                    1. Document Vault
                  </h3>
                  <p className="text-white/50 font-body text-[8px] sm:text-[10px] md:text-sm lg:text-sm leading-tight md:leading-relaxed max-w-[90%] font-light">
                    A secure drop-zone for passwords and unstructured files. YUDO absorbs absolute vectors instantly.
                  </p>
               </div>

               {/* Panel 2 Overlay (Bottom Left) */}
               <div className="absolute flex flex-col justify-start md:justify-center items-start md:items-center text-left md:text-center p-2 lg:p-4 overflow-hidden" 
                    style={{ top: '46.8%', left: '9.3%', width: '20.2%', height: '23.2%' }}>
                  <h3 className="text-[10px] sm:text-sm md:text-lg lg:text-xl font-headline font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 mb-2 px-3 py-1 border border-white/10 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.05)] backdrop-blur-md">
                    2. YUDO Memorizer
                  </h3>
                  <p className="text-white/50 font-body text-[8px] sm:text-[10px] md:text-sm lg:text-sm leading-tight md:leading-relaxed max-w-[90%] font-light">
                    Your dynamic, ambient memory engine. Brain-dump casual thoughts, and YUDO maps events perfectly.
                  </p>
               </div>

               {/* Panel 3 Overlay (Top Right) */}
               <div className="absolute flex flex-col justify-start md:justify-center items-start md:items-center text-left md:text-center p-2 lg:p-4 overflow-hidden" 
                    style={{ top: '38.6%', left: '70.5%', width: '20.2%', height: '23.2%' }}>
                  <h3 className="text-[10px] sm:text-sm md:text-lg lg:text-xl font-headline font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 mb-2 px-3 py-1 border border-white/10 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.05)] backdrop-blur-md">
                    3. Effective Semantics
                  </h3>
                  <p className="text-white/50 font-body text-[8px] sm:text-[10px] md:text-sm lg:text-sm leading-tight md:leading-relaxed max-w-[90%] font-light">
                    YUDO grasps meaning and math deep within raw text. Chaotic plans calculate instantly.
                  </p>
               </div>

               {/* Panel 4 Overlay (Bottom Right) */}
               <div className="absolute flex flex-col justify-start md:justify-center items-start md:items-center text-left md:text-center p-2 lg:p-4 overflow-hidden" 
                    style={{ top: '62.6%', left: '70.5%', width: '20.2%', height: '23.2%' }}>
                  <h3 className="text-[10px] sm:text-sm md:text-lg lg:text-xl font-headline font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 mb-2 px-3 py-1 border border-white/10 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.05)] backdrop-blur-md">
                    4. Unified AI Agent
                  </h3>
                  <p className="text-white/50 font-body text-[8px] sm:text-[10px] md:text-sm lg:text-sm leading-tight md:leading-relaxed max-w-[90%] font-light">
                    The master intelligence. Query logic, life tracking, or deep web through singular chat.
                  </p>
               </div>
               
           </div>
        </div>
      </section>

      {/* ------------------------------------------- */}
      {/* 3. ABOUT SECTION */}
      {/* ------------------------------------------- */}
      <section id="developer" className="relative z-20 py-24 my-12 container mx-auto px-6 bg-[#050505]">
        <div className="reveal-section relative max-w-5xl mx-auto glass-panel bg-[#0a0a0a] border border-white/5 rounded-3xl p-10 md:p-16 flex flex-col md:flex-row gap-12 items-center overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
           
           <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-full border-2 border-white/10 overflow-hidden relative bg-[#111] shadow-[0_0_30px_rgba(255,255,255,0.05)]">
              <img src={yudoIconMain} alt="Creator" className="w-full h-full object-cover opacity-60 mix-blend-lighten grayscale px-4" />
           </div>

           <div className="flex-1 text-center md:text-left relative z-10">
             <h3 className="font-headline text-2xl md:text-3xl font-bold mb-4 text-white">
               Built by a developer who believes memory is power
             </h3>
             <p className="font-body text-white/50 text-lg mb-8 leading-relaxed max-w-2xl font-light">
               I am building YUDO to solve a visceral problem — we constantly lose track of profound information, let relationships slip, and waste hours searching basic files. YUDO is engineered to become your ultimate, highly-secured personal intelligence system.
             </p>
             <div className="flex items-center justify-center md:justify-start gap-4">
                <a href="https://github.com/vedant7115" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                  <Globe size={18} />
                </a>
                <div className="ml-2 pl-4 border-l border-white/10 font-label text-sm text-white/30 uppercase tracking-widest">
                   Vedant Singh // Architect
                </div>
             </div>
           </div>
        </div>
      </section>

      {/* ------------------------------------------- */}
      {/* 4. FINAL CTA SECTION */}
      {/* ------------------------------------------- */}
      <section className="relative z-20 pt-16 pb-32 container mx-auto px-6 bg-[#050505] flex justify-center">
        <div className="reveal-section relative w-full max-w-4xl rounded-3xl p-[1px] bg-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)] hover:shadow-[0_0_80px_rgba(255,255,255,0.1)] transition-shadow duration-500">
           <div className="bg-[#050505] rounded-[23px] p-16 md:p-24 text-center overflow-hidden relative flex flex-col items-center">
              
              <h2 className="relative z-10 font-headline text-4xl md:text-5xl font-extrabold mb-10 text-white tracking-tight leading-tight">
                Start building your <br />second brain today.
              </h2>
              <Link to="/signup" className="relative z-10 px-12 py-5 rounded-full bg-white text-black font-headline font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                Initialize System
              </Link>
           </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-20 border-t border-white/5 bg-[#030303] py-12 flex justify-center text-center">
        <p className="text-white/20 text-xs font-label tracking-widest uppercase">© {new Date().getFullYear()} YUDO. All systems nominal.</p>
      </footer>

    </div>
  );
}
