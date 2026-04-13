import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Bot, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    const { error, data } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: { full_name: name } }
    });
    
    if (error) {
      setErrorMsg(error.message);
    } else {
      if (data.session) {
        // Since Email Confirm is OFF, we have a valid session instantly.
        navigate('/app/dashboard');
      } else {
        // If Email Confirm is ON, display the message.
        setSuccessMsg('Check your inbox! A verification link has been sent to your email.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden nebula-bg text-on-surface">
      <main className="flex-grow flex flex-col items-center justify-center p-6 relative gap-12">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 -right-24 w-80 h-80 bg-secondary/10 rounded-full blur-[100px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md z-10"
        >
          <div className="flex flex-col items-center mb-8">
            <motion.div 
              whileHover={{ rotate: -15 }}
              className="mb-6 h-16 w-16 rounded-xl bg-gradient-to-tr from-secondary to-tertiary flex items-center justify-center shadow-[0_0_30px_rgba(214,186,255,0.3)]"
            >
              <UserPlus size={32} className="text-on-secondary" />
            </motion.div>
            <h1 className="font-headline text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-tertiary to-primary mb-2 text-center">
              Join the Nebula
            </h1>
            <p className="font-body text-on-surface-variant text-center tracking-wide text-sm">
              Create your secure YUDO Vault.
            </p>
          </div>

          <div className="glass-panel rounded-xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] border border-white/10">
            <form className="space-y-5" onSubmit={handleSignup}>
               {/* Name Field */}
               <div className="space-y-1.5">
                <label className="block text-sm font-medium text-on-surface-variant ml-1 font-label">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-tertiary transition-colors">
                    <Bot size={20} />
                  </div>
                  <input 
                    className="w-full bg-surface-container-lowest border-0 ring-1 ring-white/10 rounded-full py-3.5 pl-12 pr-4 text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-tertiary/40 focus:bg-surface-container-low transition-all outline-none" 
                    placeholder="Jane Doe" 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-on-surface-variant ml-1 font-label">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-tertiary transition-colors">
                    <Mail size={20} />
                  </div>
                  <input 
                    className="w-full bg-surface-container-lowest border-0 ring-1 ring-white/10 rounded-full py-3.5 pl-12 pr-4 text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-tertiary/40 focus:bg-surface-container-low transition-all outline-none" 
                    placeholder="name@domain.com" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-on-surface-variant ml-1 font-label">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-tertiary transition-colors">
                    <Lock size={20} />
                  </div>
                  <input 
                    className="w-full bg-surface-container-lowest border-0 ring-1 ring-white/10 rounded-full py-3.5 pl-12 pr-12 text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-tertiary/40 focus:bg-surface-container-low transition-all outline-none" 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
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
              {successMsg && <p className="text-tertiary text-sm text-center font-bold">{successMsg}</p>}

              <div className="pt-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-tertiary-container to-secondary-container text-on-primary font-headline font-bold tracking-tight shadow-[0_0_20px_rgba(0,126,128,0.4)] hover:shadow-[0_0_30px_rgba(0,126,128,0.6)] transition-all disabled:opacity-50" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Creating Vault...' : 'Sign Up'}
                </motion.button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-on-surface-variant font-label">
                Already have a Vault? <Link to="/login" className="text-tertiary font-semibold hover:underline">Log in</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </main>
      
      {/* Background Image Reference */}
      <div className="fixed inset-0 z-[-1] opacity-30">
        <img 
          className="w-full h-full object-cover mix-blend-screen" 
          alt="deep space nebula" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWP9Wv7AxUhHV-0mp7ul5o5aHP2FAcHXmwkXnsUJqBjHI79TswQ2H6Hq1uyX4d7jssv_fhKqGFPyV8YFhrSr8_6h8wtgI6l62MWEnb--JMoAZTFd3Yui7ZI1FRcvC61UeoxNhdmxh-QQzXes7Nw4-980Y-FWwvt7UBRsEZd2E6SHbap9jAxcm9M8Ooq8d1ie9qh69wCgedKLvBCEOgUu4zjVlBCK_879vfbWdRTpxSOOqrsdUw3RSaBexwrM6Fysb_lYFzOBTCYeU" 
        />
      </div>
    </div>
  );
}
