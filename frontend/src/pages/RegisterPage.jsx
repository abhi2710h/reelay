import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlineAtSymbol, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '' });
  const [showPass, setShowPass] = useState(false);
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/');
      toast.success('Welcome to ReelAY!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  const fields = [
    { key: 'fullName', placeholder: 'Full Name', type: 'text', icon: <HiOutlineUser size={18} /> },
    { key: 'username', placeholder: 'Username', type: 'text', icon: <HiOutlineAtSymbol size={18} /> },
    { key: 'email', placeholder: 'Email address', type: 'email', icon: <HiOutlineMail size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10 fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-gradient mb-4 shadow-glow">
            <span className="text-white text-2xl font-black">R</span>
          </div>
          <h1 className="text-4xl font-black brand-text mb-2">ReelAY</h1>
          <p className="text-gray-500 text-sm">Join the community</p>
        </div>

        <div className="glass rounded-3xl p-7 shadow-card">
          <h2 className="text-xl font-bold mb-6 text-center">Create account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, placeholder, type, icon }) => (
              <div key={key} className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{icon}</span>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="input-field pl-11"
                  required
                />
              </div>
            ))}
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="input-field pl-11 pr-11"
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPass ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
              </button>
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary-light font-semibold transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
