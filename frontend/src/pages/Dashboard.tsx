import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, FileText, Zap } from 'lucide-react';

export function Dashboard() {
  const stats = [
    { title: 'Total Documents', value: '124', icon: <FileText size={20} />, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Recent Queries', value: '38', icon: <Activity size={20} />, color: 'text-secondary', bg: 'bg-secondary/10' },
    { title: 'Hours Saved', value: '12.5', icon: <Clock size={20} />, color: 'text-tertiary', bg: 'bg-tertiary/10' },
    { title: 'System Status', value: 'Optimal', icon: <Zap size={20} />, color: 'text-green-400', bg: 'bg-green-400/10' },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">Overview</h1>
        <p className="font-body text-on-surface-variant text-sm mt-1">Welcome back. Here's what's happening in your vault.</p>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.title}
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            className="glass-panel p-6 rounded-xl border border-white/5 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="font-label text-sm text-on-surface-variant">{stat.title}</p>
              <p className="font-headline font-bold text-2xl text-on-surface">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-panel p-6 rounded-xl border border-white/5 min-h-[400px]"
        >
          <h2 className="font-headline font-semibold text-lg mb-4 text-on-surface">Recent Activity</h2>
          <div className="space-y-4">
            {[1,2,3].map((i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                  <FileText size={16} />
                </div>
                <div>
                  <p className="font-label font-medium text-sm text-on-surface">Financial_Q3_Report.pdf</p>
                  <p className="font-body text-xs text-on-surface-variant">Processed by AI • 2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.5 }}
          className="glass-panel p-6 rounded-xl border border-white/5"
        >
          <h2 className="font-headline font-semibold text-lg mb-4 text-on-surface">Quick Actions</h2>
          <div className="space-y-3">
             <button className="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors font-label text-sm text-on-surface flex items-center gap-3">
                <Zap size={16} className="text-secondary" /> Initiate Deep Scan
             </button>
             <button className="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors font-label text-sm text-on-surface flex items-center gap-3">
                <FileText size={16} className="text-primary" /> Upload Document
             </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
