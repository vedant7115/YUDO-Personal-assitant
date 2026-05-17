import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Database, Loader2 } from 'lucide-react';
import { getNotes, addNote } from '../lib/api';

interface Note {
  id: string;
  content: string;
  date: string;
}

export function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentNote, setCurrentNote] = useState('');
  const [saving, setSaving] = useState(false);

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
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex items-center justify-between">
        <div>
           <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">Notes & Tasks</h1>
           <p className="font-body text-on-surface-variant text-sm mt-1">Keep track of your thoughts. YUDO will memorize them.</p>
        </div>
        <button 
           onClick={() => setCurrentNote('')}
           className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-on-surface font-label font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-2"
        >
           <Plus size={18} /> New Note
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
         {/* Recent Notes Box */}
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-xl border border-white/5 lg:col-span-1 overflow-y-auto max-h-[600px] flex flex-col">
            <h2 className="font-headline font-semibold text-lg mb-4 text-on-surface flex items-center gap-2">
              <Database size={18} className="text-primary" />
              YUDO Memory Log
            </h2>
            
            {loading ? (
              <div className="flex-1 flex items-center justify-center text-on-surface-variant text-sm">Loading memories...</div>
            ) : notes.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-on-surface-variant text-sm">No notes saved yet.</div>
            ) : (
              <div className="space-y-3">
                 {notes.map(note => (
                   <div key={note.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 transition-colors group flex flex-col gap-2">
                      <span className="font-body text-sm text-on-surface line-clamp-3">
                         {note.content}
                      </span>
                      <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-wider">
                         {note.date}
                      </span>
                   </div>
                 ))}
              </div>
            )}
         </motion.div>

         {/* Grid Flow Notes */}
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-xl border border-white/5 order-last md:order-none lg:col-span-2 min-h-[300px] flex flex-col relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline font-semibold text-lg text-on-surface">Scratchpad</h2>
              <span className="text-xs font-label px-2 py-1 bg-surface-container-high rounded text-on-surface-variant">Unsaved buffer</span>
            </div>
            
            <textarea 
               value={currentNote}
               onChange={(e) => setCurrentNote(e.target.value)}
               className="w-full flex-1 min-h-[300px] bg-transparent border-0 text-on-surface font-body resize-none focus:ring-0 outline-none placeholder:text-on-surface-variant/50 leading-relaxed"
               placeholder="Write anything here. 'Abhinav owes me $50' or 'Meeting next Tuesday'. Then save it to YUDO..."
            />

            <div className="mt-4 flex justify-end">
               <button 
                 onClick={handleSaveNote}
                 disabled={!currentNote.trim() || saving}
                 className="px-6 py-3 rounded-full bg-primary text-white font-label font-bold text-sm hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-[0_0_15px_rgba(157,80,187,0.3)]"
               >
                 {saving ? (
                   <><Loader2 size={16} className="animate-spin" /> Saving to Brain...</>
                 ) : (
                   "Commit to YUDO Brain"
                 )}
               </button>
            </div>
         </motion.div>
      </div>
    </div>
  );
}
