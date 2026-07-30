import { useEffect, useState } from 'react';
import './Aurora.css';

const Aurora = ({
  colorTheme = 'purple', // 'purple', 'blue', 'emerald', 'crimson', 'gold'
  speed = 1.0,
  opacity = 0.6,
  scale = 1.0
}) => {
  const [colors, setColors] = useState({
    c1: '#b19eef',
    c2: '#8665f7',
    c3: '#4d2db7',
    c4: '#1a0d3f'
  });

  useEffect(() => {
    switch (colorTheme) {
      case 'blue':
        setColors({
          c1: '#00f2fe',
          c2: '#4facfe',
          c3: '#0052d4',
          c4: '#001a4d'
        });
        break;
      case 'emerald':
        setColors({
          c1: '#05c19c',
          c2: '#11998e',
          c3: '#38ef7d',
          c4: '#052b24'
        });
        break;
      case 'crimson':
        setColors({
          c1: '#ff0844',
          c2: '#ffb199',
          c3: '#b92b27',
          c4: '#30020c'
        });
        break;
      case 'gold':
        setColors({
          c1: '#f8d153',
          c2: '#ff9900',
          c3: '#f12711',
          c4: '#3f1301'
        });
        break;
      case 'purple':
      default:
        setColors({
          c1: '#b19eef',
          c2: '#8665f7',
          c3: '#4d2db7',
          c4: '#1a0d3f'
        });
        break;
    }
  }, [colorTheme]);

  const animationStyle = {
    animationDuration: `${20 / speed}s`,
    opacity: opacity,
    transform: `scale(${scale})`
  };

  return (
    <div className="aurora-container" style={{ opacity }}>
      <div className="aurora-blob aurora-blob--1" style={{ 
        backgroundColor: colors.c1, 
        animationDuration: `${25 / speed}s`,
        transform: `scale(${scale * 1.2})` 
      }}></div>
      <div className="aurora-blob aurora-blob--2" style={{ 
        backgroundColor: colors.c2, 
        animationDuration: `${30 / speed}s`,
        transform: `scale(${scale * 0.9})` 
      }}></div>
      <div className="aurora-blob aurora-blob--3" style={{ 
        backgroundColor: colors.c3, 
        animationDuration: `${35 / speed}s`,
        transform: `scale(${scale * 1.1})` 
      }}></div>
      <div className="aurora-blob aurora-blob--4" style={{ 
        backgroundColor: colors.c4, 
        animationDuration: `${40 / speed}s`,
        transform: `scale(${scale * 1.0})` 
      }}></div>
      <div className="aurora-overlay"></div>
    </div>
  );
};

export default Aurora;
