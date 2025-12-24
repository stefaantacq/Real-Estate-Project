import React from 'react';
import { ArrowLeft, Calendar, MapPin, FileText, Clock, GitCompare, Archive, ExternalLink, RefreshCw, File, Trash2, X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Language, Dossier, DossierStatus } from '../types';
import { TRANSLATIONS } from '../constants';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { SettingsService } from '../services/settingsService';
import { api } from '../services/api';

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

   // Editing states
   const [isEditingName, setIsEditingName] = React.useState(false);
   const [isEditingAddress, setIsEditingAddress] = React.useState(false);
   const [tempName, setTempName] = React.useState('');
   const [tempAddress, setTempAddress] = React.useState('');

   React.useEffect(() => {
      const fetchDossier = async () => {
         if (!id) return;
         try {
            const data: any = await api.getDossierById(id);
            // Map single DB result to Frontend Dossier Type
            const mappedDossier: Dossier = {
               id: data.dossier_id.toString(),
               name: data.titel,
               address: data.adres,
               date: new Date(data.datum_aanmaak).toLocaleDateString('nl-BE'),
               creationDate: new Date(data.datum_aanmaak).toLocaleDateString('nl-BE'),
               status: DossierStatus.DRAFT, // Default for now
               documentCount: 0, // Mock
               type: 'House', // Mock
               timeline: [], // Mock
               sections: [] // We'll fetch these later when doing the editor
            };
            setDossier(mappedDossier);
         } catch (error) {
            console.error("Failed to fetch dossier", error);
         }
      };

      fetchDossier();
   }, [id]);

   const handleArchive = () => {
      if (!dossier) return;
      // TODO: API Call for update status
      alert("Status update via API nog te implementeren");
      /*
      const newStatus = dossier.status === DossierStatus.ARCHIVED ? DossierStatus.DRAFT : DossierStatus.ARCHIVED;
      const updated = { ...dossier, status: newStatus };
      setDossier(updated);
      */
   };

   const handleDeleteClick = () => {
      const settings = SettingsService.getSettings();
      if (settings.showDeleteConfirmation) {
         setDeleteModalOpen(true);
      } else {
         performDelete();
      }
   };

   const performDelete = async () => {
      if (id) {
         try {
            await api.deleteDossier(id);
            onBack();
         } catch (error) {
            console.error("Failed to delete", error);
            alert("Kon dossier niet verwijderen.");
         }
      }
   };

   const handleConfirmDelete = (dontShowAgain: boolean) => {
      if (dontShowAgain) {
         SettingsService.updateSettings({ showDeleteConfirmation: false });
      }
      performDelete();
      setDeleteModalOpen(false);
   };

   const toggleEditName = () => {
      // Mock implementation for UI stability, needs API Update endpoint
      if (!dossier) return;
      if (isEditingName) {
         const updated = { ...dossier, name: tempName };
         setDossier(updated);
      } else {
         setTempName(dossier.name);
      }
      setIsEditingName(!isEditingName);
   };

   const toggleEditAddress = () => {
      // Mock implementation for UI stability, needs API Update endpoint
      if (!dossier) return;
      if (isEditingAddress) {
         const updated = { ...dossier, address: tempAddress };
         setDossier(updated);
      } else {
         setTempAddress(dossier.address);
      }
      setIsEditingAddress(!isEditingAddress);
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
            <div className="flex items-center flex-1">
               <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 mr-4">
                  <ArrowLeft className="w-6 h-6" />
               </button>
               <div className="flex-1">
                  {isEditingName ? (
                     <div className="flex items-center gap-2">
                        <input
                           autoFocus
                           type="text"
                           value={tempName}
                           onChange={(e) => setTempName(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && toggleEditName()}
                           onBlur={toggleEditName}
                           className="text-3xl font-bold bg-white dark:bg-slate-800 border-2 border-brand-500 rounded-lg px-2 py-1 outline-none text-slate-900 dark:text-white w-full max-w-lg"
                        />
                     </div>
                  ) : (
                     <h1
                        className="text-3xl font-bold text-slate-900 dark:text-white cursor-pointer hover:text-brand-600 transition-colors"
                        onClick={toggleEditName}
                     >
                        {dossier.name}
                     </h1>
                  )}

                  <div className="flex items-center mt-1 text-slate-500 text-sm">
                     <MapPin className="w-4 h-4 mr-1" />
                     {isEditingAddress ? (
                        <input
                           autoFocus
                           type="text"
                           value={tempAddress}
                           onChange={(e) => setTempAddress(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && toggleEditAddress()}
                           onBlur={toggleEditAddress}
                           className="bg-white dark:bg-slate-800 border-2 border-brand-500 rounded px-1 outline-none text-slate-900 dark:text-white w-full max-w-md"
                        />
                     ) : (
                        <span
                           className="cursor-pointer hover:text-brand-600 transition-colors"
                           onClick={toggleEditAddress}
                        >
                           {dossier.address}
                        </span>
                     )}
                  </div>
               </div>
            </div>

            <div className="flex space-x-3 shrink-0">
               <button onClick={() => onCompare(dossier.id)} className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                  <GitCompare className="w-4 h-4 mr-2" />
                  {t.compare}
               </button>
               <button onClick={handleArchive} className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                  {dossier.status === DossierStatus.ARCHIVED ? <RefreshCw className="w-4 h-4 mr-2" /> : <Archive className="w-4 h-4 mr-2" />}
                  {dossier.status === DossierStatus.ARCHIVED ? t.unarchiveDossier : t.archiveDossier}
               </button>
               <button onClick={handleDeleteClick} className="p-2 bg-white dark:bg-slate-800 border border-red-100 dark:border-red-900/30 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm" title={t.deleteDossier}>
                  <Trash2 className="w-5 h-5" />
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
                     {dossier.timeline.length > 0 ? dossier.timeline.map((event) => (
                        <div key={event.id} className="relative pl-8">
                           <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand-500 border-4 border-white dark:border-slate-900"></div>
                           <div>
                              <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 mb-1 block">{event.date}</span>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{event.title}</h4>
                              <p className="text-sm text-slate-500 mt-1">{event.description} <span className="text-slate-300 mx-1">•</span> {event.user}</p>
                           </div>
                        </div>
                     )) : (
                        <div className="pl-8 text-slate-500 text-sm">Nog geen activiteiten.</div>
                     )}
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
         </div>

         {/* Premium Side Drawer Viewer */}
         <div className={`fixed inset-y-0 right-0 w-[45%] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-l border-gray-200 dark:border-slate-800 shadow-2xl z-[100] transform transition-transform duration-500 ease-in-out flex flex-col ${splitScreen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="h-16 flex items-center justify-between px-6 bg-white/50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-800 shrink-0">
               <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/50 flex items-center justify-center mr-3">
                     <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                     <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block leading-none mb-1">Document Preview</span>
                     <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedDocument}</span>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <button
                     onClick={() => window.open('#', '_blank')}
                     className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                     title="Open in browser"
                  >
                     <ExternalLink className="w-5 h-5" />
                  </button>
                  <button
                     onClick={() => setSplitScreen(false)}
                     className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  >
                     <X className="w-6 h-6" />
                  </button>
               </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50">
               <div className="max-w-2xl mx-auto w-full aspect-[1/1.414] bg-white dark:bg-slate-900 shadow-2xl border border-gray-200 dark:border-slate-800 rounded-sm overflow-hidden relative p-12 group">
                  {/* More Realistic PDF Simulation */}
                  <div className="space-y-6">
                     <div className="h-4 bg-brand-600/20 rounded w-1/3 mb-10"></div>
                     <div className="space-y-4">
                        {[...Array(12)].map((_, i) => (
                           <div key={i} className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-full" style={{ width: `${Math.random() * 30 + 70}%` }}></div>
                        ))}
                     </div>
                     <div className="grid grid-cols-2 gap-8 py-8">
                        <div className="h-32 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700"></div>
                        <div className="h-32 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700"></div>
                     </div>
                     <div className="space-y-4">
                        {[...Array(8)].map((_, i) => (
                           <div key={i} className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-full" style={{ width: `${Math.random() * 30 + 70}%` }}></div>
                        ))}
                     </div>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 dark:bg-slate-900/20 backdrop-blur-[2px]">
                     <span className="bg-white dark:bg-slate-800 px-6 py-3 rounded-xl shadow-2xl font-bold text-slate-900 dark:text-white border border-gray-200 dark:border-slate-700">
                        [ {selectedDocument} Full Preview ]
                     </span>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};
