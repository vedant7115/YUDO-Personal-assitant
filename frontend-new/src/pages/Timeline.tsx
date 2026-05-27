import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Calendar, Activity, Loader2, Network } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const API = 'http://localhost:8000/api';

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return { Authorization: `Bearer ${session?.access_token}` };
}

interface TimelineEvent {
  id: string;
  event_title: string;
  description: string;
  event_date: string;
}

export function Timeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ event_title: '', description: '', event_date: '' });
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchEvents = async () => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API}/timeline`, { headers });
      const data = await res.json();
      setEvents(data.events || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  useGSAP(() => {
    if (!loading) {
      gsap.fromTo(".gsap-reveal", 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );

      gsap.fromTo(".gsap-event",
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: "back.out(1.2)" }
      );

      gsap.to(".gsap-particle", {
        y: "random(-20, 20)",
        x: "random(-20, 20)",
        opacity: "random(0.2, 0.8)",
        scale: "random(0.5, 1.5)",
        duration: "random(2, 4)",
        repeat: -1,
        yoyo: true,
        stagger: 0.1,
        ease: "sine.inOut"
      });
    }
  }, [loading, events]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const headers = await authHeaders();
      await fetch(`${API}/timeline`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      setForm({ event_title: '', description: '', event_date: '' });
      setShowForm(false);
      await fetchEvents();
    } catch (error) {
      console.error(error);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const headers = await authHeaders();
      await fetch(`${API}/timeline/${id}`, { method: 'DELETE', headers });
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-full flex flex-col relative" ref={containerRef}>
      {/* Background Neural Grid & Particles */}
      <div className="fixed inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(157, 80, 187, 0.2) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-tr from-surface via-background to-surface blur-[120px]"></div>
      
      {/* Generate some abstract glowing particles */}
      {[...Array(10)].map((_, i) => (
        <div key={i} className={`gsap-particle fixed rounded-full blur-[2px] ${i % 2 === 0 ? 'bg-primary/20' : 'bg-secondary/20'}`} style={{
          width: Math.random() * 8 + 4 + 'px',
          height: Math.random() * 8 + 4 + 'px',
          top: Math.random() * 100 + '%',
          left: Math.random() * 100 + '%',
          pointerEvents: 'none',
          zIndex: 0
        }}></div>
      ))}

      <header className="flex items-center justify-between mb-10 relative z-10 gsap-reveal">
        <div>
           <h1 className="font-headline text-4xl font-extrabold text-white tracking-tight drop-shadow-lg flex items-center gap-3">
             <Network size={32} className="text-primary" /> Memory Timeline
           </h1>
           <p className="font-body text-on-surface-variant text-base mt-2 flex items-center gap-2">
             <Activity size={16} className="text-secondary" /> Your neural journey mapped chronologically.
           </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-primary-container text-white font-label font-bold text-sm shadow-[0_0_20px_rgba(157,80,187,0.4)] hover:shadow-[0_0_35px_rgba(157,80,187,0.7)] transition-all flex items-center gap-2 hover:scale-[1.03]"
        >
          {showForm ? <><X size={18} /> Close Panel</> : <><Plus size={18} /> Log Event</>}
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0 relative z-10">
        
        {/* LEFT COMPONENT: Input Form (Absolute or side-by-side depending on state) */}
        <AnimatePresence>
          {showForm && (
            <motion.div 
               initial={{ opacity: 0, x: -50, width: 0 }}
               animate={{ opacity: 1, x: 0, width: '100%', maxWidth: '400px' }}
               exit={{ opacity: 0, x: -50, width: 0 }}
               className="lg:w-1/3 flex-shrink-0"
            >
              <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] pointer-events-none"></div>
                <h2 className="font-headline font-semibold text-xl text-white mb-6">Log New Milestone</h2>
                
                <form onSubmit={handleAdd} className="flex flex-col gap-5 relative z-10">
                  <div className="flex flex-col gap-2">
                    <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Event Title</label>
                    <input
                      required
                      placeholder="e.g. Launched new project"
                      value={form.event_title}
                      onChange={e => setForm({ ...form, event_title: e.target.value })}
                      className="w-full bg-surface-container/30 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-body"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Semantic Description</label>
                    <textarea
                      placeholder="Provide neural context (optional)"
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      rows={3}
                      className="w-full bg-surface-container/30 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-body resize-none"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Date</label>
                    <input
                      required
                      type="date"
                      value={form.event_date}
                      onChange={e => setForm({ ...form, event_date: e.target.value })}
                      className="w-full bg-surface-container/30 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-body [color-scheme:dark]"
                    />
                  </div>
                  
                  <button type="submit" disabled={adding}
                    className="mt-4 w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-label font-bold text-sm hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {adding ? <><Loader2 size={16} className="animate-spin" /> Synchronizing...</> : 'Save to Timeline'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RIGHT COMPONENT: The Timeline */}
        <div className="flex-1 min-w-0 relative">
          <div className="glass-panel p-8 rounded-3xl border border-white/5 min-h-[500px] shadow-2xl overflow-y-auto custom-scrollbar relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 blur-[80px] pointer-events-none"></div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
                <Loader2 size={32} className="animate-spin text-primary mb-4" />
                <p className="font-body text-sm">Decoding temporal data...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-on-surface-variant text-center opacity-50 relative z-10">
                <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-6">
                  <Calendar size={32} className="text-on-surface-variant/50" />
                </div>
                <p className="font-headline text-lg text-white mb-2">Timeline Empty</p>
                <p className="font-body text-sm max-w-sm">Log your first event to begin plotting your neural journey.</p>
              </div>
            ) : (
              <div className="relative pl-6 pb-6">
                {/* Glowing vertical line */}
                <div className="absolute left-8 top-4 bottom-0 w-1 rounded-full bg-surface-container overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-b from-primary via-secondary to-primary animate-pulse opacity-50"></div>
                </div>
                
                <div className="space-y-12">
                  {events.map((ev) => (
                    <div key={ev.id} className="gsap-event relative flex gap-8 items-start pl-12 group/timeline">
                      
                      {/* Timeline Node */}
                      <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-surface flex items-center justify-center border-2 border-primary z-10 shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)] group-hover/timeline:scale-125 transition-transform duration-300">
                        <div className="w-2 h-2 rounded-full bg-white group-hover/timeline:bg-primary transition-colors"></div>
                      </div>
                      
                      {/* Event Card */}
                      <div className="flex-1 glass-panel rounded-2xl p-6 border border-white/5 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-[0_10px_30px_rgba(var(--color-primary-rgb),0.15)] relative overflow-hidden group/card">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[30px] rounded-full group-hover/card:bg-primary/20 transition-colors duration-500"></div>
                        
                        <div className="flex justify-between items-start relative z-10">
                          <div>
                            <p className="text-secondary font-label text-xs uppercase tracking-widest mb-2 font-bold">
                              {new Date(ev.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            <h3 className="text-white font-headline text-xl font-bold mb-2 group-hover/card:text-primary transition-colors">{ev.event_title}</h3>
                            {ev.description && <p className="text-on-surface-variant font-body text-sm leading-relaxed max-w-2xl">{ev.description}</p>}
                          </div>
                          <button onClick={() => handleDelete(ev.id)}
                            className="text-on-surface-variant hover:text-error transition-colors p-2 hover:bg-error/10 rounded-lg opacity-0 group-hover/card:opacity-100 flex-shrink-0">
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

