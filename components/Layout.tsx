import React from 'react';
import { Sun, Moon, Globe, LogOut, FileText, LayoutDashboard, User } from 'lucide-react';
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
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-brand-600 p-1.5 rounded-lg mr-2">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">CompromisAI</span>
            </div>

            {/* Navigation (Desktop) */}
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => navigate('/')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${activePage === 'dashboard' 
                    ? 'text-brand-600 dark:text-brand-500 bg-brand-50 dark:bg-slate-800' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                {t.dashboard}
              </button>
              <button 
                 onClick={() => navigate('/')} // Mock nav
                 className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${activePage === 'templates' 
                    ? 'text-brand-600 dark:text-brand-500 bg-brand-50 dark:bg-slate-800' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <FileText className="w-4 h-4 mr-2" />
                {t.templates}
              </button>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <div className="relative group">
                <button className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <Globe className="w-5 h-5" />
                </button>
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-slate-700 hidden group-hover:block">
                  {Object.values(Language).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={`block w-full text-left px-4 py-2 text-sm ${lang === l ? 'text-brand-600 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Toggle */}
              <button 
                onClick={toggleDarkMode}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* User Profile / Logout */}
              <div className="flex items-center space-x-2 border-l border-gray-200 dark:border-slate-700 pl-4">
                 <div className="w-8 h-8 rounded-full bg-brand-900 dark:bg-brand-700 flex items-center justify-center text-white text-sm font-medium">
                    J
                 </div>
                 <button onClick={onLogout} className="text-slate-500 hover:text-red-500 dark:hover:text-red-400">
                    <LogOut className="w-5 h-5" />
                 </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};