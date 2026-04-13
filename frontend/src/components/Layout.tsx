import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Bot, PenTool, LogOut, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Layout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Documents', path: '/documents', icon: <FileText size={20} /> },
    { name: 'AI Chat', path: '/chat', icon: <Bot size={20} /> },
    { name: 'Notes', path: '/notes', icon: <PenTool size={20} /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden nebula-bg text-on-surface">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-white/10 flex flex-col p-4 z-10 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-[0_0_15px_rgba(237,177,255,0.3)]">
             <Bot size={24} className="text-on-primary" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            YUDO
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-label text-sm transition-all ${
                  isActive
                    ? 'bg-primary/20 text-primary shadow-[0_0_10px_rgba(237,177,255,0.1)] border border-primary/20'
                    : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-2 pt-4 border-t border-white/10">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-label text-sm text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-all">
            <Settings size={20} /> Settings
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-label text-sm text-error hover:bg-error/10 hover:text-error transition-all"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
          {/* Subtle background glow for the active page */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
         
         {/* The Outlet renders the current route's component */}
         <div className="flex-1 overflow-auto p-8 z-10 w-full h-full">
            <Outlet />
         </div>
      </main>
    </div>
  );
}
