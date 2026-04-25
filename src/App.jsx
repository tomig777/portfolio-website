import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import ClickSpark from './components/ClickSpark';
import { ThemeProvider } from './contexts/ThemeContext';
import Home from './pages/Home';
import RecordBackground from './pages/RecordBackground';
const Secret = lazy(() => import('./pages/Secret'));
const ProjectPicker = lazy(() => import('./components/ProjectPicker'));

function AppContent() {
  const location = useLocation();

  const isSecret = location.pathname === '/secret';
  const isProjects = location.pathname === '/projects';
  const isSpecialPage = isSecret || isProjects;

  return (
    <>
      {isSpecialPage ? (
        <Suspense fallback={<div style={{ background: '#000', width: '100vw', height: '100vh' }} />}>
          <Routes>
            <Route path="/secret" element={<Secret />} />
            <Route path="/projects" element={<ProjectPicker />} />
          </Routes>
        </Suspense>
      ) : (
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
          </Routes>
        </ClickSpark>
      )}
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