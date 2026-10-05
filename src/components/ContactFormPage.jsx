import React, { useRef, useState } from 'react';
import { useFocusScope } from '../hooks/useFocusScope';
import './WebsiteTestPages.css';
import LightRays from './LightRays';

export const ContactFormPage = ({ themePreset = 'violet', onBack }) => {
  const pageRef = useRef(null);
  useFocusScope(pageRef, { initialFocus: '[data-page-heading]', fallbackFocus: '.header__more-btn', onEscape: onBack, trap: false, isolate: false });
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const endpoint = import.meta.env.VITE_CONTACT_FORM_ENDPOINT?.trim();

    if (endpoint) {
      setStatus('sending');
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' }
        });

        if (!response.ok) throw new Error('Unable to send message');
        form.reset();
        setStatus('sent');
      } catch {
        setStatus('error');
      }
      return;
    }

    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:tamasgaldesign@gmail.com?subject=${subject}&body=${body}`;
    setStatus('fallback');
  };

  const statusMessage = {
    sending: 'Sending your message…',
    sent: 'Thank you — your message has been sent.',
    error: 'The message could not be sent. Please email tamasgaldesign@gmail.com.',
    fallback: 'Your email app is opening with the message ready to send.'
  }[status];

  return (
    <main ref={pageRef} className="wt-nav-page wt-nav-page--contact" aria-label="Contact Tamas Gal" data-lenis-prevent>
      <div className="wt-work-rays wt-contact-rays" aria-hidden="true">
        <LightRays
          raysOrigin="top-center"
          raysColor={themePreset === 'red' ? '#b52b3a' : '#6f7ff2'}
          raysSpeed={0.68}
          lightSpread={0.9}
          rayLength={1.7}
          fadeDistance={1.1}
          saturation={0.9}
          followMouse
          mouseInfluence={0.1}
          noiseAmount={0.025}
          distortion={0.035}
        />
      </div>
      <section className="wt-contact-page__layout">
        <div className="wt-contact-page__copy">
          <h1 data-page-heading tabIndex={-1}>Let’s make<br /><em>something felt.</em></h1>
          <p>
            Tell me a little about your idea, timeline, or the problem you want to solve. I’ll get back to you as soon as I can.
          </p>
          <a href="mailto:tamasgaldesign@gmail.com">tamasgaldesign@gmail.com</a>
        </div>

        <form className="wt-contact-page__form" onSubmit={handleSubmit}>
          <div className="wt-contact-page__field">
            <label htmlFor="contact-name">Your name</label>
            <input id="contact-name" name="name" type="text" autoComplete="name" placeholder="Name" required maxLength="80" />
          </div>

          <div className="wt-contact-page__field">
            <label htmlFor="contact-email">Email address</label>
            <input id="contact-email" name="email" type="email" autoComplete="email" placeholder="name@email.com" required maxLength="120" />
          </div>

          <div className="wt-contact-page__field wt-contact-page__field--message">
            <label htmlFor="contact-message">Your message</label>
            <textarea id="contact-message" name="message" placeholder="Tell me about the project…" required maxLength="2000" rows="7" />
          </div>

          <div className="wt-contact-page__submit-row">
            <button type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send message'} <span aria-hidden="true">↗</span>
            </button>
            {statusMessage && <p role="status">{statusMessage}</p>}
          </div>
        </form>
      </section>

      <footer className="wt-nav-page__footer">
        <span>Based in Budapest, working worldwide.</span>
        <span>© 2026 Tamas Gal</span>
      </footer>
    </main>
  );
};
export default ContactFormPage;

