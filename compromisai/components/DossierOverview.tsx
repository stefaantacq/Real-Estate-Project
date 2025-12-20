import React from 'react';
import { ArrowLeft, Calendar, MapPin, FileText, Clock, GitCompare, Archive, ExternalLink, RefreshCw, File } from 'lucide-react';
import { Language, Dossier } from '../types';
import { TRANSLATIONS, MOCK_DOSSIERS } from '../constants';

interface DossierOverviewProps {
  lang: Language;
  onBack: () => void;
  onOpenEditor: (id: string) => void;
}

export const DossierOverview: React.FC<DossierOverviewProps> = ({ lang, onBack, onOpenEditor }) => {
  const t = TRANSLATIONS[lang];
  // Mock fetching dossier by ID (using the first mock one for now)
  const dossier: Dossier = MOCK_DOSSIERS[0]; 

  const handleCompare = () => {
    alert('Opening comparison view... (Mock)');
  };

  const handleArchive = () => {
    alert(dossier.status === 'archived' ? 'Dossier unarchived!' : 'Dossier archived!');
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      
      {/* Header / Nav */}
      <div className="mb-8 flex items-center justify-between">
         <div className="flex items-center">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 mr-4">
               <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
               <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{dossier.name}</h1>
               <div className="flex items-center mt-1 text-slate-500 text-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  {dossier.address}
               </div>
            </div>
         </div>
         
         <div className="flex space-x-3">
             <button onClick={handleCompare} className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                <GitCompare className="w-4 h-4 mr-2" />
                {t.compare}
             </button>
             <button onClick={handleArchive} className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                {dossier.status === 'archived' ? <RefreshCw className="w-4 h-4 mr-2" /> : <Archive className="w-4 h-4 mr-2" />}
                {dossier.status === 'archived' ? t.unarchiveDossier : t.archiveDossier}
             </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Main Content: Timeline & Actions */}
         <div className="lg:col-span-2 space-y-8">
            
            {/* Action Card */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
               <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/50 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-brand-600 dark:text-brand-400" />
               </div>
               <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Huidige Versie: Draft 1.2</h2>
               <p className="text-slate-500 max-w-md mb-6">Laatst bewerkt op {dossier.date}. Alle documenten zijn geclassificeerd.</p>
               <button 
                 onClick={() => onOpenEditor(dossier.id)}
                 className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center"
               >
                 {t.openEdit}
                 <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
               </button>
            </div>

            {/* Timeline */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800">
               <h3 className="font-bold text-lg mb-6 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-slate-400" />
                  {t.timeline}
               </h3>
               
               <div className="relative border-l-2 border-gray-100 dark:border-slate-800 ml-3 space-y-8">
                  {dossier.timeline.map((event, i) => (
                      <div key={event.id} className="relative pl-8">
                         <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand-500 border-4 border-white dark:border-slate-900"></div>
                         <div>
                            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 mb-1 block">{event.date}</span>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{event.title}</h4>
                            <p className="text-sm text-slate-500 mt-1">{event.description} <span className="text-slate-300 mx-1">•</span> {event.user}</p>
                         </div>
                      </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Sidebar: Metadata & Source Docs */}
         <div className="space-y-6">
             <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-4">Details</h3>
                <div className="space-y-4">
                   <div>
                      <label className="text-xs text-slate-400 block mb-1">Creatie datum</label>
                      <div className="flex items-center text-sm font-medium text-slate-900 dark:text-white">
                         <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                         {dossier.creationDate}
                      </div>
                   </div>
                   <div>
                      <label className="text-xs text-slate-400 block mb-1">Status</label>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {dossier.status}
                      </span>
                   </div>
                </div>
             </div>

             <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-4">{t.documents}</h3>
                <div className="space-y-3">
                   {['EPC.pdf', 'Kadaster.pdf', 'Identiteitskaart.pdf'].map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                          <div className="flex items-center overflow-hidden">
                             <File className="w-4 h-4 text-brand-500 mr-3 flex-shrink-0" />
                             <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{doc}</span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                   ))}
                </div>
             </div>
         </div>

      </div>
    </div>
  );
};
