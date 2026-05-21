import React, { useState } from 'react';
import axios from 'axios';
import { Send } from 'lucide-react';

// Configure backend API endpoint URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function MarketingForm({ onGenerationStart, onGenerationSuccess, onGenerationEnd, user }) {
  const [formData, setFormData] = useState({
    businessType: '',
    targetAudience: '',
    productService: '',
    platform: 'Instagram',
    tone: 'Friendly',
    goal: 'Brand Awareness',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dropdown option sets
  const platforms = ['Instagram', 'WhatsApp', 'Email', 'LinkedIn', 'YouTube Shorts'];
  const tones = ['Friendly', 'Professional', 'Emotional', 'Luxury', 'Gen Z'];
  const goals = ['Brand Awareness', 'Lead Generation', 'Sales', 'Engagement', 'Product Launch'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear validation error when editing fields
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { businessType, targetAudience, productService, platform, tone, goal } = formData;

    // Client-side empty field validation
    if (!businessType.trim() || !targetAudience.trim() || !productService.trim()) {
      setError('Please fill in all text fields (Business Type, Target Audience, and Product/Service).');
      return;
    }

    setLoading(true);
    if (onGenerationStart) onGenerationStart();
    setError('');

    try {
      // POST request to backend API
      const response = await axios.post(`${API_URL}/api/generate`, {
        businessType,
        targetAudience,
        productService,
        platform,
        tone,
        goal,
      });

      // Pass input parameters and result up to the parent component
      onGenerationSuccess(formData, response.data);
    } catch (err) {
      console.error('API Call Failed:', err);
      const errMsg = err.response?.data?.message || 'Failed to connect to the backend server. Please make sure the server is running.';
      setError(errMsg);
    } finally {
      setLoading(false);
      if (onGenerationEnd) onGenerationEnd();
    }
  };

  return (
    <div className="form-panel">
      <h2 className="panel-title">Campaign Settings</h2>
      
      <form onSubmit={handleSubmit} className="marketing-form">
        {/* Business Type Input */}
        <div className="form-group">
          <label htmlFor="businessType">Business Type</label>
          <input
            id="businessType"
            type="text"
            name="businessType"
            placeholder="e.g. Fitness Center, SaaS Startup"
            value={formData.businessType}
            onChange={handleChange}
            className="form-input"
            disabled={loading}
          />
        </div>

        {/* Target Audience Input */}
        <div className="form-group">
          <label htmlFor="targetAudience">Target Audience</label>
          <input
            id="targetAudience"
            type="text"
            name="targetAudience"
            placeholder="e.g. Busy professionals aged 25-40"
            value={formData.targetAudience}
            onChange={handleChange}
            className="form-input"
            disabled={loading}
          />
        </div>

        {/* Product or Service Input */}
        <div className="form-group">
          <label htmlFor="productService">Product or Service</label>
          <input
            id="productService"
            type="text"
            name="productService"
            placeholder="e.g. 30-min HIIT workout program"
            value={formData.productService}
            onChange={handleChange}
            className="form-input"
            disabled={loading}
          />
        </div>

        {/* Platform Selection */}
        <div className="form-group">
          <label htmlFor="platform">Target Platform</label>
          <select
            id="platform"
            name="platform"
            value={formData.platform}
            onChange={handleChange}
            className="form-select"
            disabled={loading}
          >
            {platforms.map((plat) => (
              <option key={plat} value={plat}>
                {plat}
              </option>
            ))}
          </select>
        </div>

        {/* Tone Selection */}
        <div className="form-group">
          <label htmlFor="tone">Tone of Voice</label>
          <select
            id="tone"
            name="tone"
            value={formData.tone}
            onChange={handleChange}
            className="form-select"
            disabled={loading}
          >
            {tones.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Marketing Goal Selection */}
        <div className="form-group">
          <label htmlFor="goal">Marketing Goal</label>
          <select
            id="goal"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            className="form-select"
            disabled={loading}
          >
            {goals.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Validation Errors */}
        {error && <div className="auth-alert error">{error}</div>}

        {/* Submission Controls */}
        <button
          type="submit"
          className="btn-generate"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              <span>Generating Copy...</span>
            </>
          ) : (
            <>
              <Send size={18} />
              <span>Generate Assets</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
