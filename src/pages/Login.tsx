import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, User, Sparkles, UserPlus, ShieldAlert, Compass } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Registration vs Login states
  const [isSetupConfigured, setIsSetupConfigured] = useState<boolean | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const triggerHaptic = (ms: number | number[] = 50) => {
    if (navigator.vibrate) navigator.vibrate(ms);
  };

  const checkSetupStatus = async () => {
    try {
      const res = await fetch('/api/admin/setup-status');
      const data = await res.json();
      setIsSetupConfigured(data.isConfigured);
      if (!data.isConfigured) {
        setIsRegistering(true); // Default to setup slot registration
      } else {
        setIsRegistering(false);
      }
    } catch {
      setIsSetupConfigured(true); // Fallback to login in case of network issue
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all details.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    triggerHaptic(60);

    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess('Admin account setup successful! Logging in...');
        triggerHaptic([40, 20, 40]);
        
        // Auto sign in right away
        const loginRes = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const loginData = await loginRes.json();
        
        if (loginRes.ok && loginData.success) {
          setTimeout(() => {
            navigate('/admin');
          }, 1500);
        } else {
          // Re-fetch setup status so it immediately locks and switches to login mode
          await checkSetupStatus();
        }
      } else {
        setError(data.error || 'Setup failed');
      }
    } catch {
      setError('Network connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    triggerHaptic(40);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setSuccess('Authentication approved. Welcome back, Gautam!');
        triggerHaptic([30, 30]);
        setTimeout(() => {
          navigate('/admin');
        }, 1200);
      } else {
        setError(data.error || 'Authentication denied. Check your credentials.');
      }
    } catch (err) {
      setError('Connection failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10 overflow-hidden">
      {/* Decorative gradient background circles */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-luxury/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] animate-pulse"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 glass p-10 rounded-2xl border border-white/5 relative z-10 shadow-2xl"
      >
        <div>
          {isRegistering ? (
            <div className="mx-auto h-16 w-16 bg-gradient-to-tr from-amber-500/20 to-yellow-500/35 rounded-full flex items-center justify-center border border-yellow-500/40 mb-4 animate-bounce">
              <Sparkles className="h-8 w-8 text-yellow-500" />
            </div>
          ) : (
            <div className="mx-auto h-16 w-16 bg-red-luxury/20 rounded-full flex items-center justify-center border border-red-luxury/50 mb-4">
              <Lock className="h-8 w-8 text-red-500" />
            </div>
          )}
          
          <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
            {isRegistering ? 'Register Owner Account' : 'Admin Gatekeeper'}
          </h2>
          
          <p className="mt-2 text-center text-sm text-gray-400">
            {isRegistering 
              ? 'Provide a username & password. This is a single, one-time setup slot.' 
              : 'Authorized Admin only.'}
          </p>

          {!isRegistering && isSetupConfigured === false && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-500 font-medium text-xs text-center flex items-center justify-center gap-1.5">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>Admin slot is currently open! Please set it up now.</span>
            </div>
          )}
        </div>

        {isRegistering ? (
          /* REGISTRATION FORM (ONE-TIME SLOT) */
          <form className="mt-8 space-y-6" onSubmit={handleRegister}>
            <div className="space-y-4 rounded-md shadow-sm">
              <div className="relative">
                <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1 block">Choose Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    required
                    className="appearance-none rounded-lg relative block w-full pl-11 pr-3 py-3.5 border border-gray-700 bg-gray-900/40 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                    placeholder="e.g. gautam_admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1 block">Set Secure Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="password"
                    required
                    className="appearance-none rounded-lg relative block w-full pl-11 pr-3 py-3.5 border border-gray-700 bg-gray-900/40 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="password"
                    required
                    className="appearance-none rounded-lg relative block w-full pl-11 pr-3 py-3.5 border border-gray-700 bg-gray-900/40 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                    placeholder="Re-type password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-xs text-center bg-red-950/20 py-2 border border-red-500/15 rounded">
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div className="text-emerald-400 text-xs text-center bg-emerald-950/20 py-2 border border-emerald-500/15 rounded font-medium">
                ✨ {success}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-md btn-gold-3d disabled:opacity-50 cursor-pointer"
              >
                <UserPlus className="mr-2 h-5 w-5 text-black" aria-hidden="true" />
                {loading ? 'Creating Credentials...' : 'Register Owner Credentials'}
              </button>
            </div>
            
            {isSetupConfigured && (
              <div className="text-center">
                <button 
                  type="button" 
                  onClick={() => { setIsRegistering(false); setError(''); }}
                  className="text-xs text-gray-400 hover:text-white underline"
                >
                  Already have an account? Log in instead
                </button>
              </div>
            )}
          </form>
        ) : (
          /* STANDARD SECURE LOGIN FORM */
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4 rounded-md shadow-sm">
              <div className="relative">
                <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1 block">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    required
                    className="appearance-none rounded-lg relative block w-full pl-11 pr-3 py-3.5 border border-gray-700 bg-gray-900/40 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-luxury focus:border-red-luxury text-sm"
                    placeholder="Enter Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="password"
                    required
                    className="appearance-none rounded-lg relative block w-full pl-11 pr-3 py-3.5 border border-gray-700 bg-gray-900/40 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-luxury focus:border-red-luxury text-sm"
                    placeholder="Enter Secure Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-xs text-center bg-red-950/20 py-2.5 border border-red-500/15 rounded">
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div className="text-emerald-400 text-xs text-center bg-emerald-900/10 py-2.5 border border-emerald-500/15 rounded font-medium">
                {success}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-md btn-red-3d disabled:opacity-50 cursor-pointer"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-red-200 group-hover:text-white transition-colors" aria-hidden="true" />
                </span>
                {loading ? 'Authenticating Owner...' : 'Secure Authorization'}
                <ArrowRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
              </button>
            </div>
            
            {isSetupConfigured === false && (
              <div className="text-center">
                <button 
                  type="button" 
                  onClick={() => { setIsRegistering(true); setError(''); }}
                  className="text-xs text-yellow-500 hover:text-yellow-400 font-semibold underline"
                >
                  Create Owner Account (Open Config Slot)
                </button>
              </div>
            )}
          </form>
        )}

        <div className="pt-4 border-t border-white/5 text-center flex justify-center gap-4">
          <Link to="/" className="text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
            <Compass className="w-3.5 h-3.5" /> Return to Portfolio
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
