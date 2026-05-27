import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, Trash2, Search, X, Loader2, Database, BrainCircuit, HardDrive, FileText, Zap } from 'lucide-react';
import { getDocuments, uploadDocument } from '../lib/api';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

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
  const [activeDoc, setActiveDoc] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  useGSAP(() => {
    if (!loading) {
      // Staggered reveals
      gsap.fromTo(".gsap-reveal", 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }
      );
      
      // Floating document icons background
      gsap.to(".gsap-float-bg", {
        y: -15,
        rotation: 5,
        duration: 4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: 0.5
      });
      
      // Staggered table rows
      gsap.fromTo(".gsap-row",
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power2.out", delay: 0.2 }
      );
    }
  }, [loading, documents]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);

    try {
      await uploadDocument(uploadFile, uploadDescription, 'document');
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
    <div className="h-full flex flex-col relative" ref={containerRef}>
      {/* Animated Gradient Mesh & Background */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-tr from-primary/5 via-background to-secondary/10 blur-[120px]"></div>
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
      
      {/* Floating Document Icons */}
      <FileText className="gsap-float-bg absolute top-20 right-20 text-white/5 w-32 h-32 pointer-events-none" />
      <FileText className="gsap-float-bg absolute bottom-40 left-10 text-white/5 w-24 h-24 pointer-events-none" />

      <header className="flex items-center justify-between mb-8 relative z-10 gsap-reveal">
        <div>
           <h1 className="font-headline text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">Vault Documents</h1>
           <p className="font-body text-on-surface-variant text-base mt-2 flex items-center gap-2">
             <Database size={16} className="text-secondary" /> Manage, sync, and analyze files with YUDO AI.
           </p>
        </div>
        <button 
           onClick={() => setIsModalOpen(true)}
           className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-primary-container text-white font-label font-bold text-sm shadow-[0_0_20px_rgba(157,80,187,0.4)] hover:shadow-[0_0_35px_rgba(157,80,187,0.7)] transition-all flex items-center gap-2 hover:scale-[1.03] animate-pulse-slow"
        >
           <Upload size={18} /> Upload to Vault
        </button>
      </header>

      {/* TOP SECTION: Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
        <div className="gsap-reveal glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4 hover:border-white/20 transition-all shadow-lg hover:-translate-y-1">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.2)]">
            <HardDrive size={24} />
          </div>
          <div>
            <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Documents Synced</p>
            <p className="font-headline font-bold text-2xl text-white">{documents.length}</p>
          </div>
        </div>
        <div className="gsap-reveal glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4 hover:border-white/20 transition-all shadow-lg hover:-translate-y-1">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shadow-[0_0_15px_rgba(var(--color-secondary-rgb),0.2)]">
            <BrainCircuit size={24} />
          </div>
          <div>
            <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">AI Indexed</p>
            <p className="font-headline font-bold text-2xl text-white">100%</p>
          </div>
        </div>
        <div className="gsap-reveal glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-center gap-2 hover:border-white/20 transition-all shadow-lg hover:-translate-y-1">
          <div className="flex justify-between text-xs font-label">
            <span className="text-white">Storage Capacity</span>
            <span className="text-tertiary">14% used</span>
          </div>
          <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-tertiary to-secondary w-[14%] shadow-[0_0_10px_rgba(var(--color-tertiary-rgb),0.8)]"></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0 relative z-10">
        {/* MAIN TABLE SECTION */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="gsap-reveal glass-panel p-1.5 rounded-2xl border border-white/10 flex items-center px-4 w-full max-w-md mb-6 shadow-lg">
             <Search size={18} className="text-primary/70" />
             <input 
                type="text" 
                placeholder="Search your vault semantics..." 
                className="w-full bg-transparent border-0 text-sm text-white placeholder:text-on-surface-variant/50 focus:ring-0 px-3 py-2 outline-none font-body"
             />
          </div>

          <div className="gsap-reveal glass-panel border border-white/5 rounded-3xl flex-1 overflow-auto flex flex-col shadow-2xl relative group">
             <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
             {loading ? (
               <div className="flex-1 flex items-center justify-center">
                 <Loader2 className="animate-spin text-primary" size={32} />
               </div>
             ) : documents.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant p-8 text-center">
                 <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-4">
                   <FileText size={32} className="text-on-surface-variant/50" />
                 </div>
                 <p className="font-headline text-lg text-white mb-2">Vault is Empty</p>
                 <p className="font-body text-sm max-w-sm">Upload documents to allow YUDO to index and learn from your files.</p>
               </div>
             ) : (
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="border-b border-white/10 bg-surface/50 backdrop-blur-md sticky top-0 z-20">
                        <th className="py-5 px-6 text-xs font-label uppercase tracking-widest text-on-surface-variant font-semibold">Name</th>
                        <th className="py-5 px-6 text-xs font-label uppercase tracking-widest text-on-surface-variant font-semibold">AI Context</th>
                        <th className="py-5 px-6 text-xs font-label uppercase tracking-widest text-on-surface-variant font-semibold">Size</th>
                        <th className="py-5 px-6 text-xs font-label uppercase tracking-widest text-on-surface-variant font-semibold">Date Added</th>
                        <th className="py-5 px-6 text-xs font-label uppercase tracking-widest text-on-surface-variant font-semibold"></th>
                     </tr>
                  </thead>
                  <tbody>
                     {documents.map((doc) => {
                       const isActive = activeDoc === doc.id;
                       return (
                         <tr 
                            key={doc.id}
                            onClick={() => setActiveDoc(doc.id)}
                            className={`gsap-row border-b border-white/5 transition-all duration-300 cursor-pointer relative overflow-hidden ${
                              isActive ? 'bg-primary/10 border-l-2 border-l-primary shadow-[inset_0_0_20px_rgba(var(--color-primary-rgb),0.1)]' : 'hover:bg-white/5 hover:border-l-2 hover:border-l-secondary'
                            }`}
                         >
                            <td className="py-4 px-6 relative z-10">
                               <div className="flex items-center gap-4">
                                  <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-primary/20 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                                    <File size={18} />
                                  </div>
                                  <span className={`font-label text-sm transition-colors ${isActive ? 'text-primary font-bold' : 'text-white'}`}>{doc.name}</span>
                               </div>
                            </td>
                            <td className="py-4 px-6 text-sm font-body text-on-surface-variant max-w-[200px] truncate relative z-10" title={doc.description}>{doc.description || 'Uncategorized data'}</td>
                            <td className="py-4 px-6 text-sm font-body text-on-surface-variant relative z-10">{doc.size}</td>
                            <td className="py-4 px-6 text-sm font-body text-on-surface-variant relative z-10">{new Date(doc.date).toLocaleDateString()}</td>
                            <td className="py-4 px-6 text-right relative z-10">
                               <button className="text-on-surface-variant hover:text-error transition-colors p-2 hover:bg-error/10 rounded-lg">
                                  <Trash2 size={16} />
                               </button>
                            </td>
                         </tr>
                       );
                     })}
                  </tbody>
               </table>
             )}
          </div>
        </div>

        {/* RIGHT SIDE: AI Summary Panel */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          <div className="gsap-reveal glass-panel p-6 rounded-3xl border border-white/5 shadow-lg relative overflow-hidden flex-1">
             <div className="absolute right-0 top-0 w-32 h-32 bg-secondary/10 blur-[50px] pointer-events-none"></div>
             <h3 className="font-headline font-semibold text-lg text-white mb-6 flex items-center gap-2">
               <Zap size={18} className="text-yellow-400" /> AI Insights
             </h3>
             
             {activeDoc ? (
               <div className="space-y-4 relative z-10">
                 <div className="p-4 rounded-2xl bg-surface-container/50 border border-white/5">
                   <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2">Semantic Profile</p>
                   <p className="font-body text-sm text-white">
                     {documents.find(d => d.id === activeDoc)?.description || "Standard document indexed without explicit context."}
                   </p>
                 </div>
                 <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                   <p className="font-label text-xs uppercase tracking-widest text-primary mb-2">Status</p>
                   <p className="font-body text-sm text-white flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Fully Indexed
                   </p>
                 </div>
                 <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors text-sm font-label text-white mt-4 flex items-center justify-center gap-2">
                   <Search size={16} /> Query Document
                 </button>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center h-48 opacity-50 relative z-10 text-center">
                 <BrainCircuit className="w-12 h-12 text-on-surface-variant mb-4" />
                 <p className="font-body text-sm text-on-surface-variant">Select a document to view neural insights and AI context.</p>
               </div>
             )}
          </div>

          <div className="gsap-reveal glass-panel p-6 rounded-3xl border border-white/5 shadow-lg">
             <h3 className="font-headline font-semibold text-sm uppercase tracking-widest text-on-surface-variant mb-4">Quick Actions</h3>
             <div className="space-y-3">
               <button className="w-full text-left px-4 py-3 rounded-xl bg-surface-container/50 border border-white/5 hover:bg-white/10 transition-colors font-label text-sm text-white">
                 Batch Processing
               </button>
               <button className="w-full text-left px-4 py-3 rounded-xl bg-surface-container/50 border border-white/5 hover:bg-white/10 transition-colors font-label text-sm text-white">
                 Sync Vault State
               </button>
             </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, y: 20 }}
               className="glass-panel w-full max-w-md rounded-3xl border border-white/10 p-8 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] pointer-events-none"></div>
               
               <div className="flex justify-between items-center mb-8 relative z-10">
                 <h2 className="font-headline text-2xl font-bold text-white">Upload to Vault</h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10">
                   <X size={20} />
                 </button>
               </div>
               
               <form onSubmit={handleUploadSubmit} className="flex flex-col gap-5 relative z-10">
                 <div className="flex flex-col gap-2">
                   <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Select File</label>
                   <input 
                     type="file" 
                     onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                     className="block w-full text-sm text-white file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 transition-all cursor-pointer bg-surface-container/30 rounded-xl border border-white/5"
                     required
                   />
                 </div>
                 
                 <div className="flex flex-col gap-2">
                   <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Semantic Description</label>
                   <textarea 
                     value={uploadDescription}
                     onChange={(e) => setUploadDescription(e.target.value)}
                     placeholder="E.g., 'My resume for software engineering roles', 'Certificate for React course'..."
                     className="w-full bg-surface-container/30 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-body resize-none min-h-[120px]"
                     required
                   />
                 </div>
                 
                 <button 
                   type="submit"
                   disabled={!uploadFile || !uploadDescription.trim() || uploading}
                   className="mt-4 w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-container text-white font-label font-bold text-base hover:shadow-[0_0_20px_rgba(157,80,187,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 hover:scale-[1.02]"
                 >
                   {uploading ? (
                     <>
                       <Loader2 size={20} className="animate-spin" /> Neural Syncing...
                     </>
                   ) : (
                     "Initialize Neural Sync"
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
