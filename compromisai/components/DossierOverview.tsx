import React from 'react';
import { ArrowLeft, Calendar, MapPin, FileText, Clock, GitCompare, Archive, ExternalLink, RefreshCw, File, Trash2, X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Language, Dossier, DossierStatus } from '../types';
import { DossierService } from '../services/dossierService';
import { TRANSLATIONS } from '../constants';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { SettingsService } from '../services/settingsService';

interface DossierOverviewProps {
   lang: Language;
   onBack: () => void;
   onOpenEditor: (id: string) => void;
   onCompare: (id: string) => void;
}

export const DossierOverview: React.FC<DossierOverviewProps> = ({ lang, onBack, onOpenEditor, onCompare }) => {
   const t = TRANSLATIONS[lang];
   const { id } = useParams<{ id: string }>();

   // Fetch from storage
   const [dossier, setDossier] = React.useState<Dossier | undefined>(undefined);
   const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
   const [splitScreen, setSplitScreen] = React.useState(false);
   const [selectedDocument, setSelectedDocument] = React.useState<string | null>(null);

   React.useEffect(() => {
      if (!id) return;
      DossierService.init();
      const d = DossierService.getById(id);
      setDossier(d);
   }, [id]);

   const handleArchive = () => {
      if (!dossier) return;
      const newStatus = dossier.status === DossierStatus.ARCHIVED ? DossierStatus.DRAFT : DossierStatus.ARCHIVED;
      const updated = { ...dossier, status: newStatus };

      // Update local state
      setDossier(updated);
      // Persist
      DossierService.update(updated);
   };

   const handleDeleteClick = () => {
      const settings = SettingsService.getSettings();
      if (settings.showDeleteConfirmation) {
         setDeleteModalOpen(true);
      } else {
         performDelete();
      }
   };

   const performDelete = () => {
      if (id) {
         DossierService.delete(id);
         onBack();
      }
   };

   const handleConfirmDelete = (dontShowAgain: boolean) => {
      if (dontShowAgain) {
         SettingsService.updateSettings({ showDeleteConfirmation: false });
      }
      performDelete();
      setDeleteModalOpen(false);
   };

   const openDocument = (docName: string) => {
      setSelectedDocument(docName);
      setSplitScreen(true);
   };

   if (!dossier) return <div>Loading...</div>;

   return (
      <div className="max-w-7xl mx-auto animate-in fade-in duration-500 relative min-h-[calc(100vh-8rem)]">
         <DeleteConfirmationModal
            lang={lang}
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
         />

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
               <button onClick={() => onCompare(dossier.id)} className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                  <GitCompare className="w-4 h-4 mr-2" />
                  {t.compare}
               </button>
               <button onClick={handleArchive} className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                  {dossier.status === 'archived' ? <RefreshCw className="w-4 h-4 mr-2" /> : <Archive className="w-4 h-4 mr-2" />}
                  {dossier.status === 'archived' ? t.unarchiveDossier : t.archiveDossier}
               </button>
               <button onClick={handleDeleteClick} className="p-2 bg-white dark:bg-slate-800 border border-red-100 dark:border-red-900/30 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm" title={t.deleteDossier}>
                  <Trash2 className="w-5 h-5" />
               </button>
            </div>
         </div>

         <div className="flex gap-8 relative">
            {/* Main Content: Timeline & Actions */}
            <div className={`transition-all duration-300 ${splitScreen ? 'w-1/2' : 'w-full'} space-y-8`}>

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
                        <div
                           key={i}
                           onClick={() => openDocument(doc)}
                           className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer group
                              ${selectedDocument === doc && splitScreen
                                 ? 'bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-800'
                                 : 'bg-gray-50 dark:bg-slate-800/50 border-transparent hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                        >
                           <div className="flex items-center overflow-hidden">
                              <File className={`w-4 h-4 mr-3 flex-shrink-0 ${selectedDocument === doc && splitScreen ? 'text-brand-600' : 'text-brand-500'}`} />
                              <span className={`text-sm truncate ${selectedDocument === doc && splitScreen ? 'text-brand-700 dark:text-brand-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>{doc}</span>
                           </div>
                           <ExternalLink className={`w-4 h-4 transition-opacity ${selectedDocument === doc && splitScreen ? 'opacity-100 text-brand-500' : 'opacity-0 group-hover:opacity-100 text-slate-400'}`} />
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Split Screen Source Viewer (adapted from Editor) */}
            {splitScreen && (
               <div className="w-1/2 border-l border-gray-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex flex-col animate-in slide-in-from-right duration-300 shadow-xl ml-4 rounded-2xl overflow-hidden sticky top-0 h-[calc(100vh-10rem)]">
                  <div className="h-12 flex items-center justify-between px-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shrink-0">
                     <div className="flex items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center mr-3">
                           <FileText className="w-3 h-3 mr-2" /> {selectedDocument}
                        </span>
                        <button
                           onClick={() => window.open('#', '_blank')}
                           className="p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors"
                           title="Open in browser"
                        >
                           <ExternalLink className="w-3 h-3" />
                        </button>
                     </div>
                     <button onClick={() => setSplitScreen(false)} className="text-slate-400 hover:text-slate-900 hover:bg-gray-100 rounded p-1">
                        <X className="w-4 h-4" />
                     </button>
                  </div>
                  <div className="flex-1 p-6 overflow-hidden bg-slate-100 dark:bg-slate-950">
                     <div className="w-full h-full bg-white shadow-lg flex flex-col items-center justify-center text-slate-300 border border-gray-200 overflow-hidden relative group">
                        {/* Fake PDF Lines */}
                        <div className="absolute inset-0 p-8 space-y-4 opacity-50 pointer-events-none">
                           {[...Array(20)].map((_, i) => (
                              <div key={i} className="h-2 bg-slate-200 rounded w-full" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
                           ))}
                        </div>

                        <span className="relative z-10 font-medium text-slate-400 bg-white/80 px-4 py-2 rounded-lg backdrop-blur-sm">[ {selectedDocument} Preview ]</span>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};
