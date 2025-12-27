import React from 'react';
import { ArrowLeft, Calendar, MapPin, FileText, Clock, GitCompare, Archive, ExternalLink, RefreshCw, File, Trash2, X, Home, Building2, Edit2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Language, Dossier, DossierStatus } from '../types';
import { TRANSLATIONS } from '../constants';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { SettingsService } from '../services/settingsService';
import { ExpandableText } from './ExpandableText';
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
   const [deleteModalType, setDeleteModalType] = React.useState<'dossier' | 'version' | 'agreement'>('dossier');
   const [versionToDelete, setVersionToDelete] = React.useState<string | null>(null);
   const [agreementToDelete, setAgreementToDelete] = React.useState<string | null>(null);
   const [versionToRename, setVersionToRename] = React.useState<string | null>(null);
   const [newName, setNewName] = React.useState('');
   const [isRenameModalOpen, setIsRenameModalOpen] = React.useState(false);
   const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number; versionId: string; agreementId: string } | null>(null);
   const [splitScreen, setSplitScreen] = React.useState(false);
   const [selectedDocument, setSelectedDocument] = React.useState<{ name: string, path?: string } | null>(null);

   // Editing states
   const [isEditingName, setIsEditingName] = React.useState(false);
   const [isEditingAddress, setIsEditingAddress] = React.useState(false);
   const [tempName, setTempName] = React.useState('');
   const [tempAddress, setTempAddress] = React.useState('');
   const [isScanning, setIsScanning] = React.useState(false);
   const [scanProgress, setScanProgress] = React.useState(0);

   // Templates state for "Add Agreement"
   const [templates, setTemplates] = React.useState<any[]>([]);
   const [isTemplateModalOpen, setIsTemplateModalOpen] = React.useState(false);
   const [isCreatingAgreement, setIsCreatingAgreement] = React.useState(false);

   // Version states
   const [isAddVersionModalOpen, setIsAddVersionModalOpen] = React.useState(false);
   const [activeAgreementId, setActiveAgreementId] = React.useState<string | null>(null);
   const [isCreatingVersion, setIsCreatingVersion] = React.useState(false);
   const fileInputRef = React.useRef<HTMLInputElement>(null);

   React.useEffect(() => {
      const fetchDossier = async () => {
         if (!id) return;
         try {
            const data: any = await api.getDossierById(id);
            setDossier(data as Dossier);
         } catch (error) {
            console.error("Failed to fetch dossier", error);
         }
      };

      const fetchTemplates = async () => {
         try {
            const data = await api.getTemplates();
            setTemplates(data);
         } catch (error) {
            console.error("Failed to fetch templates", error);
         }
      };

      fetchDossier();
      fetchTemplates();

      // Polling for AI scan status
      let pollInterval: any;

      const checkScanningStatus = async () => {
         if (!id) return;
         try {
            const data: any = await api.getDossierById(id);
            const events = data.timeline || [];
            const hasCreated = events.some((e: any) => e.title === 'Dossier aangemaakt');
            const hasAICompleted = events.some((e: any) => e.title === 'AI Analyse Voltooid');

            if (hasCreated && !hasAICompleted && data.documents?.length > 0) {
               setIsScanning(true);
            } else {
               setIsScanning(false);
            }
         } catch (e) {
            console.error("Status check failed", e);
         }
      };

      if (id) {
         checkScanningStatus();
         pollInterval = setInterval(checkScanningStatus, 5000);
      }

      // Close context menu on click outside
      const handleClickOutside = () => setContextMenu(null);
      document.addEventListener('click', handleClickOutside);
      return () => {
         document.removeEventListener('click', handleClickOutside);
         if (pollInterval) clearInterval(pollInterval);
      };
   }, [id]);

   React.useEffect(() => {
      let progInterval: any;
      if (isScanning) {
         progInterval = setInterval(() => {
            setScanProgress(p => (p < 95 ? p + 2 : p));
         }, 1000);
      } else {
         setScanProgress(0);
      }
      return () => {
         if (progInterval) clearInterval(progInterval);
      };
   }, [isScanning]);

   const handleArchive = async () => {
      if (!dossier) return;
      const newStatus = dossier.status === DossierStatus.ARCHIVED ? DossierStatus.DRAFT : DossierStatus.ARCHIVED;
      try {
         await api.updateDossier(dossier.id, { status: newStatus });
         setDossier({ ...dossier, status: newStatus });
      } catch (error) {
         console.error("Failed to update status", error);
      }
   };

   const handleDeleteClick = () => {
      setDeleteModalType('dossier');
      const settings = SettingsService.getSettings();
      if (settings.showDeleteConfirmation) {
         setDeleteModalOpen(true);
      } else {
         performDelete();
      }
   };

   const handleDeleteVersionClick = (e: React.MouseEvent, versionId: string) => {
      e.stopPropagation();
      setDeleteModalType('version');
      setVersionToDelete(versionId);
      const settings = SettingsService.getSettings();
      if (settings.showVersionDeleteConfirmation) {
         setDeleteModalOpen(true);
      } else {
         performDeleteVersion(versionId);
      }
   };

   const handleDeleteAgreementClick = (e: React.MouseEvent, agreementId: string) => {
      e.stopPropagation();
      setDeleteModalType('agreement');
      setAgreementToDelete(agreementId);
      const settings = SettingsService.getSettings();
      if (settings.showAgreementDeleteConfirmation) {
         setDeleteModalOpen(true);
      } else {
         performDeleteAgreement(agreementId);
      }
   };

   const handleVersionContextMenu = (e: React.MouseEvent, versionId: string, agreementId: string) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, versionId, agreementId });
   };

   const handleContextMenuDelete = () => {
      if (contextMenu) {
         // Create a dummy event object for handleDeleteVersionClick
         const dummyEvent = {
            stopPropagation: () => { },
            // Add other properties if handleDeleteVersionClick expects them, e.g., target, currentTarget
            // For now, just stopPropagation is enough as it's the only one used.
         } as React.MouseEvent;
         handleDeleteVersionClick(dummyEvent, contextMenu.versionId);
         setContextMenu(null);
      }
   };

   const handleContextMenuRename = () => {
      if (contextMenu) {
         setVersionToRename(contextMenu.versionId);
         // Find current version name to pre-fill
         const agreement = dossier?.agreements?.find(a => a.id === contextMenu.agreementId);
         const version = agreement?.versions.find(v => v.id === contextMenu.versionId);
         setNewName(version?.number || '');
         setIsRenameModalOpen(true);
         setContextMenu(null);
      }
   };

   const performRename = async () => {
      if (!versionToRename || !newName.trim()) return;
      try {
         await api.renameVersion(versionToRename, newName.trim());
         setIsRenameModalOpen(false);
         setVersionToRename(null);
         setNewName('');
         // Refresh dossier
         const data: any = await api.getDossierById(id!);
         setDossier(data as Dossier);
      } catch (error: any) {
         console.error("Failed to rename version", error);
         alert("Kon versie niet hernoemen: " + (error.message || "Onbekende fout"));
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

   const performDeleteVersion = async (versionId: string) => {
      if (!id) return;
      try {
         await api.deleteVersion(versionId);
         // Close modal first
         setDeleteModalOpen(false);
         setVersionToDelete(null);
         // Refresh dossier
         const data: any = await api.getDossierById(id);
         setDossier(data as Dossier);
      } catch (error: any) {
         console.error("Failed to delete version", error);
         const errorMessage = error?.message || "Kon versie niet verwijderen.";
         alert(errorMessage);
      }
   };

   const performDeleteAgreement = async (agreementId: string) => {
      if (!id) return;
      try {
         await api.deleteAgreement(agreementId);
         // Close modal first
         setDeleteModalOpen(false);
         setAgreementToDelete(null);
         // Refresh dossier
         const data: any = await api.getDossierById(id);
         setDossier(data as Dossier);
      } catch (error: any) {
         console.error("Failed to delete agreement", error);
         const errorMessage = error?.message || "Kon overeenkomst niet verwijderen.";
         alert(errorMessage);
      }
   };

   const handleConfirmDelete = (dontShowAgain: boolean) => {
      if (dontShowAgain) {
         // Update the correct setting based on what's being deleted
         if (deleteModalType === 'dossier') {
            SettingsService.updateSettings({ showDeleteConfirmation: false });
         } else if (deleteModalType === 'version') {
            SettingsService.updateSettings({ showVersionDeleteConfirmation: false });
         } else if (deleteModalType === 'agreement') {
            SettingsService.updateSettings({ showAgreementDeleteConfirmation: false });
         }
      }
      if (deleteModalType === 'dossier') {
         performDelete();
      } else if (deleteModalType === 'version' && versionToDelete) {
         performDeleteVersion(versionToDelete);
      } else if (deleteModalType === 'agreement' && agreementToDelete) {
         performDeleteAgreement(agreementToDelete);
      }
      setDeleteModalOpen(false);
      setVersionToDelete(null);
      setAgreementToDelete(null);
   };

   const toggleEditName = async () => {
      if (!dossier) return;
      if (isEditingName) {
         try {
            await api.updateDossier(dossier.id, { name: tempName });
            setDossier({ ...dossier, name: tempName });
         } catch (error) {
            console.error("Failed to update name", error);
         }
      } else {
         setTempName(dossier.name);
      }
      setIsEditingName(!isEditingName);
   };

   const toggleEditAddress = async () => {
      if (!dossier) return;
      if (isEditingAddress) {
         try {
            await api.updateDossier(dossier.id, { address: tempAddress });
            setDossier({ ...dossier, address: tempAddress });
         } catch (error) {
            console.error("Failed to update address", error);
         }
      } else {
         setTempAddress(dossier.address);
      }
      setIsEditingAddress(!isEditingAddress);
   };

   const openDocument = (doc: any) => {
      setSelectedDocument({ name: doc.name, path: doc.path });
      setSplitScreen(true);
   };

   const handleAddAgreement = () => {
      setIsTemplateModalOpen(true);
   };

   const handleSelectTemplate = async (templateId: string) => {
      if (!id) return;
      setIsCreatingAgreement(true);
      console.log("Creating agreement for dossier:", id, "with template:", templateId);
      try {
         const result = await api.createAgreement(id, templateId);
         console.log("Agreement created result:", result);

         setIsTemplateModalOpen(false);

         // Refresh dossier to show the new agreement in the track
         const updatedDossier: any = await api.getDossierById(id);
         setDossier(updatedDossier as Dossier);

         // Navigate to editor for the new version
         if (result.versionId) {
            console.log("Opening editor for version:", result.versionId);
            onOpenEditor(result.versionId);
         } else {
            console.error("No versionId returned from API", result);
         }
      } catch (error) {
         console.error("Failed to create agreement", error);
         alert("Kon overeenkomst niet aanmaken.");
      } finally {
         setIsCreatingAgreement(false);
      }
   };

   const handleAddVersionClick = (agreementId: string) => {
      setActiveAgreementId(agreementId);
      setIsAddVersionModalOpen(true);
   };

   const handleDuplicateVersion = async () => {
      if (!id || !activeAgreementId) return;
      setIsCreatingVersion(true);
      try {
         const formData = new FormData();
         formData.append('source', 'Copy');
         // We let backend handle the duplication of sections if sections are missing

         const result = await api.createVersion(activeAgreementId, formData);
         setIsAddVersionModalOpen(false);

         const updatedDossier: any = await api.getDossierById(id);
         setDossier(updatedDossier as Dossier);

         if (result.id) {
            onOpenEditor(result.id);
         }
      } catch (error) {
         console.error("Failed to duplicate version", error);
         alert("Kon versie niet kopiëren.");
      } finally {
         setIsCreatingVersion(false);
      }
   };

   const handleFileUploadClick = () => {
      fileInputRef.current?.click();
   };

   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !id || !activeAgreementId) return;

      setIsCreatingVersion(true);
      try {
         const formData = new FormData();
         formData.append('file', file);
         formData.append('source', 'Upload');

         const result = await api.createVersion(activeAgreementId, formData);
         setIsAddVersionModalOpen(false);

         const updatedDossier: any = await api.getDossierById(id);
         setDossier(updatedDossier as Dossier);

         if (result.id) {
            // result.file_path is now set in backend
            onOpenEditor(result.id);
         }
      } catch (error) {
         console.error("Failed to upload version", error);
         alert("Kon bestand niet uploaden.");
      } finally {
         setIsCreatingVersion(false);
         if (fileInputRef.current) fileInputRef.current.value = '';
      }
   };

   if (!dossier) return <div className="flex items-center justify-center min-h-screen">
      <RefreshCw className="w-8 h-8 animate-spin text-brand-500" />
   </div>;

   return (
      <div className="max-w-7xl mx-auto animate-in fade-in duration-500 relative min-h-[calc(100vh-8rem)]">
         <DeleteConfirmationModal
            lang={lang}
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
            title={deleteModalType === 'version' ? t.deleteVersion : deleteModalType === 'agreement' ? 'Overeenkomst verwijderen' : t.deleteDossier}
            message={deleteModalType === 'version' ? t.deleteVersionConfirmation : deleteModalType === 'agreement' ? 'Ben je zeker dat je deze overeenkomst wilt verwijderen?' : t.deleteConfirmation}
         />

         {/* Context Menu */}
         {contextMenu && (
            <div
               className="fixed bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 py-1 z-[200] min-w-[160px]"
               style={{ top: contextMenu.y, left: contextMenu.x }}
               onClick={(e) => e.stopPropagation()}
            >
               <button
                  onClick={handleContextMenuRename}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
               >
                  <Edit2 className="w-4 h-4" />
                  Hernoem versie
               </button>
               <button
                  onClick={handleContextMenuDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
               >
                  <Trash2 className="w-4 h-4" />
                  Verwijder versie
               </button>
            </div>
         )}

         {/* Rename Modal */}
         {isRenameModalOpen && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsRenameModalOpen(false)}>
               <div
                  className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
                  onClick={e => e.stopPropagation()}
               >
                  <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white">Versie hernoemen</h3>
                     <button onClick={() => setIsRenameModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X className="w-5 h-5" />
                     </button>
                  </div>
                  <div className="p-6 space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                           Nieuwe naam voor versie
                        </label>
                        <input
                           type="text"
                           value={newName}
                           onChange={(e) => setNewName(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && performRename()}
                           autoFocus
                           className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                           placeholder="Bijv. Concept v2, Finale Versie..."
                        />
                     </div>
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-3">
                     <button
                        onClick={() => setIsRenameModalOpen(false)}
                        className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white transition-colors"
                     >
                        Annuleren
                     </button>
                     <button
                        onClick={performRename}
                        disabled={!newName.trim()}
                        className="px-6 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2"
                     >
                        Opslaan
                     </button>
                  </div>
               </div>
            </div>
         )}

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
            {/* Main Content: Agreements & Timeline */}
            <div className="lg:col-span-2 space-y-8">
               {/* Agreement Tracks */}
               <div className="space-y-4">
                  {dossier.agreements && dossier.agreements.length > 0 ? dossier.agreements.map((agg) => (
                     <div key={agg.id} className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-3">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-brand-50 dark:bg-brand-900/30 rounded-lg flex items-center justify-center">
                                 <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                              </div>
                              <div>
                                 <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{agg.templateName || 'Zelfgeschreven Overeenkomst'}</h3>
                              </div>
                           </div>
                           {/* Delete Agreement Button */}
                           <button
                              onClick={(e) => handleDeleteAgreementClick(e, agg.id)}
                              className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                              title="Overeenkomst verwijderen"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>

                        {/* Version Track UI */}
                        <div className="flex items-center gap-4 py-4 px-4 overflow-x-auto no-scrollbar">
                           {agg.versions.map((ver, idx) => (
                              <React.Fragment key={ver.id}>
                                 <div
                                    onClick={() => onOpenEditor(ver.id)}
                                    onContextMenu={(e) => handleVersionContextMenu(e, ver.id, agg.id)}
                                    className={`group/ver cursor-pointer flex flex-col items-center transition-all duration-300
                                       ${ver.isCurrent ? 'scale-110' : 'opacity-60 hover:opacity-100'}
                                    `}
                                 >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 mb-2 transition-all group-hover/ver:border-brand-500
                                        ${ver.isCurrent
                                          ? 'bg-brand-50 border-brand-500 text-brand-600 dark:bg-brand-900/20 shadow-md'
                                          : 'bg-white border-slate-100 text-slate-400 dark:bg-slate-800 dark:border-slate-700'}
                                     `}>
                                       <span className="font-bold text-sm">v{ver.number}</span>
                                    </div>
                                    <span className="text-[10px] uppercase tracking-tighter font-bold text-slate-400 group-hover/ver:text-brand-500 transition-colors">{ver.source}</span>
                                 </div>
                                 {idx < agg.versions.length - 1 && (
                                    <div className="w-8 h-[2px] bg-slate-100 dark:bg-slate-800 shrink-0 mt-[-15px]"></div>
                                 )}
                              </React.Fragment>
                           ))}

                           {/* Add Version Button (+ in the track) */}
                           <div className="w-8 h-[2px] bg-slate-100 dark:bg-slate-800 shrink-0 mt-[-15px]"></div>
                           <button
                              onClick={() => handleAddVersionClick(agg.id)}
                              className="w-12 h-12 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-300 hover:border-brand-500 hover:text-brand-500 transition-all shrink-0 mb-[18px]"
                              title="Versie toevoegen"
                           >
                              <RefreshCw className="w-5 h-5" />
                           </button>
                        </div>
                     </div>
                  )) : (
                     <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border-2 border-dashed border-gray-100 dark:border-slate-800 text-center">
                        <p className="text-slate-400 italic">Geen verkoopovereenkomsten gevonden.</p>
                     </div>
                  )}

                  {/* Add Agreement Button (Bottom +) */}
                  <button
                     onClick={handleAddAgreement}
                     className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 hover:border-brand-500 hover:text-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-all group"
                  >
                     <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-2 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/30 transition-all">
                        <FileText className="w-5 h-5" />
                     </div>
                     <span className="text-sm font-bold">Nieuwe verkoopovereenkomst starten</span>
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
                     {(dossier as any).documents && (dossier as any).documents.length > 0 ? (dossier as any).documents.map((doc: any, i: number) => (
                        <div
                           key={doc.id || i}
                           onClick={() => openDocument(doc)}
                           className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer group
                               ${selectedDocument?.name === doc.name && splitScreen
                                 ? 'bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-800'
                                 : 'bg-gray-50 dark:bg-slate-800/50 border-transparent hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                        >
                           <div className="flex items-center overflow-hidden">
                              <File className={`w-4 h-4 mr-3 flex-shrink-0 ${selectedDocument?.name === doc.name && splitScreen ? 'text-brand-600' : 'text-brand-500'}`} />
                              <div className="flex flex-col overflow-hidden">
                                 <span className={`text-sm truncate ${selectedDocument?.name === doc.name && splitScreen ? 'text-brand-700 dark:text-brand-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>{doc.name}</span>
                                 {doc.category && <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{doc.category}</span>}
                              </div>
                           </div>
                           <ExternalLink className={`w-4 h-4 transition-opacity ${selectedDocument?.name === doc.name && splitScreen ? 'opacity-100 text-brand-500' : 'opacity-0 group-hover:opacity-100 text-slate-400'}`} />
                        </div>
                     )) : (
                        <div className="text-xs text-slate-400 italic py-4 text-center">
                           Nog geen documenten geüpload.
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>

         {/* Add Version Modal */}
         {isAddVersionModalOpen && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col relative">
                  <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                     <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nieuwe Versie Toevoegen</h2>
                        <p className="text-sm text-slate-500">Hoe wilt u de nieuwe versie aanmaken?</p>
                     </div>
                     <button onClick={() => setIsAddVersionModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-400" />
                     </button>
                  </div>

                  <div className="p-6 grid grid-cols-1 gap-4">
                     <div
                        onClick={handleFileUploadClick}
                        className="flex items-center p-6 rounded-xl border border-gray-100 dark:border-slate-800 hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 cursor-pointer transition-all group"
                     >
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-brand-100 group-hover:text-brand-600 transition-all mr-4">
                           <File className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                           <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-brand-700 transition-colors">Bestand uploaden</h3>
                           <p className="text-sm text-slate-500 leading-tight">Upload een extern PDF of Word document</p>
                        </div>
                        <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:text-brand-500 rotate-180 transition-all" />
                     </div>

                     <div
                        onClick={handleDuplicateVersion}
                        className="flex items-center p-6 rounded-xl border border-gray-100 dark:border-slate-800 hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 cursor-pointer transition-all group"
                     >
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-brand-100 group-hover:text-brand-600 transition-all mr-4">
                           <RefreshCw className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                           <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-brand-700 transition-colors">Huidige versie kopiëren</h3>
                           <p className="text-sm text-slate-500 leading-tight">Start een nieuwe draft op basis van de laatste versie</p>
                        </div>
                        <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:text-brand-500 rotate-180 transition-all" />
                     </div>
                  </div>

                  {isCreatingVersion && (
                     <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-brand-600" />
                     </div>
                  )}
               </div>
            </div>
         )}

         {/* Template Selection Modal */}
         {isTemplateModalOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] relative">
                  <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                     <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Start Nieuwe Overeenkomst</h2>
                        <p className="text-sm text-slate-500">Kies een template om mee te beginnen</p>
                     </div>
                     <button onClick={() => setIsTemplateModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-400" />
                     </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {templates.map(template => {
                           const isAiSuggested = template.name?.toLowerCase().includes('vlaanderen');
                           const isApartment = template.name?.toLowerCase().includes('appartement');

                           return (
                              <div
                                 key={template.id}
                                 onClick={() => handleSelectTemplate(template.id)}
                                 className="relative flex flex-col p-6 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 cursor-pointer transition-all group"
                              >
                                 {isAiSuggested && (
                                    <div className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] px-2 py-1 rounded-bl-lg rounded-tr-lg font-bold tracking-wide">
                                       AANBEVOLEN
                                    </div>
                                 )}

                                 <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors mb-4">
                                    {isApartment ? <Building2 className="w-5 h-5" /> : <Home className="w-5 h-5" />}
                                 </div>

                                 <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-brand-700 dark:hover:text-brand-400 transition-colors mb-1">{template.name}</h3>
                                 <ExpandableText
                                    text={template.description || 'Geen beschrijving beschikbaar.'}
                                    limit={60}
                                    className="text-xs text-slate-500 leading-relaxed mb-4"
                                 />

                                 <div className="mt-auto flex items-center justify-end">
                                    <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:text-brand-500 rotate-180 transition-all" />
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </div>
                  {isCreatingAgreement && (
                     <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-brand-600" />
                     </div>
                  )}
               </div>
            </div>
         )}

         {/* Hidden File Input */}
         <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx"
         />

         {/* Premium Side Drawer Viewer */}
         <div className={`fixed inset-y-0 right-0 w-[45%] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-l border-gray-200 dark:border-slate-800 shadow-2xl z-[100] transform transition-transform duration-500 ease-in-out flex flex-col ${splitScreen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="h-16 flex items-center justify-between px-6 bg-white/50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-800 shrink-0">
               <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/50 flex items-center justify-center mr-3">
                     <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                     <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block leading-none mb-1">Document Preview</span>
                     <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedDocument?.name}</span>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <button
                     onClick={() => selectedDocument?.path && window.open(selectedDocument.path, '_blank')}
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
               <div className="max-w-4xl mx-auto w-full h-full bg-white dark:bg-slate-900 shadow-2xl border border-gray-200 dark:border-slate-800 rounded-sm overflow-hidden relative group">
                  {selectedDocument?.path ? (
                     <iframe
                        src={selectedDocument.path}
                        className="w-full h-full border-none"
                        title={selectedDocument.name}
                     />
                  ) : (
                     <div className="flex items-center justify-center h-full text-slate-400">
                        Selecteer een document om te bekijken
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};
