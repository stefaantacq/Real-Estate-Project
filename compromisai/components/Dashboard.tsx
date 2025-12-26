import React, { useState } from 'react';
import { Search, Clock, CheckCircle, FileText, Archive, ChevronRight, MapPin } from 'lucide-react';
import { Language, Dossier, DossierStatus } from '../types';
import { TRANSLATIONS } from '../constants';
import { api } from '../services/api';

interface DashboardProps {
  lang: Language;
  onNewDossier: () => void;
  onOpenDossier: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ lang, onNewDossier, onOpenDossier }) => {
  const t = TRANSLATIONS[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [dossiers, setDossiers] = useState<Dossier[]>([]);

  // Load dossiers from API
  React.useEffect(() => {
    const fetchDossiers = async () => {
      try {
        const data = await api.getDossiers();
        const mappedDossiers = data.map((d: any) => ({
          id: d.id, // API already returns 'id' as 'ui_id'
          name: d.name,
          address: d.address,
          date: new Date(d.date).toLocaleDateString('nl-BE'),
          status: d.status as DossierStatus,
          type: d.type
        }));
        setDossiers(mappedDossiers);
      } catch (err) {
        console.error("Failed to load dossiers", err);
      }
    };
    fetchDossiers();
  }, []);

  const activeDossiers = dossiers.filter(d =>
    d.status !== DossierStatus.ARCHIVED &&
    (d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const archivedDossiers = dossiers.filter(d =>
    d.status === DossierStatus.ARCHIVED &&
    (d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderCard = (dossier: Dossier) => (
    <div
      key={dossier.id}
      onClick={() => onOpenDossier(dossier.id)}
      className="flex flex-col bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-500 hover:shadow-lg transition-all cursor-pointer group min-w-[280px]"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
          <FileText className="w-5 h-5" />
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${dossier.status === DossierStatus.COMPLETED ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
          {dossier.status === DossierStatus.ARCHIVED ? t.archived : dossier.status === DossierStatus.COMPLETED ? t.completed : t.draft}
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate mb-1">{dossier.name}</h3>
      <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-4 truncate">
        <MapPin className="w-3 h-3 mr-1" />
        {dossier.address}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {dossier.date}</span>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500">

      {/* Header Area */}
      <div className="flex items-center justify-between">
        {/* Invisible title for screen readers or empty space if needed */}
        <div></div>

        {/* Top Right Search */}
        <div className="relative w-64 md:w-80">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-full pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none shadow-sm"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Section 1: Active / Incomplete */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 pl-1">{t.incomplete}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeDossiers.length > 0 ? activeDossiers.map(renderCard) : (
            <div className="col-span-full py-8 text-center text-slate-400 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
              {t.noActiveDossiers}
            </div>
          )}

          {/* Quick Add Card Placeholder */}
          <div
            onClick={onNewDossier}
            className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-500 hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-all cursor-pointer min-h-[180px] group"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/30 flex items-center justify-center text-slate-400 group-hover:text-brand-600 transition-colors mb-3">
              <span className="text-2xl font-light">+</span>
            </div>
            <span className="text-sm font-medium text-slate-500 group-hover:text-brand-600 transition-colors">{t.newCompromis}</span>
          </div>
        </div>
      </div>

      {/* Section 2: Archive */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 pl-1 flex items-center">
          {t.archive}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {archivedDossiers.length > 0 ? archivedDossiers.map(renderCard) : (
            <div className="col-span-full py-8 text-center text-slate-400 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
              {t.noArchivedDossiers}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};