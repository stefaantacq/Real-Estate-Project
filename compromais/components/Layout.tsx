import React, { useState, useEffect } from 'react';
import { Sun, Moon, Globe, LogOut, FileText, Settings, Plus, Home, Bot, User } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { api } from '../services/api';
import { SettingsService } from '../services/settingsService';

interface LayoutProps {
  children: React.ReactNode;
  darkMode: boolean;
  toggleDarkMode: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  onLogout: () => void;
  activePage: string;
  navigate: (path: string) => void;
  user?: { id: number; name: string; email: string } | null;
}

export const Layout: React.FC<LayoutProps> = ({
  children, darkMode, toggleDarkMode, lang, setLang, onLogout, activePage, navigate, user
}) => {
  const t = TRANSLATIONS[lang];
  const [showAiStatus, setShowAiStatus] = useState(false);
  const [aiStatus, setAiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Check visibility setting on mount and listen for changes
  useEffect(() => {
    const checkSetting = () => {
      const settings = SettingsService.getSettings();
      setShowAiStatus(!!settings.showAiStatus);
    };

    checkSetting();
    // In a real app we'd subscribe to an event, but for now we rely on mount/update logic or simple local storage read
    window.addEventListener('storage', checkSetting);
    return () => window.removeEventListener('storage', checkSetting);
  }, [activePage]); // Re-check when navigating

  // Poll AI status if enabled
  useEffect(() => {
    if (!showAiStatus) return;

    const checkStatus = async () => {
      setAiStatus('checking');
      try {
        const res = await api.checkAiStatus();
        setAiStatus(res.status === 'online' ? 'online' : 'offline');
      } catch (e) {
        setAiStatus('offline');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 300000); // Check every 5 mins
    return () => clearInterval(interval);
  }, [showAiStatus]);

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const langMenuRef = React.useRef<HTMLDivElement>(null);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-200 overflow-hidden ${darkMode ? 'dark' : ''}`}>

      {/* Sidebar - "Fat Marker" Style */}
      <aside className="w-20 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col items-center py-6 gap-6 z-20 shrink-0">

        {/* Logo / Home */}
        <button
          onClick={() => navigate('/dashboard')}
          className={`p-3 rounded-xl transition-colors ${activePage === 'dashboard' ? 'bg-brand-50 text-brand-600 dark:bg-slate-800 dark:text-brand-400' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          title={t.dashboard}
        >
          <Home className="w-6 h-6" />
        </button>

        <button
          onClick={() => navigate('/templates')}
          className={`p-3 rounded-xl transition-colors ${activePage === 'templates' ? 'bg-brand-50 text-brand-600 dark:bg-slate-800 dark:text-brand-400' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          title={t.templates}
        >
          <FileText className="w-6 h-6" />
        </button>

        {/* BIG Add Button */}
        <button
          onClick={() => navigate('/new')}
          className="w-12 h-12 bg-brand-600 hover:bg-brand-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          title={t.newCompromis}
        >
          <Plus className="w-7 h-7" />
        </button>

        {/* Spacer */}
        <div className="flex-grow"></div>

        {/* Language Toggle */}
        <div className="relative mb-3" ref={langMenuRef}>
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className={`w-10 h-10 rounded-full border flex items-center justify-center text-xs font-bold transition-all ${isLangMenuOpen ? 'bg-brand-50 border-brand-500 text-brand-600 dark:bg-brand-900/20' : 'border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
          >
            {lang}
          </button>
          {/* Popover */}
          {isLangMenuOpen && (
            <div className="absolute left-full bottom-0 pl-2 pb-2 w-32 z-50 animate-in slide-in-from-left-2 duration-200">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                {Object.values(Language).map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLang(l);
                      setIsLangMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-xs ${lang === l ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600' : 'text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>


        {/* AI Status Indicator - Simplified */}
        {showAiStatus && (
          <div className="relative group flex justify-center w-full mb-3">
            <div className={`w-3 h-3 rounded-full transition-all duration-500 ${aiStatus === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' :
              aiStatus === 'offline' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' :
                'bg-slate-300 animate-pulse'
              }`}></div>

            {/* Tooltip */}
            <div className="absolute left-full bottom-0 ml-4 w-max bg-slate-900 text-white text-xs py-1 px-3 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
              {aiStatus === 'online' ? t.aiConnected :
                aiStatus === 'offline' ? t.aiDisconnected :
                  t.aiChecking}
              {/* Tiny arrow */}
              <div className="absolute top-1/2 -left-1 -mt-1 w-2 h-2 bg-slate-900 rotate-45"></div>
            </div>
          </div>
        )}

        {/* Settings / Theme */}
        <button
          onClick={toggleDarkMode}
          className="p-3 rounded-xl text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          title={t.themeToggle}
        >
          {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>

        <button
          onClick={() => navigate('/settings')}
          className={`p-3 rounded-xl transition-colors ${activePage === 'settings' ? 'bg-brand-50 text-brand-600 dark:bg-slate-800 dark:text-brand-400 font-bold' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          title={t.settings}
        >
          <Settings className="w-6 h-6" />
        </button>

        {/* User / Logout */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium transition-all ${isUserMenuOpen ? 'ring-2 ring-brand-500 bg-brand-600' : 'bg-brand-900 dark:bg-brand-700 hover:bg-brand-800'}`}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </button>
          {/* Logout Popover */}
          {isUserMenuOpen && (
            <div className="absolute left-full bottom-0 ml-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-1 z-50 animate-in slide-in-from-left-2 duration-200">
              <button
                onClick={() => {
                  navigate('/profile');
                  setIsUserMenuOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-md mb-1"
              >
                <User className="w-4 h-4 mr-2" />
                {t.myAccount}
              </button>
              <div className="h-px bg-gray-100 dark:bg-slate-700 my-1"></div>
              <button
                onClick={() => {
                  onLogout();
                  setIsUserMenuOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t.logout}
              </button>
            </div>
          )}
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};