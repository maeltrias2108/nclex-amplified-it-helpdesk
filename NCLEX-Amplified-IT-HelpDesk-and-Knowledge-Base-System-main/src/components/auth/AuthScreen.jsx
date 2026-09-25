import React, { useState } from 'react';
import {
  Sparkles,
  UserRound,
  Mail,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Info
} from 'lucide-react';
import {
  firebaseConfigured,
  firebaseLogin,
  firebaseRegister,
  firebaseResetPassword,
  firebaseErrorMessage
} from '../../firebase';
import { Alert } from '../common/Toast';

export function AuthScreen({ view, setView, onLogin, students = [] }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const isRegister = view === 'student-register';
  const isReset = view === 'forgot-password';
  const isAdmin = view === 'admin-login';

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Quick fill helper for demo testing
  const handleDemoFill = (role) => {
    if (role === 'admin') {
      setView('admin-login');
      setForm({ name: '', email: 'admin@nclexamplified.edu', password: 'admin1234', confirm: '' });
    } else {
      setView('student-login');
      setForm({ name: '', email: 'demo@student.edu', password: 'student1234', confirm: '' });
    }
    setMessage({ type: 'info', text: `Demo ${role} credentials loaded.` });
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);
    const email = form.email.trim().toLowerCase();

    if (!email || (!isReset && !form.password)) {
      return setMessage({ type: 'error', text: 'Please complete all required fields.' });
    }

    if (isRegister) {
      if (!form.name.trim()) {
        return setMessage({ type: 'error', text: 'Please enter your full name.' });
      }
      if (form.password.length < 8) {
        return setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      }
      if (form.password !== form.confirm) {
        return setMessage({ type: 'error', text: 'Passwords do not match.' });
      }
    }

    setLoading(true);

    try {
      // 1. IF FIREBASE IS CONFIGURED:
      if (firebaseConfigured) {
        if (isReset) {
          await firebaseResetPassword(email);
          setMessage({ type: 'success', text: 'Password reset link sent! Please check your email inbox.' });
          return;
        }

        if (isRegister) {
          await firebaseRegister(form.name.trim(), email, form.password);
          setView('student-login');
          setMessage({ type: 'success', text: 'Account created! Please verify your email before signing in.' });
          return;
        }

        const account = await firebaseLogin(email, form.password);
        if (isAdmin && account.role !== 'admin') {
          throw new Error('This account does not have administrator privileges.');
        }
        if (!isAdmin && account.role === 'admin') {
          throw new Error('This is an administrator account. Please use the Administrator Login.');
        }

        onLogin(account.role, account.name, account.email, account.verified);
        return;
      }

      // 2. DEMO MODE FALLBACK (When Firebase environment variables are not yet added):
      await new Promise((resolve) => setTimeout(resolve, 400));

      if (isReset) {
        setMessage({
          type: 'success',
          text: `[Demo Mode] Password reset simulation email dispatched to ${email}.`
        });
        return;
      }

      if (isRegister) {
        setView('student-login');
        setMessage({
          type: 'success',
          text: `[Demo Mode] Student account created for ${form.name}. You may now sign in.`
        });
        return;
      }

      if (isAdmin) {
        if (email === 'admin@nclexamplified.edu' && form.password === 'admin1234') {
          onLogin('admin', 'Operations Admin', 'admin@nclexamplified.edu', true);
        } else {
          // Allow any admin test account in demo mode
          const namePart = email.split('@')[0];
          const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
          onLogin('admin', `${capitalized} (Admin)`, email, true);
        }
      } else {
        const studentRecord = students.find((s) => s.email.toLowerCase() === email);
        if (studentRecord?.active === false) {
          throw new Error('This student account is deactivated. Contact an administrator.');
        }
        const displayName = studentRecord?.name || (email === 'demo@student.edu' ? 'Jordan Lee' : email.split('@')[0]);
        onLogin('student', displayName, email, true);
      }
    } catch (error) {
      setMessage({ type: 'error', text: firebaseErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  const title = isRegister
    ? 'Create your account'
    : isReset
    ? 'Reset your password'
    : isAdmin
    ? 'Administrator Access'
    : 'Welcome back';

  return (
    <div className="auth-page">
      <div className="auth-decoration decor-one" />
      <div className="auth-decoration decor-two" />

      <div className="auth-panel">
        <div className="auth-brand">
          <img src="/nclex-logo.png" alt="NCLEX Amplified" className="auth-logo" />
          <div className="auth-brand-text">
            <span>NCLEX <strong>AMPLIFIED</strong></span>
            <small>{isAdmin ? 'SECURE ADMIN WORKSPACE' : 'IT HELPDESK & KNOWLEDGE BASE'}</small>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-top">
            <div className="auth-icon-badge">
              <Sparkles size={22} />
            </div>
            <span className="auth-eyebrow">
              {isAdmin ? 'Operations Console' : 'Student Support Portal'}
            </span>
            <h1 className="auth-title">{title}</h1>
            <p className="auth-subtitle">
              {isRegister
                ? 'Get instant help, search resources, and submit trackable support requests.'
                : isReset
                ? 'Enter your registered email and we will send a password reset link.'
                : isAdmin
                ? 'Manage tickets, student accounts, announcements, and knowledge base articles.'
                : 'Your dedicated workspace for quick solutions, IT support, and study tools.'}
            </p>
          </div>

          {!firebaseConfigured && (
            <div className="demo-mode-banner">
              <div className="demo-badge">
                <Info size={14} /> DEMO MODE ACTIVE
              </div>
              <p>Firebase is running in local preview mode. Click to load test credentials:</p>
              <div className="demo-actions">
                <button
                  type="button"
                  className="button button-sm button-light"
                  onClick={() => handleDemoFill('student')}
                >
                  Student: demo@student.edu
                </button>
                <button
                  type="button"
                  className="button button-sm button-light"
                  onClick={() => handleDemoFill('admin')}
                >
                  Admin: admin@nclexamplified.edu
                </button>
              </div>
            </div>
          )}

          {message && <Alert type={message.type}>{message.text}</Alert>}

          <form onSubmit={submit} className="auth-form">
            {isRegister && (
              <label className="field">
                <span className="field-label">Full name <i className="text-danger">*</i></span>
                <div className="field-control">
                  <UserRound size={17} className="field-icon" />
                  <input
                    required
                    name="name"
                    value={form.name}
                    onChange={update}
                    placeholder="Jordan Lee"
                  />
                </div>
              </label>
            )}

            <label className="field">
              <span className="field-label">Email address <i className="text-danger">*</i></span>
              <div className="field-control">
                <Mail size={17} className="field-icon" />
                <input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={update}
                  placeholder={isAdmin ? 'admin@nclexamplified.edu' : 'student@nclexamplified.edu'}
                />
              </div>
            </label>

            {!isReset && (
              <label className="field">
                <span className="field-label">Password <i className="text-danger">*</i></span>
                <div className="field-control">
                  <KeyRound size={17} className="field-icon" />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={update}
                    placeholder={isRegister ? 'At least 8 characters' : 'Enter your password'}
                  />
                  <button
                    type="button"
                    className="field-action-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>
            )}

            {isRegister && (
              <label className="field">
                <span className="field-label">Confirm Password <i className="text-danger">*</i></span>
                <div className="field-control">
                  <ShieldCheck size={17} className="field-icon" />
                  <input
                    required
                    type="password"
                    name="confirm"
                    value={form.confirm}
                    onChange={update}
                    placeholder="Repeat your password"
                  />
                </div>
              </label>
            )}

            {!isRegister && !isReset && (
              <div className="auth-form-row">
                <span />
                <button
                  type="button"
                  className="text-button forgot-btn"
                  onClick={() => setView('forgot-password')}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button type="submit" className="button button-primary button-wide" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" /> Signing in...
                </>
              ) : isRegister ? (
                <>
                  Create Account <ArrowRight size={17} />
                </>
              ) : isReset ? (
                <>
                  Send Reset Link <ArrowRight size={17} />
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            {isReset ? (
              <button
                type="button"
                className="text-button back-to-login"
                onClick={() => setView(isAdmin ? 'admin-login' : 'student-login')}
              >
                <ArrowLeft size={15} /> Back to sign in
              </button>
            ) : isAdmin ? (
              <button
                type="button"
                className="text-button"
                onClick={() => setView('student-login')}
              >
                Return to Student Portal Login
              </button>
            ) : (
              <div className="auth-switch-text">
                {isRegister ? 'Already registered?' : 'New student?'}{' '}
                <button
                  type="button"
                  className="text-button auth-switch-btn"
                  onClick={() => setView(isRegister ? 'student-login' : 'student-register')}
                >
                  {isRegister ? 'Sign in here' : 'Create an account'}
                </button>
              </div>
            )}

            {!isReset && !isAdmin && (
              <button
                type="button"
                className="admin-switch-link"
                onClick={() => setView('admin-login')}
              >
                <ShieldCheck size={15} /> Administrator Access Portal
              </button>
            )}
          </div>
        </div>

        <div className="auth-legal-notes">
          Protected Student HelpDesk &bull; NCLEX Amplified Academic Systems
        </div>
      </div>
    </div>
  );
}
