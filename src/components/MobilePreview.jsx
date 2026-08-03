import React from 'react';
import './MobilePreview.css';

/**
 * A device shell that lets us preview the existing portfolio at a phone
 * viewport without changing the production page's responsive behavior yet.
 */
const MobilePreview = () => (
  <main className="mobile-preview" aria-label="Mobile portfolio preview">
    <div className="mobile-preview-phone" role="group" aria-label="Mobile portfolio preview">
      <div className="mobile-preview-side-button mobile-preview-side-button--top" aria-hidden="true" />
      <div className="mobile-preview-side-button mobile-preview-side-button--middle" aria-hidden="true" />
      <div className="mobile-preview-side-button mobile-preview-side-button--bottom" aria-hidden="true" />

      <div className="mobile-preview-bezel">
        <div className="mobile-preview-screen">
          <iframe
            className="mobile-preview-iframe"
            src="/?mobilePreview=1"
            title="Portfolio mobile layout preview"
          />
          <div className="mobile-preview-status" aria-hidden="true">
            <span>9:41</span>
            <span className="mobile-preview-status-icons">
              <i />
              <i />
              <i />
            </span>
          </div>
          <div className="mobile-preview-island" aria-hidden="true" />
        </div>
      </div>
    </div>
  </main>
);

export default MobilePreview;
