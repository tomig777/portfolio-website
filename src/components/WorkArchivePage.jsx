import React, { useRef } from 'react';
import { useFocusScope } from '../hooks/useFocusScope';
import './WebsiteTestPages.css';
import workImage1 from '../assets/web-optimized/szia.webp';
import workImage2 from '../assets/szia_2.jpg';
import workImage3 from '../assets/szia_3.jpg';
import workImage4 from '../assets/szia_4.jpg';
import workImage5 from '../assets/kep9.png';
import workImage6 from '../assets/port1.jpg';
import CardSwap, { Card } from './CardSwap';
import LightRays from './LightRays';

const workPlaceholders = [
  { image: workImage1, title: 'Signal Study', discipline: 'Art direction' },
  { image: workImage2, title: 'Quiet Geometry', discipline: 'Visual identity' },
  { image: workImage3, title: 'Soft Circuit', discipline: 'Digital design' },
  { image: workImage4, title: 'Afterlight', discipline: 'Motion study' },
  { image: workImage5, title: 'Material Index', discipline: '3D exploration' },
  { image: workImage6, title: 'Open Frame', discipline: 'Creative development' }
];

const featuredWorkCards = workPlaceholders.slice(0, 4);
export const WorkArchivePage = ({ themePreset = 'violet', onBack }) => {
  const pageRef = useRef(null);
  useFocusScope(pageRef, { initialFocus: '[data-page-heading]', fallbackFocus: '.header__more-btn', onEscape: onBack, trap: false, isolate: false });
  return (
  <main ref={pageRef} className="wt-nav-page wt-nav-page--work" aria-label="Work archive" data-lenis-prevent>
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
        <h1 id="work-swap-title" data-page-heading tabIndex={-1}>Ideas<br /><em>in motion.</em></h1>
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
                  decoding="async"
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
};


export default WorkArchivePage;
