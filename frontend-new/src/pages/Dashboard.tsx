import { useEffect, useState, useRef } from 'react';
import { Activity, Brain, FileText, Target, Edit3, Loader2, Zap, Network, Sparkles, HardDrive } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:8000/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useGSAP(() => {
    if (!loading) {
      // Staggered component reveals
      gsap.fromTo(".gsap-reveal", 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );
      
      // Floating card animation
      gsap.to(".gsap-float", {
        y: -5,
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: 0.2
      });

      // Orb pulse
      if (orbRef.current) {
        gsap.to(orbRef.current, {
          scale: 1.05,
          opacity: 0.8,
          duration: 3,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut"
        });
      }
    }
  }, [loading]);

  const statCards = stats ? [
    { title: 'Total Documents', value: stats.documents.toString(), icon: <FileText size={20} />, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Notes Saved', value: stats.notes.toString(), icon: <Edit3 size={20} />, color: 'text-secondary', bg: 'bg-secondary/10' },
    { title: 'AI Memories', value: stats.memories.toString(), icon: <Brain size={20} />, color: 'text-tertiary', bg: 'bg-tertiary/10' },
    { title: 'Active Goals', value: stats.goals?.in_progress?.toString() || '0', icon: <Target size={20} />, color: 'text-green-400', bg: 'bg-green-400/10' },
  ] : [];

  return (
    <div className="space-y-8 pb-10 relative" ref={containerRef}>
      {/* Background Neural Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-screen" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 blur-[100px]"></div>

      {/* Hero Section */}
      <div className="gsap-reveal relative overflow-hidden rounded-3xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)] bg-surface group transition-all hover:border-primary/30">
        <div className="absolute inset-0">
          <img 
            src="/images/final main page landing background.png" 
            alt="Dashboard Background" 
            className="w-full h-full object-cover opacity-40 mix-blend-screen transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 p-10 flex items-center justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]"></div>
              <span className="font-label text-xs uppercase tracking-[0.2em] text-green-400 font-bold">System Online</span>
            </div>
            <h1 className="font-headline text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg flex items-center gap-4">
              Neural Central Hub
            </h1>
            <p className="font-body text-on-surface-variant text-lg leading-relaxed">
              Welcome back. Your personal AI memory and digital vault are fully synced and operational.
            </p>
          </div>
          <div className="hidden md:block relative w-40 h-40">
             <div ref={orbRef} className="absolute inset-0 bg-primary/40 blur-3xl rounded-full"></div>
             <img src="/images/YUDO ICON.webp" alt="YUDO AI" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_25px_rgba(237,177,255,0.6)]" />
          </div>
        </div>
      </div>

      {/* Stats row */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => (
              <div 
                key={stat.title}
                className="gsap-reveal gsap-float relative overflow-hidden glass-panel p-6 rounded-2xl border border-white/5 hover:border-primary/40 transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.15)] hover:-translate-y-1"
              >
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors duration-500"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} shadow-lg backdrop-blur-md group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="font-label text-xs text-on-surface-variant mb-1 uppercase tracking-widest">{stat.title}</p>
                    <p className="font-headline font-bold text-4xl text-white drop-shadow-md">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
            
            {/* LEFT AREA: AI Activity Feed & Memory Sync */}
            <div className="lg:col-span-4 space-y-8">
              <div className="gsap-reveal glass-panel p-8 rounded-3xl border border-white/5 min-h-[400px] relative overflow-hidden group hover:border-white/20 transition-all duration-500 shadow-lg">
                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none transition-opacity duration-500 group-hover:opacity-20">
                  <img src="/images/background icon only for yudo landing page.png" className="w-full h-full object-cover" alt="" />
                </div>
                <div className="absolute -left-10 -top-10 w-40 h-40 bg-secondary/10 blur-[50px] rounded-full pointer-events-none"></div>

                <h2 className="font-headline font-semibold text-xl mb-6 text-white flex items-center gap-3 relative z-10">
                  <Network className="text-secondary w-5 h-5" /> Recent Memory Sync
                </h2>
                
                {stats?.recent_timeline?.length > 0 ? (
                  <div className="space-y-4 relative z-10">
                    {stats.recent_timeline.map((item: any, i: number) => (
                      <div key={i} className="flex gap-4 p-4 rounded-2xl bg-surface-container/30 border border-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm group/item">
                        <div className="w-2 h-2 mt-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(var(--color-secondary-rgb),0.8)] group-hover/item:scale-150 transition-transform shrink-0"></div>
                        <div>
                          <p className="font-label font-bold text-sm text-white mb-1 leading-snug">{item.event_title}</p>
                          <p className="font-body text-xs text-on-surface-variant flex items-center gap-2">
                             <Activity size={12} className="text-primary" /> {new Date(item.event_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 opacity-60 relative z-10">
                    <Activity className="w-12 h-12 text-on-surface-variant mb-4 opacity-50" />
                    <p className="font-body text-sm text-on-surface-variant text-center">No recent sync activity.</p>
                  </div>
                )}
              </div>
            </div>

            {/* CENTER: Main Actions & Orb */}
            <div className="lg:col-span-5 space-y-8">
              <div className="gsap-reveal glass-panel p-8 rounded-3xl border border-white/5 overflow-hidden relative shadow-lg group hover:border-primary/20 transition-all duration-500 flex flex-col justify-center h-full min-h-[400px]">
                <div className="absolute inset-0 opacity-10 mix-blend-overlay">
                   <img src="/images/features  inspiration.jpg" className="w-full h-full object-cover" alt="" />
                </div>
                <div className="absolute right-0 bottom-0 w-64 h-64 bg-primary/10 blur-[80px] pointer-events-none group-hover:bg-primary/20 transition-colors duration-1000"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                   <div className="w-24 h-24 rounded-full bg-surface-container border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] relative">
                      <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
                      <Brain className="text-primary w-10 h-10" />
                   </div>
                   <div>
                     <h2 className="font-headline font-bold text-2xl mb-2 text-white">Neural Actions</h2>
                     <p className="font-body text-sm text-on-surface-variant px-4">Engage with your AI, run deep analysis, or extract semantic insights from your vault.</p>
                   </div>
                   
                   <div className="w-full space-y-3 pt-4">
                     <button 
                       disabled 
                       title="Deep semantic scanning is in development"
                       className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 opacity-60 cursor-not-allowed font-label text-sm text-white/70 flex items-center justify-center gap-3 transition-all"
                     >
                        <Sparkles size={18} className="text-primary/70" /> Initiate Deep Scan 
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-semibold tracking-wider uppercase ml-1">Coming soon</span>
                     </button>
                     <button 
                       disabled 
                       title="Manual vault backup is in development"
                       className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 opacity-60 cursor-not-allowed font-label text-sm text-white/70 flex items-center justify-center gap-3 transition-all"
                     >
                        <HardDrive size={18} className="text-secondary/70" /> Manual Vault Backup 
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/20 text-secondary border border-secondary/30 font-semibold tracking-wider uppercase ml-1">Coming soon</span>
                     </button>
                   </div>
                </div>
              </div>
            </div>
            
            {/* RIGHT AREA: Mini Analytics & Journal */}
            <div className="lg:col-span-3 space-y-8">
              {/* Analytics Mini Widget (Backed by real database stats) */}
              <div className="gsap-reveal glass-panel p-6 rounded-3xl border border-white/5 shadow-lg group hover:border-white/20 transition-all duration-300">
                <h3 className="font-headline font-semibold text-sm uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
                  <Zap size={14} className="text-yellow-400" /> Vault Overview
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-label mb-1">
                      <span className="text-white">Goal Completion</span>
                      <span className="text-primary">
                        {stats?.goals?.total ? Math.round(((stats.goals.completed || 0) / stats.goals.total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.8)]"
                        style={{ width: `${stats?.goals?.total ? Math.round(((stats.goals.completed || 0) / stats.goals.total) * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-label mb-1">
                      <span className="text-white">Total Stored Items</span>
                      <span className="text-secondary font-bold">
                        {(stats?.documents || 0) + (stats?.notes || 0) + (stats?.memories || 0)} items
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-secondary w-full shadow-[0_0_10px_rgba(var(--color-secondary-rgb),0.8)]"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Journal Snapshot */}
              <div className="gsap-reveal glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-white/20 transition-all duration-500">
                <div className="absolute inset-0 opacity-10 mix-blend-overlay">
                   <img src="/images/yudo inspiration landing page purple theme.jpg" className="w-full h-full object-cover" alt="" />
                </div>
                <h2 className="font-headline font-semibold text-lg mb-4 text-white relative z-10 flex items-center gap-2">
                  <Edit3 size={18} className="text-tertiary" /> Latest Journal
                </h2>
                {stats?.latest_journal ? (
                  <div className="p-4 rounded-2xl bg-surface-container/60 border border-white/10 backdrop-blur-md relative z-10 transition-transform duration-300 group-hover:scale-[1.02]">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-label text-on-surface-variant">{new Date(stats.latest_journal.date).toLocaleDateString()}</span>
                      <span className="text-[10px] px-2 py-1 bg-primary/20 border border-primary/30 rounded-full text-primary font-bold tracking-wide uppercase">{stats.latest_journal.mood}</span>
                    </div>
                    <p className="font-body text-sm text-on-surface-variant line-clamp-4 leading-relaxed">
                      {stats.latest_journal.entry_text}
                    </p>
                  </div>
                ) : (
                  <div className="p-5 text-center border border-dashed border-white/20 rounded-2xl relative z-10 bg-white/5">
                    <p className="font-body text-xs text-on-surface-variant">
                      No journal entry found.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
