
import React, { useState } from 'react';
import { Mail, Lock, User, CreditCard, CheckCircle, ArrowRight, Building2, Sun, Moon } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface AuthProps {
  onLogin: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

type AuthParams = 'login' | 'register' | 'payment';

export const Auth: React.FC<AuthProps> = ({ onLogin, lang, setLang, darkMode, toggleDarkMode }) => {
  const t = TRANSLATIONS[lang];
  const [view, setView] = useState<AuthParams>('login');
  const [isLoading, setIsLoading] = useState(false);

  // Registration State
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    password: '',
    cibId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      if (view === 'login') {
        onLogin();
      } else if (view === 'register') {
        setView('payment');
      } else if (view === 'payment') {
        onLogin();
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">

      {/* Lang & Theme Toggles */}
      <div className="absolute top-6 right-6 flex items-center space-x-4">
        <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400">
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <div className="flex bg-white dark:bg-slate-900 rounded-lg p-1 border border-gray-200 dark:border-slate-800">
          {(['NL', 'FR', 'EN'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${lang === l
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-2xl mb-4 shadow-lg shadow-brand-600/20">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">compromAIs</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {view === 'login' && 'Welkom terug! Log in op uw account.'}
            {view === 'register' && 'Maak een nieuw account aan als makelaar.'}
            {view === 'payment' && 'Verifieer uw licentie status.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden relative">

          {/* Progress Bar (Mock) */}
          {view !== 'login' && (
            <div className="h-1 bg-gray-100 dark:bg-slate-800 w-full">
              <div
                className="h-full bg-brand-500 transition-all duration-500"
                style={{ width: view === 'register' ? '50%' : '100%' }}
              ></div>
            </div>
          )}

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              {view === 'login' && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        required
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
                        placeholder="naam@kantoor.be"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Wachtwoord</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="password"
                        required
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-full py-2 border border-gray-200 dark:border-slate-700 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors dark:text-white"
                  >
                    <span className="font-bold text-[#E1306C]">CIB</span> Log in met CIB
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('register')}
                    className="w-full py-2 text-brand-600 hover:text-brand-700 text-sm font-medium"
                  >
                    Nog geen account? Registreer hier
                  </button>
                </>
              )}

              {view === 'register' && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Volledige Naam</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        required
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
                        placeholder="Jan Janssens"
                        value={regData.name}
                        onChange={e => setRegData({ ...regData, name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">CIB Nummer</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 flex items-center justify-center font-bold text-xs border rounded w-5 h-5">#</div>
                      <input
                        type="text"
                        required
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
                        placeholder="1234567"
                        value={regData.cibId}
                        onChange={e => setRegData({ ...regData, cibId: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        required
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
                        placeholder="naam@kantoor.be"
                        value={regData.email}
                        onChange={e => setRegData({ ...regData, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Wachtwoord</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="password"
                        required
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
                        placeholder="••••••••"
                        value={regData.password}
                        onChange={e => setRegData({ ...regData, password: e.target.value })}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="w-full py-1 text-slate-400 hover:text-slate-600 text-sm"
                  >
                    Terug naar Login
                  </button>
                </>
              )}

              {view === 'payment' && (
                <div className="text-center py-4">
                  <div className="mb-6 flex justify-center">
                    <CreditCard className="w-12 h-12 text-brand-600 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Licentie Activering</h3>
                  <p className="text-sm text-slate-500 mb-6">Om uw account te activeren is een betaling vereist. Dit is een simulatie.</p>

                  <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl mb-6 text-left border border-gray-100 dark:border-slate-700">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-500">Premium Licentie</span>
                      <span className="font-bold dark:text-white">€49.00 / mnd</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 dark:border-slate-700 pt-2 mt-2">
                      <span className="font-bold text-slate-900 dark:text-white">Totaal</span>
                      <span className="font-bold text-brand-600">€49.00</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {view === 'login' && 'Log in'}
                    {view === 'register' && 'Ga naar betaling'}
                    {view === 'payment' && 'Bevestig & Activeer'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center mt-8 text-sm text-slate-400">
          &copy; {new Date().getFullYear()} compromAIs. All rights reserved.
        </p>
      </div>
    </div>
  );
};