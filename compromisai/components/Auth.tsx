import React from 'react';
import { FileText, Sun, Moon, Globe } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface AuthProps {
  onLogin: () => void;
  lang: Language;
  setLang: (l: Language) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, lang, setLang, darkMode, toggleDarkMode }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 transition-colors duration-200 ${darkMode ? 'dark' : ''}`}>
      {/* Top right controls */}
      <div className="absolute top-4 right-4 flex space-x-3">
         <button onClick={toggleDarkMode} className="p-2 text-slate-500 dark:text-slate-400">
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
         </button>
         <button 
           onClick={() => setLang(lang === Language.EN ? Language.NL : lang === Language.NL ? Language.FR : Language.EN)} 
           className="p-2 text-slate-500 dark:text-slate-400 font-bold"
         >
            {lang}
         </button>
      </div>

      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-brand-600 rounded-xl flex items-center justify-center">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-white">
            {t.loginTitle}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {t.loginSubtitle}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
          <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow rounded-2xl border border-gray-100 dark:border-slate-800">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t.email}
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-slate-800 dark:text-white sm:text-sm"
                    defaultValue="demo@compromisai.be"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t.password}
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-slate-800 dark:text-white sm:text-sm"
                    defaultValue="password"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded bg-gray-50 dark:bg-slate-800 dark:border-slate-600"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900 dark:text-slate-300">
                  {t.rememberMe}
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-brand-600 hover:text-brand-500">
                  {t.forgotPassword}
                </a>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
              >
                {t.loginBtn}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};