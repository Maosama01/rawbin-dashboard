import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Recycle, Mail, Lock, User, ArrowRight, Phone, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  
  // OTP state
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, requestOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register({ 
          email, 
          password, 
          display_name: displayName, 
          phone: phone || undefined 
        });
        navigate('/');
      } else {
        if (loginMethod === 'email') {
          await login(email, password);
          navigate('/');
        } else {
          if (!otpSent) {
            // Request OTP
            await requestOtp(phone);
            setOtpSent(true);
          } else {
            // Verify OTP
            await verifyOtp(phone, otpCode);
            navigate('/');
          }
        }
      }
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

        {!isRegister && (
          <div className="login-method-toggle" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', padding: '4px', background: 'var(--bg-glass-heavy)', borderRadius: 'var(--radius-md)' }}>
            <button 
              type="button"
              className={`btn ${loginMethod === 'email' ? 'btn-primary' : ''}`}
              style={{ flex: 1, background: loginMethod === 'email' ? '' : 'transparent' }}
              onClick={() => { setLoginMethod('email'); setError(''); setOtpSent(false); }}
            >
              Email
            </button>
            <button 
              type="button"
              className={`btn ${loginMethod === 'phone' ? 'btn-primary' : ''}`}
              style={{ flex: 1, background: loginMethod === 'phone' ? '' : 'transparent' }}
              onClick={() => { setLoginMethod('phone'); setError(''); }}
            >
              Phone
            </button>
          </div>
        )}

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

          {(!isRegister && loginMethod === 'phone') ? (
            // Phone Login Form
            <>
              <div className="input-group">
                <label className="input-label" htmlFor="phone">Phone Number</label>
                <div className="login-input-wrap">
                  <Phone size={16} className="login-input-icon" aria-hidden="true" />
                  <input
                    id="phone"
                    type="tel"
                    className="input-field login-input"
                    placeholder="+1234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    disabled={otpSent}
                  />
                </div>
              </div>

              {otpSent && (
                <div className="input-group animate-fade-in-up">
                  <label className="input-label" htmlFor="otp">6-Digit Code</label>
                  <div className="login-input-wrap">
                    <KeyRound size={16} className="login-input-icon" aria-hidden="true" />
                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      className="input-field login-input"
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      required
                    />
                  </div>
                  <button 
                    type="button" 
                    className="login-toggle-btn" 
                    style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}
                    onClick={() => { setOtpSent(false); setOtpCode(''); setError(''); }}
                  >
                    Change phone number
                  </button>
                </div>
              )}
            </>
          ) : (
            // Email Login / Registration Form
            <>
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

              {isRegister && (
                <div className="input-group">
                  <label className="input-label" htmlFor="reg-phone">Phone Number (Optional)</label>
                  <div className="login-input-wrap">
                    <Phone size={16} className="login-input-icon" aria-hidden="true" />
                    <input
                      id="reg-phone"
                      type="tel"
                      className="input-field login-input"
                      placeholder="+1234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              )}

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
            </>
          )}

          {error && <p className="login-error" role="alert">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary login-submit"
            disabled={loading}
            id="login-submit-btn"
          >
            {loading ? 'Please wait…' : (
              isRegister ? 'Create Account' : (
                loginMethod === 'phone' && !otpSent ? 'Send Code' : 'Sign In'
              )
            )}
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
