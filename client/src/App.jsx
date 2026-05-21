import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabaseClient';
import Header from './components/Header';
import MarketingForm from './components/MarketingForm';
import OutputCard from './components/OutputCard';
import History from './components/History';
import { Sparkles, Mail, Lock } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Active campaign output display state
  const [activeOutput, setActiveOutput] = useState(null);
  const [activeInputs, setActiveInputs] = useState(null);
  const [generating, setGenerating] = useState(false);

  // Ref to refresh the History component listing
  const historyRef = useRef(null);

  // Listen to Supabase authentication state changes
  useEffect(() => {
    // Check active session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen to changes (e.g. login, logout, sign up)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Clear auth form fields upon successful login
        setAuthEmail('');
        setAuthPassword('');
        setAuthError('');
        setAuthSuccess('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle Login and Sign Up using Supabase Email auth
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Please fill in both Email and Password fields.');
      return;
    }

    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        setAuthSuccess('Sign-up successful! Please check your email inbox for confirmation, or log in if confirmation is disabled.');
      }
    } catch (err) {
      console.error('Authentication error:', err.message);
      setAuthError(err.message || 'An authentication error occurred. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Callback triggered when marketing content is generated from the Express backend API
  const handleGenerationSuccess = async (inputs, outputData) => {
    setActiveInputs(inputs);
    setActiveOutput(outputData);

    // Save generation directly to Supabase
    if (user) {
      try {
        const { error } = await supabase.from('generations').insert([
          {
            user_id: user.id,
            business_type: inputs.businessType,
            target_audience: inputs.targetAudience,
            product_service: inputs.productService,
            platform: inputs.platform,
            tone: inputs.tone,
            goal: inputs.goal,
            output: JSON.stringify(outputData),
          },
        ]);

        if (error) throw error;

        // Force reload the history panel to display the new entry
        if (historyRef.current) {
          historyRef.current.fetchHistory();
        }
      } catch (dbError) {
        console.error('Failed to save campaign to Supabase database:', dbError.message);
      }
    }
  };

  // Callback triggered when a campaign is selected from the history panel
  const handleSelectHistoryItem = (inputs, outputData) => {
    setActiveInputs(inputs);
    setActiveOutput(outputData);
  };

  // Render Login/Signup Panel if User is unauthenticated
  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="header-brand" style={{ justifyContent: 'center', marginBottom: '24px' }}>
            <div className="logo-icon">
              <Sparkles size={20} fill="#ffffff" />
            </div>
            <h1 className="logo-text">MarketMate AI</h1>
          </div>

          <h2 className="auth-title">Welcome to MarketMate</h2>
          <p className="auth-subtitle">Create engaging, professional marketing copy with AI.</p>

          <div className="auth-tabs">
            <button
              onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}
              className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthSuccess(''); }}
              className={`auth-tab-btn ${authMode === 'signup' ? 'active' : ''}`}
            >
              Create Account
            </button>
          </div>

          {authError && <div className="auth-alert error">{authError}</div>}
          {authSuccess && <div className="auth-alert success">{authSuccess}</div>}

          <form onSubmit={handleAuthSubmit}>
            <div className="auth-form-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="auth-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="name@company.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  disabled={authLoading}
                  required
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  className="auth-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  disabled={authLoading}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={authLoading}>
              {authLoading ? (
                <div className="spinner" style={{ margin: '0 auto' }}></div>
              ) : authMode === 'login' ? (
                'Sign In'
              ) : (
                'Sign Up'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render Full Dashboard Interface when User is logged in
  return (
    <div className="app-container">
      <Header user={user} />

      <main className="dashboard-grid">
        {/* Left Hand Options Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <MarketingForm 
            onGenerationStart={() => setGenerating(true)}
            onGenerationSuccess={handleGenerationSuccess} 
            onGenerationEnd={() => setGenerating(false)}
            user={user} 
          />
          <History 
            ref={historyRef}
            user={user} 
            onSelectHistoryItem={handleSelectHistoryItem} 
          />
        </div>

        {/* Right Hand Assets Workspace Panel */}
        <div className="workspace-right">
          {generating ? (
            <OutputSkeleton />
          ) : (
            <OutputCard data={activeOutput} inputs={activeInputs} />
          )}
        </div>
      </main>
    </div>
  );
}

// Ultra-professional shimmer skeleton loader component
function OutputSkeleton() {
  return (
    <div className="output-card skeleton-loading">
      <div className="output-header animate-pulse">
        <div style={{ width: '60%' }}>
          <div className="skeleton-title shimmer"></div>
          <div className="skeleton-text shimmer" style={{ width: '45%', marginTop: '12px' }}></div>
        </div>
        <div className="skeleton-badge shimmer"></div>
      </div>

      <div className="output-grid">
        {[...Array(6)].map((_, idx) => (
          <div key={idx} className="widget skeleton-widget">
            <div className="widget-header">
              <div className="skeleton-widget-title shimmer"></div>
              <div className="skeleton-circle shimmer"></div>
            </div>
            <div className="widget-list" style={{ gap: '8px', marginTop: '12px' }}>
              <div className="skeleton-line shimmer"></div>
              <div className="skeleton-line shimmer" style={{ width: '90%' }}></div>
              <div className="skeleton-line shimmer" style={{ width: '75%' }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
