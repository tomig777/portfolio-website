import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import ClickSpark from './components/ClickSpark';
import { ThemeProvider } from './contexts/ThemeContext';
import Home from './pages/Home';
import RecordBackground from './pages/RecordBackground';

function AppContent() {
  return (
    <ClickSpark
      sparkColor='#b19eef'
      sparkSize={12}
      sparkRadius={20}
      sparkCount={8}
      duration={500}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/record" element={<RecordBackground />} />
      </Routes>
    </ClickSpark>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;