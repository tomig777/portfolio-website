import React from 'react';
import './App.css';
import ClickSpark from './components/ClickSpark';
import { ThemeProvider } from './contexts/ThemeContext';
import Home from './pages/Home';

function AppContent() {
  return (
    <ClickSpark
      sparkColor='#b19eef'
      sparkSize={12}
      sparkRadius={20}
      sparkCount={8}
      duration={500}
    >
      <Home />
    </ClickSpark>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;