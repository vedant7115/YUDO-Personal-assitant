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
    const tl = gsap.timeline();

    // ---------------------------------------------
    // INITIAL LOAD ANIMATIONS (HERO)
    // ---------------------------------------------
    // Slow animated gradient background
    gsap.to('.hero-gradient-overlay', {
      backgroundPosition: '200% center',
      duration: 20,
      repeat: -1,
      ease: 'linear'
    });

    // Fade in main bg
    tl.to('.main-bg-image', { opacity: 1, duration: 2, ease: 'power2.inOut' });

    // Staggered text reveal
    tl.fromTo('.hero-text', 
      { y: 40, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power3.out' },
      "-=1.5"
    );

    // Initial Floating Cards Entry with stagger
    tl.fromTo('.floating-card',
      { opacity: 0, scale: 0.85, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 1, stagger: 0.2, ease: 'back.out(1.2)' },
      "-=0.8"
    );

    // Continuous floating motion (GPU friendly transforms)
    gsap.utils.toArray<HTMLElement>('.floating-card').forEach((card, i) => {
      gsap.to(card, {
        y: -10 + (i * 3), 
        rotationZ: i % 2 === 0 ? 1 : -1,
        duration: 3.5 + i * 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.2
      });
    });

    // ---------------------------------------------
    // SCROLL ANIMATIONS
    // ---------------------------------------------
    
    // Navbar stickiness trigger
    ScrollTrigger.create({
      start: 'top -50',
      end: 99999,
      toggleClass: { className: 'nav-scrolled', targets: '.main-nav' }
    });

    // Hero background fades out slightly on scroll
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

    // Parallax floating elements on hero right side (slower than text)
    gsap.to('.hero-right-visual', {
      y: 120, // Parallax down
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    // Section Reveals
    gsap.utils.toArray<HTMLElement>('.reveal-section').forEach((section) => {
      gsap.fromTo(section, 
        { opacity: 0, y: 60 },
        { 
          opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // Center robot image floating animation & scroll parallax
    gsap.to('.why-yudo-img', {
      y: -15,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    gsap.to('.why-yudo-container', {
      y: 50,
      ease: 'none',
      scrollTrigger: {
        trigger: '#why-yudo',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });

    // Staggered appearance of the 4 pillar text boxes
    gsap.fromTo('.pillar-box', 
      { opacity: 0, scale: 0.95, y: 20 },
      { 
        opacity: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out',
        scrollTrigger: {
          trigger: '.why-yudo-container',
          start: 'top 70%'
        }
      }
    );

  }, { scope: container });

  return (
    <div ref={container} className="min-h-screen bg-[#050505] text-white overflow-hidden relative font-body selection:bg-purple-500/30">
      
      {/* GLOBAL BACKGROUND ENHANCEMENTS */}
      {/* Subtle grain/noise texture overlay via CSS radial gradient approximations */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] mix-blend-overlay bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#000_100%)] grid" style={{ backgroundSize: '4px 4px', backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)' }} />

      <div className="fixed inset-0 pointer-events-none z-0 bg-[#050505]">
          <img 
             src={finalBg} 
             alt="YUDO Core Main Background" 
             className="main-bg-image absolute inset-0 w-full h-full object-cover opacity-0 z-10" 
          />
          {/* Animated gradient overlay for depth */}
          <div className="hero-gradient-overlay absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-pink-900/10 bg-[length:200%_200%] z-20 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/60 to-[#050505] z-30" />
      </div>

      {/* NAVBAR */}
      <nav className="main-nav fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl z-50 transition-all duration-500 [&.nav-scrolled>.glass-panel]:bg-[#050505]/95 [&.nav-scrolled>.glass-panel]:border-white/10 [&.nav-scrolled>.glass-panel]:shadow-[0_15px_40px_rgba(0,0,0,0.9)]">
        <div className="glass-panel bg-[#111111]/80 backdrop-blur-3xl border border-white/5 rounded-full py-3 px-6 lg:px-8 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.8)] transition-all duration-500">
          <div className="flex items-center gap-2">
            <img src={yudoIconMain} alt="YUDO" className="w-6 h-6 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
            <span className="font-headline font-bold text-xl tracking-tighter text-white">YUDO</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-label text-white/50">
            <a href="#why-yudo" className="relative hover:text-white transition-colors after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-px after:bg-purple-500 after:transition-all hover:after:w-full">Why YUDO</a>
            <a href="#features" className="relative hover:text-white transition-colors after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-px after:bg-purple-500 after:transition-all hover:after:w-full">Architecture</a>
            <a href="#developer" className="relative hover:text-white transition-colors after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-px after:bg-purple-500 after:transition-all hover:after:w-full">Developer</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="px-5 py-2 rounded-full font-label text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
              Log In
            </Link>
            {/* Added hover scale + glow intensification */}
            <Link to="/signup" className="px-5 py-2.5 rounded-full bg-white text-black font-label font-bold text-sm hover:scale-[1.05] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="hero-section relative z-30 min-h-screen container mx-auto px-6 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-0 pt-20">
        
        {/* Left Content */}
        <div className="w-full lg:w-1/2 flex flex-col items-start justify-center lg:pr-12 text-left relative z-20">
          
          <div className="hero-text mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <Brain size={14} className="text-purple-400" />
            <span className="font-label text-xs tracking-widest uppercase text-white/90 font-medium">
              V1.0 Intelligence Core
            </span>
          </div>
          
          <h1 className="hero-text font-headline text-6xl md:text-[5.5rem] font-extrabold tracking-tighter mb-4 leading-[1.05]">
            <span className="text-white drop-shadow-md">Your Second</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 drop-shadow-lg">
              Brain
            </span>
          </h1>
          
          <p className="hero-text font-body text-xl md:text-2xl text-white/60 mb-10 max-w-lg font-light tracking-wide leading-relaxed drop-shadow-md bg-black/30 backdrop-blur-sm p-3 rounded-xl border border-white/5">
            Store your life. Recall anything. Instantly.<br />
            <span className="text-white/40 text-lg">Documents. Memories. Notes. Powered by AI.</span>
          </p>
          
          <div className="hero-text flex flex-col sm:flex-row gap-5 items-center w-full sm:w-auto">
            <Link to="/signup" className="w-full sm:w-auto px-9 py-4.5 rounded-full bg-white text-black font-headline font-bold text-base hover:scale-105 hover:bg-gray-100 transition-all duration-300 flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:shadow-[0_0_35px_rgba(255,255,255,0.5)]">
              Get Started Free
            </Link>
            
            <button className="w-full sm:w-auto px-9 py-4.5 rounded-full bg-black/40 border border-white/20 text-white font-headline font-medium hover:bg-white/10 hover:border-white/40 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] backdrop-blur-xl transition-all duration-300 flex items-center justify-center gap-2 group">
              <Play size={18} className="text-white group-hover:text-purple-400 transition-colors" /> Watch Demo
            </button>
          </div>
        </div>

        {/* Right Content: Floating cards */}
        <div className="hero-right-visual w-full lg:w-1/2 h-[50vh] flex items-center justify-center relative z-10">
          
          {/* Radial soft glow behind the cards giving depth */}
          <div className="absolute inset-0 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center z-10 scale-90 md:scale-100">
            
            <div className="floating-card absolute top-[20%] left-[10%] glass-panel backdrop-blur-3xl border border-white/10 bg-black/60 p-5 rounded-2xl flex items-center gap-4 shadow-[0_15px_30px_rgba(0,0,0,0.8)] z-30 w-64 hover:scale-105 hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all duration-300 group cursor-default">
               <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-white group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors">
                 <FileText size={24} />
               </div>
               <div>
                 <p className="font-headline font-bold text-sm text-white">Document Vault</p>
                 <p className="font-label text-xs text-white/50">Stored securely</p>
               </div>
            </div>

            <div className="floating-card absolute top-[40%] right-[3%] glass-panel backdrop-blur-3xl border border-white/10 bg-black/60 p-5 rounded-2xl flex items-center gap-4 shadow-[0_15px_30px_rgba(0,0,0,0.8)] z-30 w-64 hover:scale-105 hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all duration-300 group cursor-default">
               <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-white group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors">
                 <PenTool size={24} />
               </div>
               <div>
                 <p className="font-headline font-bold text-sm text-white">Smart Notes</p>
                 <p className="font-label text-xs text-white/50">Semantic Math Ready</p>
               </div>
            </div>

            <div className="floating-card absolute bottom-[20%] left-[20%] glass-panel backdrop-blur-3xl border border-white/10 bg-black/60 p-5 rounded-2xl flex items-center gap-4 shadow-[0_15px_30px_rgba(0,0,0,0.8)] z-30 w-64 hover:scale-105 hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all duration-300 group cursor-default">
               <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-white group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors">
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

      {/* 2. THE 4 PILLARS (IMAGE OVERLAY ENHANCED) */}
      <section id="why-yudo" className="relative z-30 py-32 container mx-auto px-6 bg-transparent">
        <div className="reveal-section text-center max-w-2xl mx-auto mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none z-[-1]" />
          <span className="font-label text-xs tracking-widest uppercase text-purple-400/70 mb-2 block animate-pulse">Why YUDO?</span>
          <h2 className="font-headline text-4xl md:text-5xl font-bold mb-4 text-white tracking-tight drop-shadow-lg">
            The 4 Core Pillars
          </h2>
          <p className="text-white/60 font-body text-xl font-light">
            Everything about you, organically mapped into the Master Core.
          </p>
        </div>

        {/* Enhanced Glassmorphism Container with Hover Glow */}
        <div className="why-yudo-container relative w-full max-w-6xl mx-auto rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] hover:shadow-[0_0_100px_rgba(168,85,247,0.15)] bg-[#050505] transition-all duration-700 group">
           
           {/* Center robot image floating animation + scroll parallax */}
           <img 
              src={finalWhyYudo} 
              alt="YUDO Architecture Panels" 
              className="why-yudo-img w-full h-auto object-cover relative z-0 transition-transform duration-1000 group-hover:scale-[1.02]" 
           />
           
           <div className="absolute inset-0 z-10 pointer-events-none">
               {/* Ambient inner glow pulse */}
               <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-black/80" />
           </div>

           {/* The Overlay Boxes - Positioned logically over the image panels with extreme glassmorphism */}
           <div className="absolute inset-0 z-20 pointer-events-auto">
               
               {/* Panel 1 */}
               <div className="pillar-box absolute flex flex-col justify-start md:justify-center items-start md:items-center text-left md:text-center p-2 lg:p-4 overflow-hidden rounded-2xl hover:bg-white/5 hover:backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] border border-transparent hover:border-purple-500/20 group/box" 
                    style={{ top: '22.8%', left: '9.3%', width: '20.2%', height: '23.2%' }}>
                  <h3 className="text-[10px] sm:text-sm md:text-lg lg:text-xl font-headline font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-2 px-3 py-1 border border-white/10 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.05)] backdrop-blur-lg group-hover/box:border-purple-400/40 transition-colors">
                    1. Document Vault
                  </h3>
                  <p className="text-white/60 font-body text-[8px] sm:text-[10px] md:text-sm lg:text-sm leading-tight md:leading-relaxed max-w-[90%] font-light group-hover/box:text-white/80 transition-colors">
                    A secure drop-zone for passwords and unstructured files. YUDO absorbs absolute vectors instantly.
                  </p>
               </div>

               {/* Panel 2 */}
               <div className="pillar-box absolute flex flex-col justify-start md:justify-center items-start md:items-center text-left md:text-center p-2 lg:p-4 overflow-hidden rounded-2xl hover:bg-white/5 hover:backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] border border-transparent hover:border-purple-500/20 group/box" 
                    style={{ top: '46.8%', left: '9.3%', width: '20.2%', height: '23.2%' }}>
                  <h3 className="text-[10px] sm:text-sm md:text-lg lg:text-xl font-headline font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-2 px-3 py-1 border border-white/10 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.05)] backdrop-blur-lg group-hover/box:border-purple-400/40 transition-colors">
                    2. YUDO Memorizer
                  </h3>
                  <p className="text-white/60 font-body text-[8px] sm:text-[10px] md:text-sm lg:text-sm leading-tight md:leading-relaxed max-w-[90%] font-light group-hover/box:text-white/80 transition-colors">
                    Your dynamic, ambient memory engine. Brain-dump casual thoughts, and YUDO maps events perfectly.
                  </p>
               </div>

               {/* Panel 3 */}
               <div className="pillar-box absolute flex flex-col justify-start md:justify-center items-start md:items-center text-left md:text-center p-2 lg:p-4 overflow-hidden rounded-2xl hover:bg-white/5 hover:backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] border border-transparent hover:border-purple-500/20 group/box" 
                    style={{ top: '38.6%', left: '70.5%', width: '20.2%', height: '23.2%' }}>
                  <h3 className="text-[10px] sm:text-sm md:text-lg lg:text-xl font-headline font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-2 px-3 py-1 border border-white/10 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.05)] backdrop-blur-lg group-hover/box:border-purple-400/40 transition-colors">
                    3. Effective Semantics
                  </h3>
                  <p className="text-white/60 font-body text-[8px] sm:text-[10px] md:text-sm lg:text-sm leading-tight md:leading-relaxed max-w-[90%] font-light group-hover/box:text-white/80 transition-colors">
                    YUDO grasps meaning and math deep within raw text. Chaotic plans calculate instantly.
                  </p>
               </div>

               {/* Panel 4 */}
               <div className="pillar-box absolute flex flex-col justify-start md:justify-center items-start md:items-center text-left md:text-center p-2 lg:p-4 overflow-hidden rounded-2xl hover:bg-white/5 hover:backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] border border-transparent hover:border-purple-500/20 group/box" 
                    style={{ top: '62.6%', left: '70.5%', width: '20.2%', height: '23.2%' }}>
                  <h3 className="text-[10px] sm:text-sm md:text-lg lg:text-xl font-headline font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-2 px-3 py-1 border border-white/10 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.05)] backdrop-blur-lg group-hover/box:border-purple-400/40 transition-colors">
                    4. Unified AI Agent
                  </h3>
                  <p className="text-white/60 font-body text-[8px] sm:text-[10px] md:text-sm lg:text-sm leading-tight md:leading-relaxed max-w-[90%] font-light group-hover/box:text-white/80 transition-colors">
                    The master intelligence. Query logic, life tracking, or deep web through singular chat.
                  </p>
               </div>
               
           </div>
        </div>
      </section>

      {/* 3. ABOUT SECTION */}
      <section id="developer" className="relative z-20 py-24 my-12 container mx-auto px-6 bg-transparent">
        <div className="reveal-section relative max-w-5xl mx-auto glass-panel bg-gradient-to-br from-[#121212] to-[#050505] border border-white/5 hover:border-purple-500/30 rounded-3xl p-10 md:p-16 flex flex-col md:flex-row gap-12 items-center overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.5)] hover:shadow-[0_0_50px_rgba(168,85,247,0.1)] transition-all duration-500 group">
           
           <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-full border-2 border-white/10 group-hover:border-purple-500/40 overflow-hidden relative bg-[#111] shadow-[0_0_30px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] transition-all duration-500">
              <img src={yudoIconMain} alt="Creator" className="w-full h-full object-cover opacity-60 mix-blend-lighten grayscale px-4 group-hover:scale-110 transition-transform duration-700" />
           </div>

           <div className="flex-1 text-center md:text-left relative z-10">
             <h3 className="font-headline text-2xl md:text-3xl font-bold mb-4 text-white">
               Built by a developer who believes memory is power
             </h3>
             <p className="font-body text-white/60 text-lg mb-8 leading-relaxed max-w-2xl font-light">
               I am building YUDO to solve a visceral problem — we constantly lose track of profound information, let relationships slip, and waste hours searching basic files. YUDO is engineered to become your ultimate, highly-secured personal intelligence system.
             </p>
             <div className="flex items-center justify-center md:justify-start gap-4">
                <a href="https://github.com/vedant7115" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 hover:border-white/30 transition-colors group/git">
                  <Globe size={18} className="group-hover/git:scale-110 transition-transform" />
                </a>
                <div className="ml-2 pl-4 border-l border-white/10 font-label text-sm text-white/40 uppercase tracking-widest">
                   Vedant Singh // Architect
                </div>
             </div>
           </div>
        </div>
      </section>

      {/* 4. FINAL CTA SECTION */}
      <section className="relative z-20 pt-16 pb-32 container mx-auto px-6 bg-transparent flex justify-center">
        {/* Soft purple glow behind CTA card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-purple-600/20 blur-[150px] rounded-full pointer-events-none z-[1]" />
        
        <div className="reveal-section relative z-10 w-full max-w-4xl rounded-3xl p-[1px] bg-gradient-to-b from-white/10 to-transparent shadow-[0_0_50px_rgba(168,85,247,0.1)] hover:shadow-[0_0_100px_rgba(168,85,247,0.2)] transition-all duration-700 hover:scale-[1.01]">
           <div className="bg-[#050505] rounded-[23px] p-16 md:p-24 text-center overflow-hidden relative flex flex-col items-center">
              
              <h2 className="relative z-10 font-headline text-4xl md:text-5xl font-extrabold mb-10 text-white tracking-tight leading-tight drop-shadow-xl">
                Start building your <br />second brain today.
              </h2>
              <Link to="/signup" className="relative z-10 px-12 py-5 rounded-full bg-white text-black font-headline font-bold text-lg hover:scale-110 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:shadow-[0_0_50px_rgba(168,85,247,0.6)] group overflow-hidden">
                <span className="relative z-10">Initialize System</span>
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-white via-purple-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
           </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-20 border-t border-white/5 bg-[#030303] py-12 flex justify-center text-center backdrop-blur-xl">
        <p className="text-white/30 text-xs font-label tracking-widest uppercase hover:text-purple-400/70 transition-colors cursor-default">© {new Date().getFullYear()} YUDO. All systems nominal.</p>
      </footer>

    </div>
  );
}
