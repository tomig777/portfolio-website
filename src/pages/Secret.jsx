import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoDark from '../assets/logo-dark.png';
import './Secret.css';

const Secret = () => {
  const navigate = useNavigate();

  return (
    <div className="secret-page">
      <div className="secret-content">
        <div
          className="secret-logo"
          role="button"
          tabIndex={-1}
          onClick={() => navigate('/')}
          style={{ backgroundImage: `url(${logoDark})` }}
        />
      </div>
    </div>
  );
};

export default Secret;
