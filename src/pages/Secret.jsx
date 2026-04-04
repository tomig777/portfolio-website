import React from 'react';
import { useNavigate } from 'react-router-dom';
import AsciiFluidVortex from '../components/AsciiFluidVortex';

const Secret = () => {
  const navigate = useNavigate();

  return <AsciiFluidVortex onBack={() => navigate('/')} />;
};

export default Secret;
