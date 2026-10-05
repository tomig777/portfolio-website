import React, { useRef } from 'react';
import { useFocusScope } from '../hooks/useFocusScope';
import './WebsiteTestPages.css';
import portraitImage from '../assets/web-optimized/portrait-2.webp';
import AuroraBackground from './AuroraBackground';

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

export const AboutProfilePage = ({ skills, themePreset = 'violet', onBack }) => {
  const pageRef = useRef(null);
  useFocusScope(pageRef, { initialFocus: '[data-page-heading]', fallbackFocus: '.header__more-btn', onEscape: onBack, trap: false, isolate: false });
  const skillsByTitle = new Map(skills.map((skill) => [skill.title, skill]));

  return (
    <main ref={pageRef} className="wt-nav-page wt-nav-page--about" aria-label="About Tamas Gal" data-lenis-prevent>
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
            <img src={portraitImage} alt="Portrait of Tamas Gal" decoding="async" width="1114" height="1412" />
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
          <h1 id="about-profile-title" data-page-heading tabIndex={-1}>Hi, this is Tomi.</h1>
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


export default AboutProfilePage;
