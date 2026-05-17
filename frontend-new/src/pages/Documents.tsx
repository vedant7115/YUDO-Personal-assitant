import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, Trash2, Search, X, Loader2 } from 'lucide-react';
import { getDocuments, uploadDocument } from '../lib/api';

interface Document {
  id: string;
  name: string;
  size: string;
  date: string;
  description?: string;
}

export function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = async () => {
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);

    try {
      await uploadDocument(uploadFile, uploadDescription, 'document');
      
      // Refresh documents list
      await fetchDocuments();
      
      setIsModalOpen(false);
      setUploadFile(null);
      setUploadDescription('');
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      <header className="flex items-center justify-between">
        <div>
           <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">Documents</h1>
           <p className="font-body text-on-surface-variant text-sm mt-1">Manage and sync your files with YUDO AI.</p>
        </div>
        <button 
           onClick={() => setIsModalOpen(true)}
           className="px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-label font-bold text-sm hover:shadow-[0_0_15px_rgba(157,80,187,0.5)] transition-all flex items-center gap-2"
        >
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
                    <th className="py-4 px-6 text-xs font-label uppercase tracking-wider text-on-surface-variant font-semibold">Description</th>
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
                       <td className="py-4 px-6 text-sm font-body text-on-surface-variant max-w-[200px] truncate" title={doc.description}>{doc.description || '-'}</td>
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

      {/* Upload Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
               initial={{ scale: 0.95, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.95, y: 20 }}
               className="glass-panel w-full max-w-md rounded-2xl border border-white/10 p-6 flex flex-col shadow-2xl bg-surface"
            >
               <div className="flex justify-between items-center mb-6">
                 <h2 className="font-headline text-xl font-bold text-on-surface">Upload Document</h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-white transition-colors">
                   <X size={20} />
                 </button>
               </div>
               
               <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
                 <div className="flex flex-col gap-2">
                   <label className="font-label text-sm text-on-surface-variant">Select File</label>
                   <input 
                     type="file" 
                     onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                     className="block w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 transition-all cursor-pointer"
                     required
                   />
                 </div>
                 
                 <div className="flex flex-col gap-2">
                   <label className="font-label text-sm text-on-surface-variant">Description (for AI Context)</label>
                   <textarea 
                     value={uploadDescription}
                     onChange={(e) => setUploadDescription(e.target.value)}
                     placeholder="E.g., 'My resume for software engineering roles', 'Certificate for React course'..."
                     className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-body resize-none min-h-[100px]"
                     required
                   />
                 </div>
                 
                 <button 
                   type="submit"
                   disabled={!uploadFile || !uploadDescription.trim() || uploading}
                   className="mt-4 w-full py-3 rounded-full bg-primary text-white font-label font-bold text-sm hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                 >
                   {uploading ? (
                     <>
                       <Loader2 size={16} className="animate-spin" /> Uploading to YUDO Vault...
                     </>
                   ) : (
                     "Upload to YUDO Vault"
                   )}
                 </button>
               </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
