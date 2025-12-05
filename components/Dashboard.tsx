import React, { useState } from 'react';
import { Plus, Search, Clock, CheckCircle, FileText } from 'lucide-react';
import { Language, Dossier, DossierStatus } from '../types';
import { TRANSLATIONS, MOCK_DOSSIERS } from '../constants';

interface DashboardProps {
  lang: Language;
  onNewDossier: () => void;
  onOpenDossier: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ lang, onNewDossier, onOpenDossier }) => {
  const t = TRANSLATIONS[lang];
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDossiers = MOCK_DOSSIERS.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: DossierStatus) => {
    switch(status) {
      case DossierStatus.COMPLETED: return <CheckCircle className="w-5 h-5 text-green-500" />;
      case DossierStatus.DRAFT: return <Clock className="w-5 h-5 text-yellow-500" />;
      default: return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t.newCompromis}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">{t.newCompromisDesc}</p>
        </div>
        <button 
          onClick={onNewDossier}
          className="inline-flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t.newCompromis}
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create New Card (Large) */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-8 h-full flex flex-col justify-center items-center text-center cursor-pointer hover:border-brand-500 dark:hover:border-brand-500 transition-all group" onClick={onNewDossier}>
             <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <Plus className="w-8 h-8 text-brand-600 dark:text-brand-400" />
             </div>
             <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{t.newCompromis}</h3>
             <p className="text-slate-500 dark:text-slate-400 max-w-sm">{t.newCompromisDesc}</p>
          </div>
        </div>

        {/* Recent List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.recentCompromises}</h2>
              <button className="text-xs text-brand-600 hover:text-brand-500 font-medium">{t.viewAll}</button>
            </div>
            
            {/* Search */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide">
              {filteredDossiers.map(dossier => (
                <div 
                  key={dossier.id} 
                  onClick={() => onOpenDossier(dossier.id)}
                  className="p-4 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">{dossier.name}</h3>
                    {getStatusIcon(dossier.status)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <p>{dossier.date}</p>
                    <p className="flex items-center">
                      <FileText className="w-3 h-3 mr-1" />
                      {dossier.documentCount} documenten
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};