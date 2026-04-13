import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Bot, Shield, Sparkles, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMsg(error.message);
    } else {
      navigate('/app/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden nebula-bg text-on-surface">
      <main className="flex-grow flex flex-col xl:flex-row items-center justify-center p-6 relative gap-12">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 -right-24 w-80 h-80 bg-secondary/10 rounded-full blur-[100px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md z-10"
        >
          <div className="flex flex-col items-center mb-10">
            <motion.div 
              whileHover={{ rotate: 15 }}
              className="mb-6 h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-[0_0_30px_rgba(237,177,255,0.3)]"
            >
              <Bot size={32} className="text-on-primary" />
            </motion.div>
            <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2 text-center">
              Welcome Back
            </h1>
            <p className="font-body text-on-surface-variant text-center tracking-wide">
              Your personal AI assistant is waiting.
            </p>
          </div>

          <div className="glass-panel rounded-xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] border border-white/10">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-on-surface-variant ml-1 font-label">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                    <Mail size={20} />
                  </div>
                  <input 
                    className="w-full bg-surface-container-lowest border-0 ring-1 ring-white/10 rounded-full py-3.5 pl-12 pr-4 text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-low transition-all outline-none" 
                    placeholder="name@domain.com" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="block text-sm font-medium text-on-surface-variant font-label">Password</label>
                  <a className="text-xs text-primary hover:text-white transition-colors" href="#">Forgot?</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                    <Lock size={20} />
                  </div>
                  <input 
                    className="w-full bg-surface-container-lowest border-0 ring-1 ring-white/10 rounded-full py-3.5 pl-12 pr-12 text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-low transition-all outline-none" 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    className="absolute inset-y-0 right-4 flex items-center text-on-surface-variant hover:text-on-surface" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {errorMsg && <p className="text-error text-sm text-center">{errorMsg}</p>}

              <div className="pt-2 space-y-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold tracking-tight shadow-[0_0_20px_rgba(157,80,187,0.4)] hover:shadow-[0_0_30px_rgba(157,80,187,0.6)] transition-all flex items-center justify-center disabled:opacity-50" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Login'}
                </motion.button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-on-surface-variant font-label">
                New to the nebula? <Link to="/signup" className="text-primary font-semibold hover:underline">Create an account</Link>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Info panel */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-sm flex flex-col gap-6"
        >
          <motion.div whileHover={{ y: -5 }} className="glass-panel p-6 rounded-lg border border-white/5 space-y-4">
            <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
              <Shield size={20} />
            </div>
            <h3 className="font-headline font-bold text-on-surface">End-to-End Vault</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">Your data is encrypted ensuring your AI interactions remain exclusively yours.</p>
          </motion.div>
          <motion.div whileHover={{ y: -5 }} className="glass-panel p-6 rounded-lg border border-white/5 space-y-4">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <Sparkles size={20} />
            </div>
            <h3 className="font-headline font-bold text-on-surface">Neural Intelligence</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">Powered by the latest LLMs to provide context-aware assistance.</p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
