import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Clock, RefreshCw } from 'lucide-react';

/**
 * History Component.
 * Fetches and displays the user's past generations from Supabase.
 * Uses forwardRef and useImperativeHandle so the parent App can trigger a reload.
 */
const History = forwardRef(({ user, onSelectHistoryItem }, ref) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Expose the fetchHistory function to the parent component
  useImperativeHandle(ref, () => ({
    fetchHistory
  }));

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (err) {
      console.error('Error fetching history:', err.message);
      setError('Could not load history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  // Format timestamp helper
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleItemClick = (item) => {
    let parsedOutput = null;
    try {
      parsedOutput = JSON.parse(item.output);
    } catch (e) {
      console.error('Failed to parse output JSON from history:', e);
      return;
    }

    const inputs = {
      businessType: item.business_type,
      targetAudience: item.target_audience,
      productService: item.product_service,
      platform: item.platform,
      tone: item.tone,
      goal: item.goal
    };

    onSelectHistoryItem(inputs, parsedOutput);
  };

  return (
    <div className="history-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 className="panel-title" style={{ marginBottom: 0 }}>Generation History</h2>
        <button 
          onClick={fetchHistory} 
          className="btn-copy" 
          title="Refresh history"
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '10px', color: 'var(--text-muted)' }}>Loading history...</div>}
      
      {error && <div className="auth-alert error" style={{ padding: '8px', fontSize: '0.8rem' }}>{error}</div>}

      {!loading && !error && history.length === 0 && (
        <p className="no-history">No previous generations found.</p>
      )}

      {!loading && !error && history.length > 0 && (
        <div className="history-list">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="history-item"
            >
              <div className="history-item-header">
                <span className="history-time" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} />
                  {formatDate(item.created_at)}
                </span>
                <div className="history-item-meta">
                  <span className="history-badge">{item.platform}</span>
                  <span className="history-badge">{item.tone}</span>
                </div>
              </div>
              <div className="history-desc" title={`${item.business_type} - ${item.product_service}`}>
                <strong>{item.business_type}</strong>: {item.product_service}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

export default History;
