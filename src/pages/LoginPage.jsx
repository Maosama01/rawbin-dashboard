import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Recycle, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register({ email, password, display_name: displayName });
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-glow login-bg-glow-1" aria-hidden="true" />
      <div className="login-bg-glow login-bg-glow-2" aria-hidden="true" />

      <div className="login-card glass-card animate-fade-in-up" id="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Recycle size={28} />
          </div>
          <h1 className="login-title">Rawbin</h1>
          <p className="login-subtitle">
            {isRegister ? 'Create your account' : 'Sign in to your dashboard'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <div className="input-group">
              <label className="input-label" htmlFor="display-name">Full Name</label>
              <div className="login-input-wrap">
                <User size={16} className="login-input-icon" aria-hidden="true" />
                <input
                  id="display-name"
                  type="text"
                  className="input-field login-input"
                  placeholder="John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label className="input-label" htmlFor="email">Email</label>
            <div className="login-input-wrap">
              <Mail size={16} className="login-input-icon" aria-hidden="true" />
              <input
                id="email"
                type="email"
                className="input-field login-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <div className="login-input-wrap">
              <Lock size={16} className="login-input-icon" aria-hidden="true" />
              <input
                id="password"
                type="password"
                className="input-field login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
          </div>

          {error && <p className="login-error" role="alert">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary login-submit"
            disabled={loading}
            id="login-submit-btn"
          >
            {loading ? 'Please wait…' : (isRegister ? 'Create Account' : 'Sign In')}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="login-toggle">
          <span className="login-toggle-text">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <button
            type="button"
            className="login-toggle-btn"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            id="toggle-register-btn"
          >
            {isRegister ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
