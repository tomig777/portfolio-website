import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import ClickSpark from './components/ClickSpark';
import { ThemeProvider } from './contexts/ThemeContext';
const RecordBackground = lazy(() => import('./pages/RecordBackground'));
const Secret = lazy(() => import('./pages/Secret'));
const ProjectPicker = lazy(() => import('./components/ProjectPicker'));
const WebsiteTest = lazy(() => import('./components/WebsiteTest'));

function AppContent() {
  const location = useLocation();

  const isSecret = location.pathname === '/secret';
  const isProjects = location.pathname === '/projects';
  const isPortfolio = location.pathname === '/';
  const isSpecialPage = isSecret || isProjects || isPortfolio;

  return (
    <>
      {isSpecialPage ? (
        <Suspense fallback={<div style={{ background: '#000', width: '100vw', height: '100vh' }} />}>
          <Routes>
            <Route path="/secret" element={<Secret />} />
            <Route path="/projects" element={<ProjectPicker />} />
            <Route path="/" element={<WebsiteTest />} />
          </Routes>
        </Suspense>
      ) : (
        <Suspense fallback={<div style={{ background: '#000', width: '100vw', height: '100vh' }} />}>
          <ClickSpark
            sparkColor='#667eea'
            sparkSize={12}
            sparkRadius={20}
            sparkCount={8}
            duration={500}
          >
            <Routes>
              <Route path="/record" element={<RecordBackground />} />
            </Routes>
          </ClickSpark>
        </Suspense>
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
