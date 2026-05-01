import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/axios';
import { 
  Leaf, Mail, Lock, User, ArrowRight, AlertCircle, 
  CheckCircle2 
} from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Registration State
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/auth/register', formData);
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      if (err.response?.data?.errors) {
        // Extract first error message from the array
        const firstError = Object.values(err.response.data.errors[0])[0];
        setError(firstError);
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] relative overflow-hidden flex items-center justify-center p-4">
      {/* Premium Radial Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/5 blur-[150px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md glass-card rounded-[40px] p-10 border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-10 text-center">
          <h2 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">{t('auth.register_title', 'Create Account')}</h2>
          <p className="text-slate-400 text-sm">{t('auth.register_subtitle', 'Start your sustainability journey today.')}</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl flex items-center gap-3 text-xs font-medium animate-pulse">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-2xl flex items-center gap-3 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                required
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                required
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                required
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                placeholder="Strong Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <p className="text-[9px] text-slate-500 ml-1 leading-relaxed">
              Min 10 chars, include upper, lower, number & symbol.
            </p>
          </div>


          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-primary hover:bg-emerald-400 text-dark font-black py-4 px-6 rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center justify-center gap-3 mt-4 disabled:opacity-50 text-lg uppercase tracking-tight"
          >
            {loading ? 'Creating...' : 'Sign Up'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-emerald-400 transition-colors font-bold uppercase tracking-tighter ml-1 hover:underline underline-offset-4">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
