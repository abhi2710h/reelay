import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineArrowLeft, HiOutlineCheckCircle } from 'react-icons/hi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10 fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-gradient mb-4 shadow-glow">
            <span className="text-white text-2xl font-black">R</span>
          </div>
          <h1 className="text-4xl font-black brand-text mb-2">ReelAY</h1>
        </div>

        <div className="glass rounded-3xl p-7 shadow-card">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <HiOutlineCheckCircle size={32} className="text-green-400" />
              </div>
              <h2 className="text-lg font-bold mb-2">Check your email</h2>
              <p className="text-gray-400 text-sm mb-6">We sent a password reset link to <span className="text-white font-medium">{email}</span></p>
              <Link to="/login" className="btn-primary block text-center">Back to login</Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-2">Forgot password?</h2>
              <p className="text-gray-500 text-sm mb-6">Enter your email and we'll send a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-field pl-11"
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/login" className="flex items-center justify-center gap-2 text-gray-500 hover:text-white text-sm transition-colors">
            <HiOutlineArrowLeft size={16} /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
