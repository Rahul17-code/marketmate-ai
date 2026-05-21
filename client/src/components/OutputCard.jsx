import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  MessageSquare, 
  Megaphone, 
  Send, 
  Lightbulb, 
  Video, 
  Hash, 
  Zap
} from 'lucide-react';

export default function OutputCard({ data, inputs }) {
  // Store copying status for each section to show visual success ticks
  const [copiedSection, setCopiedSection] = useState(null);

  if (!data) {
    return (
      <div className="output-card empty-state">
        <Megaphone className="empty-icon animate-pulse" size={48} style={{ color: 'var(--color-primary)' }} />
        <h3>Create Your Campaign Assets</h3>
        <p>Fill out the options in the sidebar to generate professional captions, ad copy, outreach messages, video scripts, and more.</p>
      </div>
    );
  }

  // Helper to render text safely to avoid React rendering crashes (e.g. if AI returns objects)
  const renderSafeText = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
      return String(val);
    }
    if (typeof val === 'object') {
      // Look for common text/content keys
      if (val.text) return String(val.text);
      if (val.message) return String(val.message);
      if (val.content) return String(val.content);
      if (val.idea) return String(val.idea);
      if (val.hashtag) return String(val.hashtag);
      return JSON.stringify(val);
    }
    return '';
  };

  // Safely extract and check data fields with robust fallbacks
  const captions = Array.isArray(data?.captions) ? data.captions : [];
  const adCopies = Array.isArray(data?.adCopies) ? data.adCopies : [];
  const outreachMessages = Array.isArray(data?.outreachMessages) ? data.outreachMessages : [];
  const contentIdeas = Array.isArray(data?.contentIdeas) ? data.contentIdeas : [];
  const hashtags = Array.isArray(data?.hashtags) ? data.hashtags : [];

  const rawVideoScript = data?.videoScript;
  let videoScriptText = '';
  if (rawVideoScript !== null && rawVideoScript !== undefined) {
    if (typeof rawVideoScript === 'string') {
      videoScriptText = rawVideoScript;
    } else if (typeof rawVideoScript === 'object') {
      videoScriptText = rawVideoScript.text || rawVideoScript.content || JSON.stringify(rawVideoScript, null, 2);
    } else {
      videoScriptText = String(rawVideoScript);
    }
  }

  const rawCallToAction = data?.callToAction;
  let callToActionText = '';
  if (rawCallToAction !== null && rawCallToAction !== undefined) {
    if (typeof rawCallToAction === 'string') {
      callToActionText = rawCallToAction;
    } else if (typeof rawCallToAction === 'object') {
      callToActionText = rawCallToAction.text || rawCallToAction.content || JSON.stringify(rawCallToAction);
    } else {
      callToActionText = String(rawCallToAction);
    }
  }

  const copyToClipboard = (text, sectionId) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => {
      setCopiedSection(null);
    }, 2000);
  };

  // Helper to format copy text for array-based items
  const formatArrayForCopy = (title, items) => {
    return `${title}:\n` + items.map((item, i) => `${i + 1}. ${renderSafeText(item)}`).join('\n');
  };

  return (
    <div className="output-card">
      <div className="output-header">
        <div>
          <h2>Generated Marketing Assets</h2>
          <p className="output-tagline">
            Tailored for {inputs?.businessType || 'your business'} ({inputs?.platform || 'All platforms'})
          </p>
        </div>
        <div className="badge-info">
          {inputs?.tone} Tone • {inputs?.goal}
        </div>
      </div>

      <div className="output-grid">
        
        {/* Captions Widget */}
        <div className="widget">
          <div className="widget-header">
            <h3 className="widget-title">
              <MessageSquare size={16} className="widget-icon" />
              <span>Social Captions (5)</span>
            </h3>
            <button 
              onClick={() => copyToClipboard(formatArrayForCopy('Captions', captions), 'captions')}
              className="btn-copy"
              title="Copy captions"
            >
              {copiedSection === 'captions' ? (
                <Check size={16} className="copied-success" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
          <ul className="widget-list">
            {captions.map((caption, idx) => (
              <li key={idx}>
                <span className="list-num">{idx + 1}</span> {renderSafeText(caption)}
              </li>
            ))}
          </ul>
        </div>

        {/* Ad Copies Widget */}
        <div className="widget">
          <div className="widget-header">
            <h3 className="widget-title">
              <Megaphone size={16} className="widget-icon" />
              <span>Ad Copies (3)</span>
            </h3>
            <button 
              onClick={() => copyToClipboard(formatArrayForCopy('Ad Copies', adCopies), 'adCopies')}
              className="btn-copy"
              title="Copy ad copies"
            >
              {copiedSection === 'adCopies' ? (
                <Check size={16} className="copied-success" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
          <ul className="widget-list">
            {adCopies.map((ad, idx) => (
              <li key={idx}>
                <span className="list-num">{idx + 1}</span> {renderSafeText(ad)}
              </li>
            ))}
          </ul>
        </div>

        {/* Outreach Messages Widget */}
        <div className="widget">
          <div className="widget-header">
            <h3 className="widget-title">
              <Send size={16} className="widget-icon" />
              <span>Outreach Messages (3)</span>
            </h3>
            <button 
              onClick={() => copyToClipboard(formatArrayForCopy('Outreach Messages', outreachMessages), 'outreach')}
              className="btn-copy"
              title="Copy outreach messages"
            >
              {copiedSection === 'outreach' ? (
                <Check size={16} className="copied-success" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
          <ul className="widget-list">
            {outreachMessages.map((msg, idx) => (
              <li key={idx}>
                <span className="list-num">{idx + 1}</span> {renderSafeText(msg)}
              </li>
            ))}
          </ul>
        </div>

        {/* Content Ideas Widget */}
        <div className="widget">
          <div className="widget-header">
            <h3 className="widget-title">
              <Lightbulb size={16} className="widget-icon" />
              <span>Content Ideas (10)</span>
            </h3>
            <button 
              onClick={() => copyToClipboard(formatArrayForCopy('Content Ideas', contentIdeas), 'ideas')}
              className="btn-copy"
              title="Copy content ideas"
            >
              {copiedSection === 'ideas' ? (
                <Check size={16} className="copied-success" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
          <ul className="widget-list">
            {contentIdeas.map((idea, idx) => (
              <li key={idx}>
                <span className="list-num">{idx + 1}</span> {renderSafeText(idea)}
              </li>
            ))}
          </ul>
        </div>

        {/* Video Script Widget */}
        <div className="widget" style={{ gridColumn: 'span 1' }}>
          <div className="widget-header">
            <h3 className="widget-title">
              <Video size={16} className="widget-icon" />
              <span>Video Script (Shorts/Reels)</span>
            </h3>
            <button 
              onClick={() => copyToClipboard(videoScriptText, 'script')}
              className="btn-copy"
              title="Copy video script"
            >
              {copiedSection === 'script' ? (
                <Check size={16} className="copied-success" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
          <div className="script-box">
            {videoScriptText}
          </div>
        </div>

        {/* Call to Action Widget */}
        <div className="widget">
          <div className="widget-header">
            <h3 className="widget-title">
              <Zap size={16} className="widget-icon" />
              <span>Call To Action (CTA)</span>
            </h3>
            <button 
              onClick={() => copyToClipboard(callToActionText, 'cta')}
              className="btn-copy"
              title="Copy CTA"
            >
              {copiedSection === 'cta' ? (
                <Check size={16} className="copied-success" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
          <div className="cta-box">
            {callToActionText}
          </div>
        </div>

        {/* Hashtags Widget */}
        <div className="widget" style={{ gridColumn: '1 / -1' }}>
          <div className="widget-header">
            <h3 className="widget-title">
              <Hash size={16} className="widget-icon" />
              <span>Hashtags (5)</span>
            </h3>
            <button 
              onClick={() => copyToClipboard(hashtags.map(t => renderSafeText(t)).join(' '), 'hashtags')}
              className="btn-copy"
              title="Copy hashtags"
            >
              {copiedSection === 'hashtags' ? (
                <Check size={16} className="copied-success" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
          <div className="hashtag-container">
            {hashtags.map((tag, idx) => (
              <span key={idx} className="tag-badge">{renderSafeText(tag)}</span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
