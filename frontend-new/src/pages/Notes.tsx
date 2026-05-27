import { useState, useEffect, useRef } from 'react';
import { Plus, Database, Loader2, Brain, Sparkles, Tag, Edit3, AlignLeft } from 'lucide-react';
import { getNotes, addNote } from '../lib/api';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

interface Note {
  id: string;
  content: string;
  date: string;
}

// Helper to generate fake semantic tags for demo purposes
const generateSemanticTags = (_content: string) => {
  const allTags = ['Insight', 'Memory', 'Action Item', 'Fact', 'Event', 'Project', 'Idea', 'Finance', 'Personal'];
  const numTags = Math.floor(Math.random() * 2) + 1; // 1 to 2 tags
  const tags: string[] = [];
  for (let i = 0; i < numTags; i++) {
    const randomTag = allTags[Math.floor(Math.random() * allTags.length)];
    if (!tags.includes(randomTag)) tags.push(randomTag);
  }
  return tags;
};

export function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentNote, setCurrentNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotes = async () => {
    try {
      const data = await getNotes();
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  useGSAP(() => {
    if (!loading) {
      gsap.fromTo(".gsap-reveal", 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }
      );

      gsap.fromTo(".gsap-note",
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, stagger: 0.05, ease: "back.out(1.2)" }
      );
    }
  }, [loading, notes]);

  const handleSaveNote = async () => {
    if (!currentNote.trim()) return;
    setSaving(true);
    try {
      await addNote(currentNote);
      setCurrentNote('');
      await fetchNotes();
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note to YUDO Brain.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col relative" ref={containerRef}>
      {/* Background Neural Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-screen" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background blur-[100px]"></div>

      <header className="flex items-center justify-between mb-8 relative z-10 gsap-reveal">
        <div>
           <h1 className="font-headline text-4xl font-extrabold text-white tracking-tight drop-shadow-lg flex items-center gap-3">
             <Edit3 size={32} className="text-secondary" /> Neural Notes
           </h1>
           <p className="font-body text-on-surface-variant text-base mt-2 flex items-center gap-2">
             <Brain size={16} className="text-primary" /> Keep track of thoughts. YUDO memorizes them semantically.
           </p>
        </div>
        <button 
           onClick={() => { setCurrentNote(''); setActiveNote(null); }}
           className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-label font-bold text-sm hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2 shadow-lg hover:shadow-white/5 hover:scale-[1.02]"
        >
           <Plus size={18} /> New Entry
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0 relative z-10">
        
        {/* LEFT COMPONENT: Memory Log */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="gsap-reveal glass-panel p-6 rounded-3xl border border-white/5 flex-1 flex flex-col min-h-[400px] shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-500">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[40px] pointer-events-none"></div>
             <h2 className="font-headline font-semibold text-lg mb-6 text-white flex items-center gap-2 relative z-10">
               <Database size={18} className="text-primary" /> YUDO Memory Log
             </h2>
             
             {loading ? (
               <div className="flex-1 flex items-center justify-center text-on-surface-variant">
                 <Loader2 size={24} className="animate-spin text-primary" />
               </div>
             ) : notes.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 relative z-10">
                 <AlignLeft size={32} className="text-on-surface-variant mb-4" />
                 <p className="font-body text-sm text-on-surface-variant">No memories indexed.</p>
               </div>
             ) : (
               <div className="flex-1 overflow-y-auto space-y-4 pr-2 relative z-10 custom-scrollbar">
                  {notes.map(note => {
                    const tags = generateSemanticTags(note.content);
                    const isActive = activeNote === note.id;
                    return (
                      <div 
                        key={note.id} 
                        onClick={() => setActiveNote(note.id)}
                        className={`gsap-note p-5 rounded-2xl border transition-all cursor-pointer group/item flex flex-col gap-3 relative overflow-hidden ${
                          isActive ? 'bg-primary/10 border-primary/40 shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.15)]' : 'bg-surface-container/30 border-white/5 hover:border-white/20 hover:bg-white/5'
                        }`}
                      >
                         <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${isActive ? 'bg-primary' : 'bg-transparent group-hover/item:bg-white/10'}`}></div>
                         <span className={`font-body text-sm line-clamp-3 leading-relaxed relative z-10 ${isActive ? 'text-white' : 'text-on-surface-variant group-hover/item:text-white transition-colors'}`}>
                            {note.content}
                         </span>
                         
                         <div className="flex items-center justify-between mt-1 relative z-10">
                           <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                              {new Date(note.date).toLocaleDateString()}
                           </span>
                           <div className="flex gap-2">
                             {tags.map(tag => (
                               <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-surface-container rounded-lg text-[9px] font-label uppercase tracking-widest text-primary border border-primary/10">
                                 <Tag size={8} /> {tag}
                               </span>
                             ))}
                           </div>
                         </div>
                      </div>
                    );
                  })}
               </div>
             )}
          </div>
        </div>

        {/* CENTER COMPONENT: Scratchpad */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="gsap-reveal glass-panel p-8 rounded-3xl border border-white/5 flex-1 flex flex-col min-h-[400px] shadow-2xl relative overflow-hidden group hover:border-primary/20 transition-all duration-500">
             <div className="absolute inset-0 opacity-5 mix-blend-overlay pointer-events-none">
                <img src="/images/background icon only for yudo landing page.png" className="w-full h-full object-cover" alt="" />
             </div>
             
             <div className="flex items-center justify-between mb-6 relative z-10">
               <h2 className="font-headline font-semibold text-xl text-white">Neural Scratchpad</h2>
               <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                 <span className="text-xs font-label uppercase tracking-widest text-secondary font-bold">Unsaved Buffer</span>
               </div>
             </div>
             
             <textarea 
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                className="w-full flex-1 bg-transparent border-0 text-white font-body text-lg resize-none focus:ring-0 outline-none placeholder:text-on-surface-variant/40 leading-relaxed relative z-10"
                placeholder="Write anything here. 'Abhinav owes me $50' or 'Meeting next Tuesday'. Then commit it to YUDO..."
             />

             <div className="mt-6 flex justify-end relative z-10 border-t border-white/10 pt-6">
                <button 
                  onClick={handleSaveNote}
                  disabled={!currentNote.trim() || saving}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-container text-white font-label font-bold text-sm hover:shadow-[0_0_30px_rgba(157,80,187,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 hover:scale-[1.02]"
                >
                  {saving ? (
                    <><Loader2 size={18} className="animate-spin" /> Committing to Brain...</>
                  ) : (
                    <><Database size={18} /> Commit to YUDO Brain</>
                  )}
                </button>
             </div>
          </div>
        </div>

        {/* RIGHT COMPONENT: AI Helper Sticky Sidebar */}
        <div className="w-full lg:w-1/6 flex flex-col gap-6">
          <div className="gsap-reveal sticky top-6 glass-panel p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden">
             <div className="absolute right-0 bottom-0 w-24 h-24 bg-tertiary/10 blur-[40px] pointer-events-none"></div>
             
             <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-surface-container border border-white/10 mb-6 shadow-inner mx-auto relative">
                <div className="absolute inset-0 rounded-2xl border border-tertiary/30 animate-pulse"></div>
                <Brain className="text-tertiary w-6 h-6" />
             </div>
             
             <h3 className="font-headline font-semibold text-center text-sm text-white mb-6 uppercase tracking-widest">
               AI Assistant
             </h3>
             
             <div className="space-y-4">
               <div className="p-4 rounded-2xl bg-surface-container/40 border border-white/5 text-center group hover:bg-white/5 hover:border-white/10 transition-colors cursor-pointer">
                 <Sparkles className="w-5 h-5 text-yellow-400 mx-auto mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                 <p className="font-body text-xs text-on-surface-variant">Auto-tag</p>
               </div>
               <div className="p-4 rounded-2xl bg-surface-container/40 border border-white/5 text-center group hover:bg-white/5 hover:border-white/10 transition-colors cursor-pointer">
                 <AlignLeft className="w-5 h-5 text-secondary mx-auto mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                 <p className="font-body text-xs text-on-surface-variant">Summarize</p>
               </div>
               <div className="p-4 rounded-2xl bg-surface-container/40 border border-white/5 text-center group hover:bg-white/5 hover:border-white/10 transition-colors cursor-pointer">
                 <Database className="w-5 h-5 text-primary mx-auto mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                 <p className="font-body text-xs text-on-surface-variant">Link Data</p>
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
