import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoDark from '../assets/logo-dark.png';
import './Secret.css';

const Secret = () => {
  const navigate = useNavigate();

  return (
    <div className="secret-page">
      <div className="secret-content">
        <img
          src={logoDark}
          alt="Logo"
          className="secret-logo"
          onClick={() => navigate('/')}
        />
      </div>
    </div>
  );
};

export default Secret;
