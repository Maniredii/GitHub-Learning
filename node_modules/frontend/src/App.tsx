import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { skipToMainContent } from './utils/keyboardNavigation';
import './App.css';

// Lazy load page components for code splitting
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const QuestsPage = lazy(() => import('./pages/QuestsPage').then(module => ({ default: module.QuestsPage })));
const ChapterDetailPage = lazy(() => import('./pages/ChapterDetailPage').then(module => ({ default: module.ChapterDetailPage })));

// Loading component
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontSize: '1.2rem',
    color: '#6366f1'
  }}>
    Loading...
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Skip to main content link for keyboard users */}
        <a
          href="#main-content"
          className="skip-to-main"
          onClick={(e) => {
            e.preventDefault();
            skipToMainContent();
          }}
        >
          Skip to main content
        </a>

        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public routes - no login required */}
            <Route path="/quests" element={<QuestsPage />} />
            <Route path="/chapter/:chapterId" element={<ChapterDetailPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Default route - go directly to quests */}
            <Route path="/" element={<Navigate to="/quests" replace />} />
            <Route path="*" element={<Navigate to="/quests" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
