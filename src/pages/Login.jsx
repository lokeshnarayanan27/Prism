import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Logo } from '../components/Logo';

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #333',
  borderRadius: '5px',
  backgroundColor: '#1a1a1a',
  fontSize: '0.9rem',
  color: '#f5f5f5',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

const primaryBtnStyle = (disabled) => ({
  width: '100%',
  padding: '9px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: disabled ? '#b2dffc' : '#0095f6',
  color: '#fff',
  fontWeight: 700,
  fontSize: '0.9rem',
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'background-color 0.2s',
  letterSpacing: '0.3px',
});

const dividerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '18px',
  margin: '14px 0',
  color: '#737373',
};

const dividerLine = {
  flex: 1,
  height: '1px',
  backgroundColor: '#333',
};

export const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login, signUp, resetPassword, user } = useStore();

  // Navigate to home as soon as the store confirms the user is set.
  // This avoids the race condition where navigate('/') fires before
  // _loadUser completes, causing ProtectedRoute to redirect back to login.
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      if (isForgotPassword) {
        if (!email) { setError('Email is required.'); return; }
        await resetPassword(email);
        setSuccess('Password reset link sent! Check your email.');
        setIsForgotPassword(false);
        setEmail('');
      } else if (isSignUp) {
        if (!username) { setError('Username is required.'); return; }
        const data = await signUp(email, password, username, nickname);
        if (!data?.session) {
          setSuccess('✅ Account created! Check your inbox and confirm your email, then come back to log in.');
        } else {
          setSuccess('Account created! Signing you in...');
          // user effect will navigate once store is updated
        }
        setIsSignUp(false);
        setEmail(''); setPassword(''); setUsername(''); setNickname('');
      } else {
        await login(email, password);
        // Don't navigate here — useEffect above will do it when user is set in store
      }
    } catch (err) {
      if (err.message === 'EMAIL_RATE_LIMIT') {
        setError('RATE_LIMIT');
      } else if (err.message === 'EMAIL_NOT_CONFIRMED') {
        setError('EMAIL_NOT_CONFIRMED');
      } else if (err.message === 'ALREADY_REGISTERED') {
        setError('ALREADY_REGISTERED');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      await login('guest@prism.app');
      // Don't navigate here — useEffect above will do it when user is set in store
    } catch (err) {
      setError(err.message || 'Guest login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit = !isLoading && email.trim() && (isForgotPassword ? true : password.trim() && (isSignUp ? username.trim() : true));

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>

      {/* Main Card */}
      <div style={{
        backgroundColor: '#121212',
        border: '1px solid #262626',
        borderRadius: '12px',
        padding: '40px 40px 28px',
        width: '100%',
        maxWidth: '360px',
        textAlign: 'center',
        marginBottom: '10px',
      }}>

        {/* Logo */}
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white',
          }}>
            <Logo size={42} />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f5f5f5', margin: 0, letterSpacing: '-1px' }}>
            Prism
          </h1>
          <p style={{ color: '#a3a3a3', fontSize: '0.85rem', margin: 0 }}>
            {isForgotPassword ? 'Reset your password' : isSignUp ? 'Create an account to get started' : 'Sign in to continue'}
          </p>
        </div>

        {/* Decorative element */}
        <div style={{ height: '1px', width: '40px', backgroundColor: '#0095f6', margin: '0 auto 24px', borderRadius: '2px' }}></div>

        {/* Error / Success banners */}
        {error === 'RATE_LIMIT' ? (
          <div style={{
            backgroundColor: '#fff8e1', border: '1px solid #f59e0b',
            borderRadius: '8px', padding: '14px 16px',
            color: '#92400e', fontSize: '0.82rem', marginBottom: '12px',
            textAlign: 'left', lineHeight: 1.7
          }}>
            <strong style={{ display: 'block', marginBottom: '4px' }}>⚠️ Email Send Limit Reached</strong>
            Supabase free plan only sends ~3 emails/hr. Fix:<br />
            <strong>Supabase Dashboard → Auth → Email → turn OFF "Confirm email" → Save</strong>
            <button onClick={() => setError('')}
              style={{ display: 'block', marginTop: '8px', fontSize: '0.78rem', color: '#92400e', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >Dismiss</button>
          </div>
        ) : error === 'EMAIL_NOT_CONFIRMED' ? (
          <div style={{
            backgroundColor: '#e8f4fd', border: '1px solid #bee3f8',
            borderRadius: '8px', padding: '14px 16px',
            color: '#1a56db', fontSize: '0.82rem', marginBottom: '12px',
            textAlign: 'left', lineHeight: 1.7
          }}>
            <strong style={{ display: 'block', marginBottom: '4px' }}>📧 Please confirm your email first</strong>
            We sent a confirmation link to <strong>{email}</strong>.<br />
            Click that link, then come back here and log in.<br />
            <em style={{ fontSize: '0.78rem', opacity: 0.8 }}>Tip: Check spam/junk folder too.</em>
            <button onClick={() => setError('')}
              style={{ display: 'block', marginTop: '8px', fontSize: '0.78rem', color: '#1a56db', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >Dismiss</button>
          </div>
        ) : error === 'ALREADY_REGISTERED' ? (
          <div style={{
            backgroundColor: '#f0fdf4', border: '1px solid #86efac',
            borderRadius: '8px', padding: '14px 16px',
            color: '#15803d', fontSize: '0.82rem', marginBottom: '12px',
            textAlign: 'left', lineHeight: 1.7
          }}>
            <strong style={{ display: 'block', marginBottom: '4px' }}>✅ Account already exists</strong>
            <strong>{email}</strong> is already registered. Just switch to <strong>Log In</strong> and enter your password.
            <br />
            <em style={{ fontSize: '0.78rem', opacity: 0.8 }}>If you signed up but never confirmed your email, go to Supabase Dashboard → Auth → Users → find your email → confirm it manually.</em>
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { setIsSignUp(false); setError(''); }}
                style={{ fontSize: '0.8rem', color: '#fff', background: '#15803d', border: 'none', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', fontWeight: 700 }}
              >Switch to Log In</button>
              <button onClick={() => setError('')}
                style={{ fontSize: '0.78rem', color: '#15803d', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >Dismiss</button>
            </div>
          </div>
        ) : error ? (
          <div style={{
            backgroundColor: '#fef2f2', border: '1px solid #fca5a5',
            borderRadius: '6px', padding: '10px 14px',
            color: '#dc2626', fontSize: '0.82rem', marginBottom: '12px',
            textAlign: 'left', lineHeight: 1.5
          }}>
            {error}
          </div>
        ) : null}
        {success && (
          <div style={{
            backgroundColor: '#d4edda', border: '1px solid #c3e6cb',
            borderRadius: '6px', padding: '10px 14px',
            color: '#155724', fontSize: '0.82rem', marginBottom: '12px', textAlign: 'left'
          }}>
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {isSignUp && !isForgotPassword && (
            <>
              <input
                type="text"
                placeholder="Username"
                style={inputStyle}
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                autoComplete="username"
                required
                onFocus={(e) => e.target.style.borderColor = '#666'}
                onBlur={(e) => e.target.style.borderColor = '#333'}
              />
              <input
                type="text"
                placeholder="Full Name (optional)"
                style={inputStyle}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onFocus={(e) => e.target.style.borderColor = '#666'}
                onBlur={(e) => e.target.style.borderColor = '#333'}
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email address"
            style={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            onFocus={(e) => e.target.style.borderColor = '#666'}
            onBlur={(e) => e.target.style.borderColor = '#333'}
          />
          {!isForgotPassword && (
            <input
              type="password"
              placeholder="Password"
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              required
              onFocus={(e) => e.target.style.borderColor = '#666'}
              onBlur={(e) => e.target.style.borderColor = '#333'}
            />
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            style={{ ...primaryBtnStyle(!canSubmit), marginTop: '6px' }}
          >
            {isLoading ? (isForgotPassword ? 'Sending...' : isSignUp ? 'Creating...' : 'Signing in...') : (isForgotPassword ? 'Send Reset Link' : isSignUp ? 'Sign Up' : 'Log In')}
          </button>
        </form>

        {!isForgotPassword && !isSignUp && (
          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <button
              type="button"
              onClick={() => { setIsForgotPassword(true); setError(''); setSuccess(''); }}
              style={{ color: '#0095f6', fontSize: '0.82rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Forgot password?
            </button>
          </div>
        )}

        {/* Divider */}
        <div style={dividerStyle}>
          <div style={dividerLine}></div>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '1px' }}>OR</span>
          <div style={dividerLine}></div>
        </div>

        {/* Guest Button */}
        <button
          onClick={handleGuest}
          disabled={isLoading}
          style={{
            width: '100%', padding: '9px',
            borderRadius: '8px', border: '1px solid #333',
            backgroundColor: '#1a1a1a', color: '#f5f5f5',
            fontWeight: 600, fontSize: '0.88rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#262626'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#1a1a1a'}
        >
          {isLoading ? 'Please wait...' : '👁️ Continue as Guest'}
        </button>

        {/* Switch mode */}
        <p style={{ marginTop: '22px', fontSize: '0.82rem', color: '#a3a3a3' }}>
          {isForgotPassword ? 'Remember your password?' : isSignUp ? 'Have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => { 
              if (isForgotPassword) { setIsForgotPassword(false); }
              else { setIsSignUp(!isSignUp); }
              setError(''); setSuccess(''); 
            }}
            style={{ color: '#0095f6', fontWeight: 700, fontSize: '0.82rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {isForgotPassword ? 'Log in' : isSignUp ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </div>

      {/* Footer note */}
      <p style={{ fontSize: '0.78rem', color: '#8e8e8e', textAlign: 'center', maxWidth: '360px', lineHeight: 1.6 }}>
        Your credentials are securely stored via Supabase Auth. Photos are saved to Supabase Storage.
      </p>

      {/* Admin Portal Link */}
      <div style={{
        position: 'fixed',
        left: '20px',
        bottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        opacity: 0.4,
        transition: 'opacity 0.3s ease',
        cursor: 'default'
      }}
      onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
      onMouseLeave={(e) => e.currentTarget.style.opacity = 0.4}
      >
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#0095f6',
          boxShadow: '0 0 10px rgba(0, 149, 246, 0.5)'
        }}></div>
        <button
          onClick={() => {
            setIsSignUp(false);
            setIsForgotPassword(false);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#8e8e8e',
            fontSize: '0.75rem',
            fontWeight: 500,
            cursor: 'pointer',
            padding: 0,
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}
        >
          Admin Portal
        </button>
      </div>
    </div>
  );
};
