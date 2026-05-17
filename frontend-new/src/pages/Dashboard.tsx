import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Brain, FileText, Target, Calendar, Edit3, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const statCards = stats ? [
    { title: 'Total Documents', value: stats.documents.toString(), icon: <FileText size={20} />, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Notes Saved', value: stats.notes.toString(), icon: <Edit3 size={20} />, color: 'text-secondary', bg: 'bg-secondary/10' },
    { title: 'AI Memories', value: stats.memories.toString(), icon: <Brain size={20} />, color: 'text-tertiary', bg: 'bg-tertiary/10' },
    { title: 'Active Goals', value: stats.goals?.in_progress?.toString() || '0', icon: <Target size={20} />, color: 'text-green-400', bg: 'bg-green-400/10' },
  ] : [];

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
      >
        <div className="absolute inset-0">
          <img 
            src="/images/final main page landing background.png" 
            alt="Dashboard Background" 
            className="w-full h-full object-cover opacity-40 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 p-10 flex items-center justify-between">
          <div className="max-w-xl">
            <h1 className="font-headline text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg">
              Your AI Central Hub
            </h1>
            <p className="font-body text-on-surface-variant text-lg leading-relaxed">
              Welcome back to YUDO. Your personal AI memory and digital vault are fully synced and operational.
            </p>
          </div>
          <div className="hidden md:block relative w-40 h-40">
             <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse"></div>
             <img src="/images/YUDO ICON.webp" alt="YUDO AI" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_15px_rgba(237,177,255,0.5)]" />
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, idx) => (
              <motion.div 
                key={stat.title}
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="relative overflow-hidden glass-panel p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all cursor-pointer group shadow-lg hover:shadow-primary/10"
              >
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} shadow-lg backdrop-blur-md`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="font-label text-sm text-on-surface-variant mb-1 uppercase tracking-wider">{stat.title}</p>
                    <p className="font-headline font-bold text-4xl text-white">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
            {/* Recent Timeline / Activity */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-white/5 min-h-[400px] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                <img src="/images/background icon only for yudo landing page.png" className="w-full h-full object-cover" alt="" />
              </div>

              <h2 className="font-headline font-semibold text-2xl mb-8 text-white flex items-center gap-3 relative z-10">
                <Activity className="text-secondary w-6 h-6" /> Recent Activity
              </h2>
              
              {stats?.recent_timeline?.length > 0 ? (
                <div className="space-y-4 relative z-10">
                  {stats.recent_timeline.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-5 p-5 rounded-2xl bg-surface-container/50 border border-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-surface-container-high to-surface-container flex items-center justify-center text-primary shadow-inner">
                        <Calendar size={24} />
                      </div>
                      <div>
                        <p className="font-label font-bold text-lg text-white mb-1">{item.event_title}</p>
                        <p className="font-body text-sm text-on-surface-variant">{new Date(item.event_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 opacity-60 relative z-10">
                  <div className="w-32 h-32 rounded-3xl overflow-hidden mb-6 shadow-2xl border border-white/10">
                    <img src="/images/icon box robot.jpg" alt="Empty" className="w-full h-full object-cover" />
                  </div>
                  <p className="font-body text-lg text-on-surface-variant">No recent activity detected in the vault.</p>
                </div>
              )}
            </motion.div>

            {/* Quick Actions & AI Snapshot */}
            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: 0.5 }}
                className="glass-panel p-8 rounded-3xl border border-white/5 overflow-hidden relative shadow-lg"
              >
                <div className="absolute right-0 top-0 w-48 h-48 bg-primary/20 blur-[60px]"></div>
                <h2 className="font-headline font-semibold text-xl mb-6 text-white relative z-10">Quick Actions</h2>
                <div className="space-y-4 relative z-10">
                   <button className="w-full text-left px-6 py-5 rounded-2xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30 hover:border-primary/60 hover:from-primary/30 transition-all font-label text-base text-white flex items-center gap-4 shadow-[0_0_20px_rgba(237,177,255,0.1)] hover:shadow-[0_0_30px_rgba(237,177,255,0.2)]">
                      <Brain size={22} className="text-primary" /> Talk to Neural AI
                   </button>
                   <button className="w-full text-left px-6 py-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors font-label text-base text-white flex items-center gap-4 hover:border-white/20">
                      <FileText size={22} className="text-secondary" /> Upload Document
                   </button>
                </div>
              </motion.div>
              
              {/* Journal Snapshot */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: 0.6 }}
                className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-10 mix-blend-overlay">
                   <img src="/images/yudo inspiration landing page purple theme.jpg" className="w-full h-full object-cover" alt="" />
                </div>
                <h2 className="font-headline font-semibold text-xl mb-6 text-white relative z-10">Latest Journal</h2>
                {stats?.latest_journal ? (
                  <div className="p-5 rounded-2xl bg-surface-container/60 border border-white/10 backdrop-blur-md relative z-10">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-label text-on-surface-variant">{new Date(stats.latest_journal.date).toLocaleDateString()}</span>
                      <span className="text-xs px-3 py-1.5 bg-primary/20 border border-primary/30 rounded-full text-primary font-bold tracking-wide uppercase">{stats.latest_journal.mood}</span>
                    </div>
                    <p className="font-body text-base text-on-surface-variant line-clamp-4 leading-relaxed">
                      {stats.latest_journal.entry_text}
                    </p>
                  </div>
                ) : (
                  <div className="p-6 text-center border border-dashed border-white/20 rounded-2xl relative z-10 bg-white/5">
                    <p className="font-body text-sm text-on-surface-variant">
                      You haven't written a journal entry yet.
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
