import React from 'react';
import { Sun, Moon, Globe, LogOut, FileText, Settings, Plus, Home } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  darkMode: boolean;
  toggleDarkMode: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  onLogout: () => void;
  activePage: string;
  navigate: (path: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children, darkMode, toggleDarkMode, lang, setLang, onLogout, activePage, navigate
}) => {
  const t = TRANSLATIONS[lang];

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
        <div className="relative group">
          <button
            className="w-10 h-10 rounded-full border border-gray-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
          >
            {lang}
          </button>
          {/* Popover */}
          <div className="absolute left-full bottom-0 pl-2 pb-2 w-32 hidden group-hover:block z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
              {Object.values(Language).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`block w-full text-left px-4 py-2 text-xs ${lang === l ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600' : 'text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Settings / Theme */}
        <button
          onClick={toggleDarkMode}
          className="p-3 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>

        <button
          onClick={() => navigate('/settings')}
          className={`p-3 transition-colors ${activePage === 'settings' ? 'bg-brand-50 text-brand-600 dark:bg-slate-800 dark:text-brand-400 font-bold' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          title={t.settings}
        >
          <Settings className="w-6 h-6" />
        </button>

        {/* User / Logout */}
        <div className="relative group">
          <button className="w-10 h-10 rounded-full bg-brand-900 dark:bg-brand-700 flex items-center justify-center text-white text-sm font-medium hover:ring-2 ring-brand-500 transition-all">
            J
          </button>
          {/* Logout Popover */}
          <div className="absolute left-full bottom-0 ml-2 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 hidden group-hover:block p-1">
            <button
              onClick={onLogout}
              className="w-full flex items-center px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t.logout}
            </button>
          </div>
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