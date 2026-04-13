import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle2, Circle } from 'lucide-react';

export function Notes() {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Review architecture documentation for Phase 3', done: false },
    { id: 2, text: 'Migrate frontend to pure React / TS', done: true },
    { id: 3, text: 'Connect Supabase Authentication', done: true },
    { id: 4, text: 'Deploy to cloud infrastructure', done: false }
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex items-center justify-between">
        <div>
           <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">Notes & Tasks</h1>
           <p className="font-body text-on-surface-variant text-sm mt-1">Keep track of your thoughts.</p>
        </div>
        <button className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-on-surface font-label font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-2">
           <Plus size={18} /> New Note
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* Action Items Box */}
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-xl border border-white/5 lg:col-span-1">
            <h2 className="font-headline font-semibold text-lg mb-4 text-on-surface">Action Items</h2>
            <div className="space-y-3">
               {tasks.map(task => (
                 <div key={task.id} onClick={() => toggleTask(task.id)} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
                    <div className={`mt-0.5 ${task.done ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary/50'}`}>
                       {task.done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </div>
                    <span className={`font-body text-sm ${task.done ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>
                       {task.text}
                    </span>
                 </div>
               ))}
            </div>
         </motion.div>

         {/* Grid Flow Notes */}
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-xl border border-white/5 order-last md:order-none lg:col-span-2 min-h-[300px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline font-semibold text-lg text-on-surface">Scratchpad</h2>
              <span className="text-xs font-label px-2 py-1 bg-surface-container-high rounded text-on-surface-variant">Last edited 2 min ago</span>
            </div>
            <textarea 
               className="w-full h-full min-h-[400px] bg-transparent border-0 text-on-surface font-body resize-none focus:ring-0 outline-none placeholder:text-on-surface-variant/50 leading-relaxed"
               placeholder="Start typing your thoughts here..."
               defaultValue={"Meeting Notes: \n- AI Model integration scheduled for next week.\n- Ensure Fast API handles rate limiting.\n- Vector database schema requirements updated. See Notion."}
            />
         </motion.div>
      </div>
    </div>
  );
}
