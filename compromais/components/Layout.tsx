import React, { useState, useEffect } from 'react';
import { Globe, LogOut, FileText, Settings, Plus, Home, Bot, User, Sun } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { api } from '../services/api';
import { SettingsService } from '../services/settingsService';
import { Badge } from './ui/Badge';
import { Avatar } from './ui/Avatar';

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
    window.addEventListener('storage', checkSetting);
    return () => window.removeEventListener('storage', checkSetting);
  }, [activePage]);

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
    const interval = setInterval(checkStatus, 300000);
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

  const navItems = [
    { id: 'dashboard', icon: Home, path: '/dashboard', label: t.dashboard },
    { id: 'templates', icon: FileText, path: '/templates', label: t.templates },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Sidebar — White, icon-only, w-20 */}
      <aside className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-4 z-20 shrink-0">

        {/* Nav Icons */}
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`p-3 rounded-lg transition-all duration-150 ${
              activePage === item.id
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
            title={item.label}
          >
            <item.icon className="w-5 h-5" />
          </button>
        ))}

        {/* Add Button */}
        <button
          onClick={() => navigate('/new')}
          className="w-11 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 transition-all duration-150"
          title={t.newCompromis}
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Spacer */}
        <div className="flex-grow"></div>

        {/* Language Toggle */}
        <div className="relative mb-2" ref={langMenuRef}>
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            title="Language"
          >
            <Badge
              variant="outline"
              className={`cursor-pointer text-[10px] font-bold ${isLangMenuOpen ? 'border-blue-600 text-blue-600 bg-blue-50' : ''}`}
            >
              {lang}
            </Badge>
          </button>
          {/* Popover */}
          {isLangMenuOpen && (
            <div className="absolute left-full bottom-0 pl-2 pb-2 w-32 z-50">
              <div className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
                {Object.values(Language).map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLang(l);
                      setIsLangMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-xs transition-colors ${lang === l ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Status Indicator */}
        {showAiStatus && (
          <div className="relative group flex justify-center w-full mb-2">
            <div className={`w-3 h-3 rounded-full transition-all duration-500 ${aiStatus === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' :
              aiStatus === 'offline' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' :
                'bg-slate-300 animate-pulse'
              }`}></div>

            {/* Tooltip */}
            <div className="absolute left-full bottom-0 ml-4 w-max bg-slate-800 text-white text-xs py-1 px-3 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
              {aiStatus === 'online' ? t.aiConnected :
                aiStatus === 'offline' ? t.aiDisconnected :
                  t.aiChecking}
              <div className="absolute top-1/2 -left-1 -mt-1 w-2 h-2 bg-slate-800 rotate-45"></div>
            </div>
          </div>
        )}

        {/* Settings */}
        <button
          onClick={() => navigate('/settings')}
          className={`p-3 rounded-lg transition-all duration-150 ${activePage === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          title={t.settings}
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* User Avatar / Logout */}
        <div className="relative" ref={userMenuRef}>
          <Avatar
            name={user?.name || 'U'}
            size="default"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            active={isUserMenuOpen}
          />
          {/* Logout Popover */}
          {isUserMenuOpen && (
            <div className="absolute left-full bottom-0 ml-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 p-1 z-50">
              <button
                onClick={() => {
                  navigate('/profile');
                  setIsUserMenuOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md mb-1 transition-colors"
              >
                <User className="w-4 h-4 mr-2" />
                {t.myAccount}
              </button>
              <div className="h-px bg-slate-100 my-1"></div>
              <button
                onClick={() => {
                  onLogout();
                  setIsUserMenuOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t.logout}
              </button>
            </div>
          )}
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative bg-slate-50">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};