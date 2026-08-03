import React, { useState } from 'react';

import workImage1 from '../assets/szia.png';
import workImage2 from '../assets/szia_2.jpg';
import workImage3 from '../assets/szia_3.jpg';
import workImage4 from '../assets/szia_4.jpg';
import workImage5 from '../assets/kep9.png';
import workImage6 from '../assets/port1.jpg';
import portraitImage from '../assets/portrait-2.png';
import CardSwap, { Card } from './CardSwap';
import LightRays from './LightRays';
import AuroraBackground from './AuroraBackground';

import './WebsiteTestPages.css';

const workPlaceholders = [
  { image: workImage1, title: 'Signal Study', discipline: 'Art direction' },
  { image: workImage2, title: 'Quiet Geometry', discipline: 'Visual identity' },
  { image: workImage3, title: 'Soft Circuit', discipline: 'Digital design' },
  { image: workImage4, title: 'Afterlight', discipline: 'Motion study' },
  { image: workImage5, title: 'Material Index', discipline: '3D exploration' },
  { image: workImage6, title: 'Open Frame', discipline: 'Creative development' }
];

const featuredWorkCards = workPlaceholders.slice(0, 4);
const ABOUT_AURORA_COLORS = {
  violet: ['#05091d', '#233c9f', '#7285ff'],
  red: ['#240609', '#d51f2e', '#ff593d'],
};

const aboutSkillGroups = [
  {
    title: 'Design & Image',
    skills: ['Adobe Illustrator', 'Adobe Photoshop', 'Adobe Lightroom', 'Figma'],
  },
  {
    title: 'Motion & Video',
    skills: ['Adobe Premiere Pro', 'Adobe After Effects', 'Adobe Audition', 'DaVinci Resolve'],
  },
  {
    title: '3D & Real-time',
    skills: ['Autodesk Maya', 'Blender', 'Cinema 4D', 'Unreal Engine'],
  },
  {
    title: 'Creative Technology',
    skills: ['Nuke', 'Substance Painter', 'TouchDesigner', 'ChatGPT'],
  },
];

export const WorkArchivePage = ({ themePreset = 'violet' }) => (
  <main className="wt-nav-page wt-nav-page--work" aria-label="Work archive" data-lenis-prevent>
    <div className="wt-work-rays" aria-hidden="true">
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
    <section className="wt-work-swap-hero" aria-labelledby="work-swap-title">
      <div className="wt-work-swap-copy">
        <h1 id="work-swap-title">Ideas<br /><em>in motion.</em></h1>
        <p className="wt-work-swap-intro">
          A rotating selection of visual identities, digital experiments, motion studies, and three-dimensional worlds, each shaped to feel distinct, considered, and alive.
        </p>
      </div>

      <div className="wt-work-swap-stage" aria-label="Animated selected work stack">
        <CardSwap
          width="clamp(340px, 48vw, 650px)"
          height="clamp(490px, 78vh, 710px)"
          cardDistance={42}
          verticalDistance={22}
          delay={4600}
          skewAmount={4}
          easing="elastic"
        >
          {featuredWorkCards.map((work, index) => (
            <Card
              customClass="wt-work-swap-card"
              key={work.title}
              aria-label={`${work.title}, ${work.discipline}`}
            >
              <div className="wt-work-swap-card__top">
                <span>{String(index + 1).padStart(2, '0')} / {String(featuredWorkCards.length).padStart(2, '0')}</span>
                <span>{work.discipline}</span>
              </div>
              <div className="wt-work-swap-card__media">
                <img
                  src={work.image}
                  alt={`${work.title} project preview`}
                  loading={index < 2 ? 'eager' : 'lazy'}
                />
              </div>
              <div className="wt-work-swap-card__bottom">
                <h2>{work.title}</h2>
                <span>Selected work</span>
              </div>
            </Card>
          ))}
        </CardSwap>
      </div>
    </section>

    <footer className="wt-nav-page__footer">
      <span>A growing archive &mdash; more projects coming soon.</span>
      <span>Tamas Gal — Budapest</span>
    </footer>
  </main>
);

export const AboutProfilePage = ({ skills, themePreset = 'violet' }) => {
  const skillsByTitle = new Map(skills.map((skill) => [skill.title, skill]));

  return (
    <main className="wt-nav-page wt-nav-page--about" aria-label="About Tamas Gal" data-lenis-prevent>
      <div className="wt-about-page__aurora" aria-hidden="true">
        <AuroraBackground
          colorStops={ABOUT_AURORA_COLORS[themePreset] || ABOUT_AURORA_COLORS.violet}
          blend={0.72}
          amplitude={1.15}
          speed={0.48}
        />
      </div>
      <section className="wt-about-frame" aria-labelledby="about-profile-title">
        <div className="wt-about-frame__visual">
          <div className="wt-about-frame__portrait">
            <img src={portraitImage} alt="Portrait of Tamas Gal" />
            <span className="wt-about-frame__corner wt-about-frame__corner--one" aria-hidden="true">+</span>
            <span className="wt-about-frame__corner wt-about-frame__corner--two" aria-hidden="true">+</span>
            <span className="wt-about-frame__corner wt-about-frame__corner--three" aria-hidden="true">+</span>
            <span className="wt-about-frame__corner wt-about-frame__corner--four" aria-hidden="true">+</span>
          </div>

          <dl className="wt-about-frame__facts">
            <div>
              <dt>Based in</dt>
              <dd>Budapest, Hungary</dd>
            </div>
            <div>
              <dt>Focus</dt>
              <dd>Design, motion &amp; 3D</dd>
            </div>
          </dl>
        </div>

        <div className="wt-about-frame__content">
          <p className="wt-nav-page__eyebrow">Curious. Playful. Always making something.</p>
          <h1 id="about-profile-title">Hi, this is Tomi.</h1>
          <p className="wt-about-frame__lead">
            I'm a Budapest-based multidisciplinary designer who likes good ideas, strange little details, and making digital things feel a bit more human.
          </p>
          <p className="wt-about-frame__bio">
            I bounce between digital art, photography, games, and tiny side projects that turn random ideas into something real. I love building things, testing new tools, and fussing over the little details until everything feels just right. Two cats supervise the process and offer highly selective creative feedback.
          </p>

          <div className="wt-about-frame__actions">
            <span className="wt-about-page__resume" aria-label="Resume download coming soon">
              Download résumé <span aria-hidden="true">↓</span>
            </span>
            <span>Powered by curiosity, side quests, and two cats.</span>
          </div>

          <div className="wt-about-frame__tool-groups" aria-label="Tools I use">
            {aboutSkillGroups.map((group) => (
              <section className="wt-about-frame__tool-group" key={group.title}>
                <h2>{group.title}</h2>
                <ul>
                  {group.skills.map((title) => {
                    const skill = skillsByTitle.get(title);
                    if (!skill) return null;

                    return (
                      <li key={title}>
                        <span className="wt-about-frame__tool-icon">{skill.node}</span>
                        <span>{title}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>

      <footer className="wt-nav-page__footer wt-about-frame__footer">
        <span>tamasgaldesign@gmail.com</span>
        <span>Tamas Gal — Budapest</span>
      </footer>
    </main>
  );
};

export const ContactFormPage = ({ themePreset = 'violet' }) => {
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
    <main className="wt-nav-page wt-nav-page--contact" aria-label="Contact Tamas Gal" data-lenis-prevent>
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
          <h1>Let’s make<br /><em>something felt.</em></h1>
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
