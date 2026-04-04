import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import ClickSpark from './components/ClickSpark';
import { ThemeProvider } from './contexts/ThemeContext';
import Loader from './components/Loader';
import Home from './pages/Home';
import RecordBackground from './pages/RecordBackground';
import Secret from './pages/Secret';

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [isLoading, setIsLoading] = useState(isHome);

  return (
    <>
      {isLoading && <Loader onLoadingComplete={() => setIsLoading(false)} />}
      <ClickSpark
        sparkColor='#667eea'
        sparkSize={12}
        sparkRadius={20}
        sparkCount={8}
        duration={500}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/record" element={<RecordBackground />} />
          <Route path="/secret" element={<Secret />} />
        </Routes>
      </ClickSpark>
    </>
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