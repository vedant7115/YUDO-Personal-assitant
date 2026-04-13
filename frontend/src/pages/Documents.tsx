import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, Trash2, Search } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  size: string;
  date: string;
}

export function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We would fetch from Supabase/FastAPI here
    // For now we mock the API response 
    setTimeout(() => {
      setDocuments([
         { id: '1', name: 'Project_Proposal_Draft.docx', size: '2.4 MB', date: '2026-04-10' },
         { id: '2', name: 'Q1_Financials.csv', size: '856 KB', date: '2026-04-09' },
         { id: '3', name: 'System_Architecture.pdf', size: '5.2 MB', date: '2026-04-08' },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex items-center justify-between">
        <div>
           <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">Documents</h1>
           <p className="font-body text-on-surface-variant text-sm mt-1">Manage and sync your files with YUDO AI.</p>
        </div>
        <button className="px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-label font-bold text-sm hover:shadow-[0_0_15px_rgba(157,80,187,0.5)] transition-all flex items-center gap-2">
           <Upload size={18} /> Upload
        </button>
      </header>

      <div className="glass-panel p-1 rounded-full border border-white/10 flex items-center px-4 w-full max-w-md">
         <Search size={18} className="text-on-surface-variant" />
         <input 
            type="text" 
            placeholder="Search your vault..." 
            className="w-full bg-transparent border-0 text-sm text-on-surface placeholder:text-on-surface-variant focus:ring-0 px-3 py-2 outline-none"
         />
      </div>

      <div className="glass-panel border border-white/5 rounded-xl flex-1 overflow-hidden flex flex-col">
         {loading ? (
           <div className="flex-1 flex items-center justify-center text-on-surface-variant">Gathering documents...</div>
         ) : (
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="border-b border-white/10 bg-surface-container-highest/20">
                    <th className="py-4 px-6 text-xs font-label uppercase tracking-wider text-on-surface-variant font-semibold">Name</th>
                    <th className="py-4 px-6 text-xs font-label uppercase tracking-wider text-on-surface-variant font-semibold">Size</th>
                    <th className="py-4 px-6 text-xs font-label uppercase tracking-wider text-on-surface-variant font-semibold">Date Added</th>
                    <th className="py-4 px-6 text-xs font-label uppercase tracking-wider text-on-surface-variant font-semibold">Actions</th>
                 </tr>
              </thead>
              <tbody>
                 {documents.map((doc, idx) => (
                    <motion.tr 
                       initial={{ opacity: 0 }} 
                       animate={{ opacity: 1 }} 
                       transition={{ delay: idx * 0.1 }}
                       key={doc.id} 
                       className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                    >
                       <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                             <File size={18} className="text-primary" />
                             <span className="font-label text-sm text-on-surface">{doc.name}</span>
                          </div>
                       </td>
                       <td className="py-4 px-6 text-sm font-body text-on-surface-variant">{doc.size}</td>
                       <td className="py-4 px-6 text-sm font-body text-on-surface-variant">{doc.date}</td>
                       <td className="py-4 px-6">
                          <button className="text-on-surface-variant hover:text-error transition-colors opacity-0 group-hover:opacity-100">
                             <Trash2 size={16} />
                          </button>
                       </td>
                    </motion.tr>
                 ))}
              </tbody>
           </table>
         )}
      </div>
    </div>
  );
}
