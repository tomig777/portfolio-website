import React, { useState } from 'react';
import FluidGlassBubbles from './FluidGlassBubbles';
import './GradientDrift.css';

const COLOR_SCHEMES = [
  {
    id: 'fuchsia',
    label: 'Fuchsia',
    preview: 'linear-gradient(145deg, #ff86cf, #8a003e)',
    colors: ['#360021', '#650031', '#a6004b', '#e40070', '#ff188f', '#ff67bd', '#f2a6db', '#f0d4e9', '#f7f3f1'],
  },
  {
    id: 'ocean',
    label: 'Ocean',
    preview: 'linear-gradient(145deg, #7ce5ff, #073d93)',
    colors: ['#031d52', '#073d93', '#075fc1', '#008fd4', '#19bbdc', '#66dce7', '#a5edf0', '#d8f7f3', '#f3fbf7'],
  },
  {
    id: 'violet',
    label: 'Violet',
    preview: 'linear-gradient(145deg, #d29aff, #411076)',
    colors: ['#1d073b', '#411076', '#6525a4', '#8744c5', '#aa68df', '#c78ceb', '#ddb2f3', '#ecd9f7', '#f6f1f8'],
  },
  {
    id: 'jade',
    label: 'Jade',
    preview: 'linear-gradient(145deg, #8df5cf, #075b49)',
    colors: ['#032d28', '#075b49', '#087a61', '#0c9d78', '#35bd91', '#70d6ad', '#a5e8ca', '#d4f3e4', '#f2f8f3'],
  },
  {
    id: 'ember',
    label: 'Ember',
    preview: 'linear-gradient(145deg, #ffb75b, #8b221e)',
    colors: ['#3f1018', '#702019', '#a5361c', '#d75020', '#f37528', '#ff9d4c', '#ffc078', '#f7dbb2', '#f8f1e4'],
  },
  {
    id: 'mono',
    label: 'Monochrome',
    preview: 'linear-gradient(145deg, #eeeeee, #202126)',
    colors: ['#111217', '#202126', '#34363c', '#52555c', '#74777d', '#9a9ca1', '#bfc0c3', '#dedee0', '#f5f4f2'],
  },
];

const SPEEDS = [
  { label: '1×', value: 1 },
  { label: '1.3×', value: 1.3 },
  { label: '1.6×', value: 1.6 },
  { label: '2×', value: 2 },
];

const GradientDrift = () => {
  const [schemeIndex, setSchemeIndex] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(0);
  const scheme = COLOR_SCHEMES[schemeIndex];
  const speed = SPEEDS[speedIndex];

  const cycleSpeed = () => {
    setSpeedIndex((current) => (current + 1) % SPEEDS.length);
  };

  return (
    <main className="gradient-drift" aria-label="Fluid glass lens texture">
      <FluidGlassBubbles colors={scheme.colors} speed={speed.value} />
      <div className="gradient-drift__surface" aria-hidden="true" />

      <aside className="gradient-drift__controls" aria-label="Customize the gradient">
        <div className="gradient-drift__swatches" role="group" aria-label="Color scheme">
          {COLOR_SCHEMES.map((option, index) => (
            <button
              type="button"
              className={`gradient-drift__swatch${index === schemeIndex ? ' is-active' : ''}`}
              style={{ '--swatch-preview': option.preview }}
              onClick={() => setSchemeIndex(index)}
              aria-label={`${option.label} color scheme`}
              aria-pressed={index === schemeIndex}
              title={option.label}
              key={option.id}
            />
          ))}
        </div>

        <button
          type="button"
          className="gradient-drift__speed"
          onClick={cycleSpeed}
          aria-label={`Animation speed ${speed.label}. Press to increase`}
          title={`Animation speed: ${speed.label}`}
        >
          {speed.label}
        </button>
      </aside>
    </main>
  );
};

export default GradientDrift;
