import React from 'react';
import { supabase } from '../lib/supabaseClient';
import { LogOut, Sparkles } from 'lucide-react';

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
        <div className="logo-icon">
          <Sparkles size={20} fill="#ffffff" />
        </div>
        <div className="brand-titles">
          <h1 className="logo-text">MarketMate AI</h1>
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
