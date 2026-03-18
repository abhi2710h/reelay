import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/axios';
import { HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    api.get(`/auth/verify-email/${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10 fade-in text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-gradient mb-4 shadow-glow">
          <span className="text-white text-2xl font-black">R</span>
        </div>
        <h1 className="text-4xl font-black brand-text mb-8">ReelAY</h1>

        <div className="glass rounded-3xl p-8 shadow-card">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400">Verifying your email...</p>
            </div>
          )}
          {status === 'success' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <HiOutlineCheckCircle size={36} className="text-green-400" />
              </div>
              <h2 className="text-xl font-bold">Email verified!</h2>
              <p className="text-gray-400 text-sm">Your account is now active. You can log in.</p>
              <Link to="/login" className="btn-primary w-full mt-2">Go to Login</Link>
            </div>
          )}
          {status === 'error' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <HiOutlineXCircle size={36} className="text-red-400" />
              </div>
              <h2 className="text-xl font-bold">Link expired</h2>
              <p className="text-gray-400 text-sm">This verification link is invalid or has expired.</p>
              <Link to="/login" className="btn-primary w-full mt-2">Back to Login</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
