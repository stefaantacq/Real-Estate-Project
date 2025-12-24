import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './Layout';
import { Auth } from './Auth';
import { Dashboard } from './Dashboard';
import { NewCompromise } from './NewCompromise';
import { Editor } from './Editor';
import { DossierOverview } from './DossierOverview';
import { TemplatesPage } from './TemplatesPage';
import { SettingsPage } from './SettingsPage';
import { Language } from '../types';

import { Compare } from './Compare';
import { api } from '../services/api';

const MainApp: React.FC = () => {
  // State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Default to Dark as per screens
  const [language, setLanguage] = useState<Language>(Language.NL);

  const navigate = useNavigate();
  const location = useLocation();

  // Dark Mode Side Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Authentication Mock
  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/');
  };

  // Page Routing Logic
  const activePage = location.pathname.includes('templates') ? 'templates' :
    location.pathname.includes('settings') ? 'settings' : 'dashboard';

  if (!isAuthenticated) {
    return (
      <Auth
        onLogin={handleLogin}
        lang={language}
        setLang={setLanguage}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
    );
  }

  return (
    <Layout
      darkMode={darkMode}
      toggleDarkMode={toggleDarkMode}
      lang={language}
      setLang={setLanguage}
      onLogout={handleLogout}
      activePage={activePage}
      navigate={navigate}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route
          path="/dashboard"
          element={
            <Dashboard
              lang={language}
              onNewDossier={() => navigate('/new')}
              onOpenDossier={(id) => navigate(`/dossier/${id}`)}
            />
          }
        />
        <Route
          path="/templates"
          element={
            <TemplatesPage
              lang={language}
            />
          }
        />
        <Route
          path="/new"
          element={
            <NewCompromise
              lang={language}
              onCancel={() => navigate('/dashboard')}
              onComplete={(id) => navigate(`/dossier/${id}`)}
            />
          }
        />
        <Route
          path="/dossier/:id"
          element={
            <DossierOverview
              lang={language}
              onBack={() => navigate('/dashboard')}
              onOpenEditor={(id) => navigate(`/editor/${id}`)}
              onCompare={(id) => navigate(`/compare/${id}`)}
            />
          }
        />
        <Route
          path="/editor/:id"
          element={
            <Editor
              lang={language}
              onBack={() => navigate(-1)}
            />
          }
        />
        <Route
          path="/compare/:id"
          element={
            <Compare
              lang={language}
              onBack={() => navigate(-1)}
            />
          }
        />
        <Route
          path="/settings"
          element={
            <SettingsPage
              lang={language}
              onBack={() => navigate(-1)}
            />
          }
        />
      </Routes>
    </Layout>
  );
};

// Main Entry wrapping with Router
const App: React.FC = () => {
  return (
    <Router>
      <MainApp />
    </Router>
  );
};

export default App;
