import React from 'react';
import { supabase } from '../lib/supabaseClient';
import { LogOut } from 'lucide-react';

/**
 * Header component for the application dashboard.
 * Displays the product name/logo and handles session logout.
 */
export default function Header({ user }) {
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error logging out:', error.message);
      alert('Failed to log out: ' + error.message);
    }
  };

  return (
    <header className="app-header">
      {/* Brand logo & styling */}
      <div className="header-brand">
        <div className="logo-icon" style={{ background: 'transparent', border: 'none', padding: 0, width: '32px', height: '32px' }}>
          <img src="/logo.png" alt="MarketMate Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div className="brand-titles">
          <h1 className="logo-text">MarketMate</h1>
        </div>
      </div>

      {/* Authenticated user information & control */}
      {user && (
        <div className="header-user">
          <span className="user-email">{user.email}</span>
          <button onClick={handleLogout} className="btn-signout">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </header>
  );
}
