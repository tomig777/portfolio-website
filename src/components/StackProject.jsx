import React from 'react';
import ScrollStack, { ScrollStackItem } from './ScrollStack';
import './StackProject.css';

const CARDS = [
  {
    title: 'Design',
    subtitle: 'Visual identity & branding',
    number: '01',
    accent: '#1a1a2e',
  },
  {
    title: 'Develop',
    subtitle: 'Code, architecture & systems',
    number: '02',
    accent: '#16213e',
  },
  {
    title: 'Motion',
    subtitle: 'Animation & interactive experiences',
    number: '03',
    accent: '#1a1625',
  },
  {
    title: 'Create',
    subtitle: 'Experimental & generative art',
    number: '04',
    accent: '#1e1a15',
  },
  {
    title: 'Ship',
    subtitle: 'Deploy, iterate & scale',
    number: '05',
    accent: '#141e1a',
  },
];

const StackProject = ({ onBack }) => {
  return (
    <div className="stack-project">
      {onBack && (
        <button className="stack-project-back" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3L5 8L10 13" />
          </svg>
          Back
        </button>
      )}

      <ScrollStack
        itemDistance={80}
        itemScale={0.02}
        itemStackDistance={28}
        stackPosition="25%"
        scaleEndPosition="12%"
        baseScale={0.88}
        rotationAmount={0}
        blurAmount={2}
      >
        {CARDS.map((card) => (
          <ScrollStackItem key={card.number}>
            <div className="stack-card-inner" style={{ background: card.accent }}>
              <span className="stack-card-number">{card.number}</span>
              <div className="stack-card-content">
                <h2 className="stack-card-title">{card.title}</h2>
                <p className="stack-card-subtitle">{card.subtitle}</p>
              </div>
              <div className="stack-card-line" />
            </div>
          </ScrollStackItem>
        ))}
      </ScrollStack>
    </div>
  );
};

export default StackProject;
