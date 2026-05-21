import React from 'react';
import { ArrowLeft, Calendar, MapPin, FileText, Clock, GitCompare, Archive, ExternalLink, RefreshCw, File, Trash2, X, Home, Building2, Edit2, Bookmark, BookmarkCheck, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Language, Dossier, DossierStatus } from '../types';
import { TRANSLATIONS } from '../constants';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { SettingsService } from '../services/settingsService';
import { ExpandableText } from './ExpandableText';
import { api } from '../services/api';

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { renderAsync } from 'docx-preview';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DossierOverviewProps {
   lang: Language;
   onBack: () => void;
   onOpenEditor: (id: string) => void;
   onOpenCollabora: (id: string) => void;
   onCompare: (id: string) => void;
}

const DocxPreview: React.FC<{ url: string }> = ({ url }) => {
   const containerRef = React.useRef<HTMLDivElement>(null);
   const [error, setError] = React.useState<string | null>(null);

   React.useEffect(() => {
      if (!containerRef.current) return;
      containerRef.current.innerHTML = '';
      setError(null);
      fetch(url)
         .then(r => r.arrayBuffer())
         .then(buf => renderAsync(buf, containerRef.current!, undefined, { className: 'docx-preview-body' }))
         .catch(() => setError('Fout bij het laden van het document.'));
   }, [url]);

   if (error) return <div className="p-4 text-red-500 font-medium">{error}</div>;
   return <div ref={containerRef} className="w-full bg-white px-8 py-6" />;
};

export const DossierOverview: React.FC<DossierOverviewProps> = ({ lang, onBack, onOpenEditor, onOpenCollabora, onCompare }) => {
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
   const [numPages, setNumPages] = React.useState<number | null>(null);

   // Editing states
   const [isEditingName, setIsEditingName] = React.useState(false);
   const [isEditingAddress, setIsEditingAddress] = React.useState(false);
   const [tempName, setTempName] = React.useState('');
   const [tempAddress, setTempAddress] = React.useState('');
   const [isScanning, setIsScanning] = React.useState(false);
   const [scanProgress, setScanProgress] = React.useState(0);
   const [expandedTimelineGroups, setExpandedTimelineGroups] = React.useState<Set<string>>(new Set());

   // Templates state for "Add Agreement"
   const [templates, setTemplates] = React.useState<any[]>([]);
   const [isTemplateModalOpen, setIsTemplateModalOpen] = React.useState(false);
   const [isCreatingAgreement, setIsCreatingAgreement] = React.useState(false);
   const [agreementRemarks, setAgreementRemarks] = React.useState('');

   // Version states
   const [isAddVersionModalOpen, setIsAddVersionModalOpen] = React.useState(false);
   const [activeAgreementId, setActiveAgreementId] = React.useState<string | null>(null);
   const [isCreatingVersion, setIsCreatingVersion] = React.useState(false);
   const fileInputRef = React.useRef<HTMLInputElement>(null);
   const dossierFileInputRef = React.useRef<HTMLInputElement>(null);
   const [isUploadingDocs, setIsUploadingDocs] = React.useState(false);

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
            const hasAIStart = events.some((e: any) => e.title.includes('AI Analyse:'));
            const hasAICompleted = events.some((e: any) => e.title === 'AI Analyse Voltooid');
            const hasAIError = events.some((e: any) => e.title === 'AI Analyse Fout');

            if (hasAIStart && !hasAICompleted && !hasAIError) {
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

   // Auto-scroll version tracks to the right (latest version) on load
   React.useEffect(() => {
      if (dossier) {
         // Small timeout to ensure DOM is updated
         setTimeout(() => {
            const tracks = document.querySelectorAll('.version-track-container');
            tracks.forEach(track => {
               track.scrollLeft = track.scrollWidth;
            });
         }, 100);
      }
   }, [dossier]);

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
         // Find current version label (source) to pre-fill
         const agreement = dossier?.agreements?.find(a => a.id === contextMenu.agreementId);
         const version = agreement?.versions.find(v => v.id === contextMenu.versionId);
         setNewName(version?.source || '');
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

   const handleToggleBookmark = async (e: React.MouseEvent | undefined, versionId: string, currentState: boolean) => {
      if (e) {
         e.stopPropagation();
         e.preventDefault();
      }
      try {
         await api.toggleVersionBookmark(versionId, !currentState);
         const data: any = await api.getDossierById(id!);
         setDossier(data as Dossier);
      } catch (error) {
         console.error("Failed to toggle bookmark", error);
      }
   };
   
   const handleContextMenuBookmark = async () => {
      if (contextMenu) {
         const agreement = dossier?.agreements?.find(a => a.id === contextMenu.agreementId);
         const version = agreement?.versions.find(v => v.id === contextMenu.versionId);
         if (version) {
            await handleToggleBookmark(undefined, version.id, !!version.isBookmarked);
         }
         setContextMenu(null);
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
      if (!dossier || dossier.status === DossierStatus.ARCHIVED) return;
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
      if (!dossier || dossier.status === DossierStatus.ARCHIVED) return;
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
      let relativeUrl = doc.path || '';
      if (relativeUrl) {
         const filename = relativeUrl.split('/').pop() || relativeUrl;
         relativeUrl = relativeUrl.startsWith('http') ? relativeUrl : `/api/documents/preview/${filename}`;
      }

      setSelectedDocument({ name: doc.name, path: relativeUrl });
      setSplitScreen(true);
   };

   const handleAddAgreement = () => {
      if (dossier?.status === DossierStatus.ARCHIVED) return;
      setIsTemplateModalOpen(true);
   };

   const handleSelectTemplate = async (templateId: string) => {
      if (!id) return;
      setIsCreatingAgreement(true);
      console.log("Creating agreement for dossier:", id, "with template:", templateId);
      try {
         const result = await api.createAgreement(id, templateId, agreementRemarks);
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
         setAgreementRemarks('');
      }
   };

   const handleAddVersionClick = (agreementId: string) => {
      if (dossier?.status === DossierStatus.ARCHIVED) return;
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

   const handleAddDossierDocumentsClick = () => {
      if (dossier?.status === DossierStatus.ARCHIVED) return;
      dossierFileInputRef.current?.click();
   };

   const handleDossierFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0 || !id) return;

      setIsUploadingDocs(true);
      try {
         const formData = new FormData();
         for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
         }

         await api.addDossierDocuments(id, formData);
         
         // Refresh dossier
         const data: any = await api.getDossierById(id);
         setDossier(data as Dossier);
      } catch (error) {
         console.error("Failed to upload dossier documents", error);
         alert("Kon documenten niet toevoegen.");
      } finally {
         setIsUploadingDocs(false);
         if (dossierFileInputRef.current) dossierFileInputRef.current.value = '';
      }
   };

   if (!dossier) return <div className="flex items-center justify-center min-h-screen">
      <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
   </div>;

   return (
      <div className="max-w-7xl mx-auto animate-in fade-in duration-500 relative min-h-[calc(100vh-8rem)]">
         <DeleteConfirmationModal
            lang={lang}
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
            title={deleteModalType === 'version' ? t.deleteVersion : deleteModalType === 'agreement' ? t.deleteAgreement : t.deleteDossier}
            message={deleteModalType === 'version' ? t.deleteVersionConfirmation : deleteModalType === 'agreement' ? t.deleteAgreementConfirmation : t.deleteConfirmation}
         />

         {/* Context Menu */}
         {contextMenu && (
            <div
               className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[200] min-w-[160px]"
               style={{ top: contextMenu.y, left: contextMenu.x }}
               onClick={(e) => e.stopPropagation()}
            >
               <button
                  onClick={handleContextMenuRename}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-gray-100 flex items-center gap-2"
               >
                  <Edit2 className="w-4 h-4" />
                  {t.renameVersion}
               </button>
               <button
                  onClick={handleContextMenuBookmark}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-gray-100 flex items-center gap-2 border-b border-gray-100 pb-2 mb-1"
               >
                  <Bookmark className="w-4 h-4 text-slate-400" />
                  {(t as any).toggleBookmark || 'Bookmark'}
               </button>
               <button
                  onClick={handleContextMenuDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
               >
                  <Trash2 className="w-4 h-4" />
                  {t.deleteVersion}
               </button>
            </div>
         )}

         {/* Rename Modal */}
         {isRenameModalOpen && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsRenameModalOpen(false)}>
               <div
                  className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
                  onClick={e => e.stopPropagation()}
               >
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                     <h3 className="text-xl font-bold text-slate-900">{t.versionRenamePopupTitle}</h3>
                     <button onClick={() => setIsRenameModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                     </button>
                  </div>
                  <div className="p-6 space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                           {t.versionRenameNewName}
                        </label>
                        <input
                           type="text"
                           value={newName}
                           onChange={(e) => setNewName(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && performRename()}
                           autoFocus
                           className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                           placeholder={t.versionRenamePlaceholder}
                        />
                     </div>
                  </div>
                  <div className="p-6 bg-slate-50 flex items-center justify-end gap-3">
                     <button
                        onClick={() => setIsRenameModalOpen(false)}
                        className="px-4 py-2 text-slate-600 font-medium hover:text-slate-900 transition-colors"
                     >
                        {t.cancel}
                     </button>
                     <button
                        onClick={performRename}
                        disabled={!newName.trim()}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                     >
                        {t.save}
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Header / Nav */}
         <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center flex-1">
               <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-slate-500 mr-4">
                  <ArrowLeft className="w-6 h-6" />
               </button>
               <div className="flex-1">
                  {isEditingName && dossier.status !== DossierStatus.ARCHIVED ? (
                     <div className="flex items-center gap-2">
                        <input
                           autoFocus
                           type="text"
                           value={tempName}
                           onChange={(e) => setTempName(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && toggleEditName()}
                           onBlur={toggleEditName}
                           className="text-3xl font-bold bg-white border-2 border-blue-500 rounded-lg px-2 py-1 outline-none text-slate-900 w-full max-w-lg"
                        />
                     </div>
                  ) : (
                     <h1
                        className={`text-3xl font-bold text-slate-900 ${dossier.status === DossierStatus.ARCHIVED ? '' : 'cursor-pointer hover:text-blue-600 transition-colors'}`}
                        onClick={toggleEditName}
                     >
                        {dossier.name}
                     </h1>
                  )}

                  <div className="flex items-center mt-1 text-slate-500 text-sm">
                     <MapPin className="w-4 h-4 mr-1" />
                     {isEditingAddress && dossier.status !== DossierStatus.ARCHIVED ? (
                        <input
                           autoFocus
                           type="text"
                           value={tempAddress}
                           onChange={(e) => setTempAddress(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && toggleEditAddress()}
                           onBlur={toggleEditAddress}
                           className="bg-white border-2 border-blue-500 rounded px-1 outline-none text-slate-900 w-full max-w-md"
                        />
                     ) : (
                        <span
                           className={dossier.status === DossierStatus.ARCHIVED ? '' : 'cursor-pointer hover:text-blue-600 transition-colors'}
                           onClick={toggleEditAddress}
                        >
                           {dossier.address}
                        </span>
                     )}
                  </div>
               </div>
            </div>

            <div className="flex space-x-3 shrink-0">
               <button onClick={() => onCompare(dossier.id)} className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-slate-700 hover:bg-gray-50 transition-colors shadow-sm">
                  <GitCompare className="w-4 h-4 mr-2" />
                  {t.compare}
               </button>
               <button onClick={handleArchive} className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-slate-700 hover:bg-gray-50 transition-colors shadow-sm">
                  {dossier.status === DossierStatus.ARCHIVED ? <RefreshCw className="w-4 h-4 mr-2" /> : <Archive className="w-4 h-4 mr-2" />}
                  {dossier.status === DossierStatus.ARCHIVED ? t.unarchiveDossier : t.archiveDossier}
               </button>
               <button onClick={handleDeleteClick} className="p-2 bg-white border border-red-100 rounded-lg text-red-600 hover:bg-red-50 transition-colors shadow-sm" title={t.deleteDossier}>
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
                     <div key={agg.id} className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-3">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                 <FileText className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                 <h3 className="font-bold text-slate-900 leading-tight">{agg.templateName || t.customAgreement}</h3>
                              </div>
                           </div>
                           {/* Delete Agreement Button */}
                           {dossier.status !== DossierStatus.ARCHIVED && (
                              <button
                                 onClick={(e) => handleDeleteAgreementClick(e, agg.id)}
                                 className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                 title={t.deleteAgreement}
                              >
                                 <Trash2 className="w-4 h-4" />
                              </button>
                           )}
                        </div>

                        {/* Version Track UI */}
                        <div className="version-track-container flex items-center gap-4 py-4 px-4 overflow-x-auto no-scrollbar scroll-smooth">
                           {agg.versions.map((ver, idx) => (
                              <React.Fragment key={ver.id}>
                                  <button
                                     onClick={() => onOpenEditor(ver.id)}
                                     onContextMenu={(e) => {
                                        if (dossier.status !== DossierStatus.ARCHIVED) {
                                           handleVersionContextMenu(e, ver.id, agg.id);
                                        } else {
                                           e.preventDefault();
                                        }
                                     }}
                                     type="button"
                                     className={`group relative cursor-pointer flex flex-col items-center transition-all duration-200 focus:outline-none focus:ring-0
                                        ${ver.isCurrent ? 'scale-110' : 'opacity-50 hover:opacity-100 text-slate-500 hover:scale-105'}
                                     `}
                                  >
                                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 mb-2 transition-colors relative
                                         ${ver.isCurrent
                                           ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-md'
                                           : 'bg-white border-slate-200 text-slate-400 group-hover:border-blue-400 group-hover:text-blue-500'}
                                      `}>
                                        {/* Bookmark Icon */}
                                        {ver.isBookmarked && (
                                           <div 
                                              className="absolute -top-2 -left-2 p-1 rounded-full z-10 transition-all text-yellow-500 bg-white opacity-100 shadow-sm border border-yellow-200"
                                              title="Bookmarked"
                                           >
                                              <BookmarkCheck className="w-3.5 h-3.5 fill-current" />
                                           </div>
                                        )}
                                        <span className="font-bold text-sm">v{ver.number}</span>
                                     </div>
                                     <span className={`text-[10px] uppercase tracking-tighter font-bold transition-colors ${ver.isCurrent ? "text-blue-500" : "text-slate-400 group-hover:text-blue-500"}`}>{ver.source}</span>
                                  </button>
                                 {
                                    idx < agg.versions.length - 1 && (
                                       <div className="w-8 h-[2px] bg-slate-100 shrink-0 mt-[-15px]"></div>
                                    )
                                 }
                              </React.Fragment>
                           ))}

                           {/* Add Version Button (+ in the track) */}
                           {dossier.status !== DossierStatus.ARCHIVED && (
                              <>
                                 <div className="w-8 h-[2px] bg-slate-100 shrink-0 mt-[-15px]"></div>
                                 <button
                                    onClick={() => handleAddVersionClick(agg.id)}
                                    className="w-12 h-12 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-blue-500 hover:text-blue-500 transition-all shrink-0 mb-[18px]"
                                    title={t.addVersionTooltip}
                                 >
                                    <RefreshCw className="w-5 h-5" />
                                 </button>
                              </>
                           )}
                        </div>
                     </div>
                  )) : (
                     <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-100 text-center">
                        <p className="text-slate-400 italic">{t.noAgreementsFound}</p>
                     </div>
                  )}

                  {/* Add Agreement Button (Bottom +) */}
                  {dossier.status !== DossierStatus.ARCHIVED && (
                     <button
                        onClick={handleAddAgreement}
                        className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50/50 transition-all group"
                     >
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2 group-hover:bg-blue-100 transition-all">
                           <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold">{t.startNewAgreement}</span>
                     </button>
                  )}
               </div>

               {/* Timeline */}
               <div className="bg-white p-6 rounded-2xl border border-gray-200">
                  <h3 className="font-bold text-lg mb-6 flex items-center">
                     <Clock className="w-5 h-5 mr-2 text-slate-400" />
                     {t.timeline}
                  </h3>

                  <div className="relative border-l-2 border-slate-200 ml-3 space-y-0">
                     {dossier.timeline.length > 0 ? (() => {
                        // Group timeline events: consecutive AI events form a collapsible group
                        type GroupedEvent = { type: 'single', event: typeof dossier.timeline[0] } | { type: 'ai-group', parent: typeof dossier.timeline[0], children: typeof dossier.timeline };
                        const grouped: GroupedEvent[] = [];
                        let currentAIGroup: typeof dossier.timeline = [];

                        const isAISubEvent = (e: typeof dossier.timeline[0]) => 
                           e.title.startsWith('AI:') || e.title.startsWith('AI Analyse:') || e.title === 'AI Analyse Gestart';
                        const isAICompletion = (e: typeof dossier.timeline[0]) => 
                           e.title === 'AI Analyse Voltooid' || e.title === 'AI Analyse Fout';

                        const flushGroup = () => {
                           if (currentAIGroup.length > 0) {
                              // The last item might be the completion event
                              const completionIdx = currentAIGroup.findIndex(e => isAICompletion(e));
                              const parent = completionIdx !== -1 ? currentAIGroup[completionIdx] : currentAIGroup[currentAIGroup.length - 1];
                              const children = currentAIGroup.filter(e => e !== parent);
                              grouped.push({ type: 'ai-group', parent, children });
                              currentAIGroup = [];
                           }
                        };

                        for (const event of dossier.timeline) {
                           if (isAISubEvent(event) || isAICompletion(event)) {
                              currentAIGroup.push(event);
                              if (isAICompletion(event)) flushGroup();
                           } else {
                              flushGroup();
                              grouped.push({ type: 'single', event });
                           }
                        }
                        flushGroup();

                        // Color helper
                        const getDotColor = (title: string) => {
                           if (title.includes('AI') || title.includes('Analyse')) return 'bg-blue-500';
                           if (title.includes('Status') || title.includes('Voltooid') || title.includes('Aangemaakt')) return 'bg-green-500';
                           if (title.includes('Opgeslagen') || title.includes('Versie') || title.includes('Save')) return 'bg-slate-400';
                           if (title.includes('Upload') || title.includes('Document')) return 'bg-gray-400';
                           return 'bg-slate-400';
                        };

                        return grouped.map((item, groupIdx) => {
                           if (item.type === 'single') {
                              const event = item.event;
                              return (
                                 <div key={event.id} className="relative pl-7 py-3">
                                    <div className={`absolute -left-[5px] top-4 w-2.5 h-2.5 rounded-full ${getDotColor(event.title)} ring-4 ring-white`} />
                                    <div className="flex items-start justify-between gap-2">
                                       <div className="min-w-0">
                                          <h4 className="text-sm font-semibold text-slate-800 leading-tight">{event.title}</h4>
                                          <p className="text-xs text-slate-500 mt-0.5">{event.description}</p>
                                       </div>
                                       <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                          <span className="text-[10px] text-slate-400 whitespace-nowrap">{event.date}</span>
                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium border border-slate-200 text-slate-500 bg-white">
                                             {event.user}
                                          </span>
                                       </div>
                                    </div>
                                 </div>
                              );
                           } else {
                              // AI group — collapsible
                              const { parent, children } = item;
                              const groupId = parent.id;
                              const isExpanded = expandedTimelineGroups.has(groupId);
                              const hasError = parent.title === 'AI Analyse Fout';

                              return (
                                 <div key={groupId} className="relative pl-7 py-3">
                                    <div className={`absolute -left-[5px] top-4 w-2.5 h-2.5 rounded-full ${hasError ? 'bg-red-500' : 'bg-blue-500'} ring-4 ring-white`} />
                                    <div>
                                       <div className="flex items-start justify-between gap-2">
                                          <div className="min-w-0 flex-1">
                                             <button 
                                                onClick={() => {
                                                   setExpandedTimelineGroups(prev => {
                                                      const next = new Set(prev);
                                                      if (next.has(groupId)) next.delete(groupId); else next.add(groupId);
                                                      return next;
                                                   });
                                                }}
                                                className="flex items-center gap-1.5 group text-left"
                                             >
                                                <span className={`transition-transform duration-150 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
                                                   <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                                </span>
                                                <h4 className="text-sm font-semibold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                                                   {parent.title}
                                                </h4>
                                                {children.length > 0 && (
                                                   <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                                                      {children.length} doc{children.length !== 1 ? 's' : ''}
                                                   </span>
                                                )}
                                             </button>
                                             <p className="text-xs text-slate-500 mt-0.5 ml-5">{parent.description}</p>
                                          </div>
                                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                             <span className="text-[10px] text-slate-400 whitespace-nowrap">{parent.date}</span>
                                             <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium border border-blue-200 text-blue-600 bg-blue-50">
                                                AI Assistent
                                             </span>
                                          </div>
                                       </div>
                                       {/* Expandable children */}
                                       {isExpanded && children.length > 0 && (
                                          <div className="ml-5 mt-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                             {children.map(child => (
                                                <div key={child.id} className="flex items-center gap-2 text-xs text-slate-500 py-1">
                                                   <span className="text-slate-300">–</span>
                                                   <span className="truncate">{child.title.replace(/^AI[:\s]+/i, '')}</span>
                                                   {child.description && <span className="text-slate-300 flex-shrink-0">• {child.description}</span>}
                                                </div>
                                             ))}
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              );
                           }
                        });
                     })() : (
                        <div className="pl-7 py-3 text-slate-500 text-sm">{t.noActivitiesYet}</div>
                     )}
                  </div>
               </div>
            </div>

            {/* Sidebar: Metadata & Source Docs */}
            <div className="space-y-6">
               <div className="bg-white p-6 rounded-2xl border border-gray-200">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-4">{t.details}</h3>
                  <div className="space-y-4">
                     <div>
                        <label className="text-xs text-slate-400 block mb-1">{t.creationDate}</label>
                        <div className="flex items-center text-sm font-medium text-slate-900">
                           <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                           {dossier.creationDate}
                        </div>
                     </div>
                     <div>
                        <label className="text-xs text-slate-400 block mb-1">Status</label>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                           {dossier.status}
                        </span>
                     </div>
                  </div>
               </div>

               <div className="bg-white p-6 rounded-2xl border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">{t.documents}</h3>
                     {dossier.status !== DossierStatus.ARCHIVED && (
                        <button 
                           onClick={handleAddDossierDocumentsClick}
                           disabled={isUploadingDocs}
                           className="p-1.5 px-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center shadow-sm border border-blue-100"
                           title={(t as any).addDocuments || 'Documenten toevoegen'}
                        >
                           {isUploadingDocs ? (
                              <RefreshCw className="w-4 h-4 animate-spin"/>
                           ) : (
                              <Plus className="w-4 h-4 stroke-[3px]" />
                           )}
                        </button>
                     )}
                  </div>
                  <div className="space-y-3">
                     {(dossier as any).documents && (dossier as any).documents.length > 0 ? (dossier as any).documents.map((doc: any, i: number) => (
                        <div
                           key={doc.id || i}
                           onClick={() => openDocument(doc)}
                           className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer group
                               ${selectedDocument?.name === doc.name && splitScreen
                                 ? 'bg-blue-50 border-blue-200'
                                 : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}
                        >
                           <div className="flex items-center overflow-hidden">
                              <File className={`w-4 h-4 mr-3 flex-shrink-0 ${selectedDocument?.name === doc.name && splitScreen ? 'text-blue-600' : 'text-blue-500'}`} />
                              <div className="flex flex-col overflow-hidden">
                                 <span className={`text-sm truncate ${selectedDocument?.name === doc.name && splitScreen ? 'text-blue-700 font-bold' : 'text-slate-700'}`}>{doc.name}</span>
                                 {doc.category && <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{doc.category}</span>}
                              </div>
                           </div>
                           <button
                              type="button"
                              onClick={(e) => {
                                 e.stopPropagation();
                                 let relativeUrl = doc.path || '';
                                 if (relativeUrl) {
                                    const filename = relativeUrl.split('/').pop() || relativeUrl;
                                    relativeUrl = relativeUrl.startsWith('http') ? relativeUrl : `/api/documents/preview/${filename}`;
                                 }
                                 if (relativeUrl) window.open(relativeUrl, '_blank');
                              }}
                              className="p-1 bg-transparent hover:bg-gray-200 rounded transition-colors z-10"
                              title={t.openInBrowser || "Open in nieuw tabblad"}
                           >
                              <ExternalLink className={`w-4 h-4 transition-opacity ${selectedDocument?.name === doc.name && splitScreen ? 'opacity-100 text-blue-500' : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600'}`} />
                           </button>
                        </div>
                     )) : (
                        <div className="text-xs text-slate-400 italic py-4 text-center">
                           {t.noDocumentsUploaded}
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>

         {/* Add Version Modal */}
         {
            isAddVersionModalOpen && (
               <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                  <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col relative">
                     <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <div>
                           <h2 className="text-xl font-bold text-slate-900">{t.addVersionModalTitle}</h2>
                           <p className="text-sm text-slate-500">{t.addVersionModalSub}</p>
                        </div>
                        <button onClick={() => setIsAddVersionModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                           <X className="w-6 h-6 text-slate-400" />
                        </button>
                     </div>

                     <div className="p-6 grid grid-cols-1 gap-4">
                        <div
                           onClick={handleFileUploadClick}
                           className="flex items-center p-6 rounded-xl border border-gray-100 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all group"
                        >
                           <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all mr-4">
                              <File className="w-6 h-6" />
                           </div>
                           <div className="flex-1">
                              <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{t.uploadFile}</h3>
                              <p className="text-sm text-slate-500 leading-tight">{t.uploadFileDesc}</p>
                           </div>
                           <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:text-blue-500 rotate-180 transition-all" />
                        </div>

                        <div
                           onClick={handleDuplicateVersion}
                           className="flex items-center p-6 rounded-xl border border-gray-100 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all group"
                        >
                           <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all mr-4">
                              <RefreshCw className="w-6 h-6" />
                           </div>
                           <div className="flex-1">
                              <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{t.copyCurrentVersion}</h3>
                              <p className="text-sm text-slate-500 leading-tight">{t.copyVersionDesc}</p>
                           </div>
                           <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:text-blue-500 rotate-180 transition-all" />
                        </div>
                     </div>

                     {isCreatingVersion && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
                           <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                     )}
                  </div>
               </div>
            )
         }

         {/* Template Selection Modal */}
         {
            isTemplateModalOpen && (
               <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                  <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh] relative">
                     <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <div>
                           <h2 className="text-xl font-bold text-slate-900">{t.startNewAgreementTitle}</h2>
                           <p className="text-sm text-slate-500">{t.chooseTemplateStart}</p>
                        </div>
                        <button onClick={() => setIsTemplateModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                           <X className="w-6 h-6 text-slate-400" />
                        </button>
                     </div>
                     <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-2">
                              {t.remarks} <span className="text-slate-400 font-normal">({t.optional})</span>
                           </label>
                           <textarea
                              rows={3}
                              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                              placeholder={t.remarksPlaceholder}
                              value={agreementRemarks}
                              onChange={(e) => setAgreementRemarks(e.target.value)}
                           />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {templates.map(template => {
                              const isAiSuggested = template.name?.toLowerCase().includes('vlaanderen');
                              const isApartment = template.name?.toLowerCase().includes('appartement');

                              return (
                                 <div
                                    key={template.id}
                                    onClick={() => handleSelectTemplate(template.id)}
                                    className="relative flex flex-col p-6 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all group"
                                 >
                                    {isAiSuggested && (
                                       <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] px-2 py-1 rounded-bl-lg rounded-tr-lg font-bold tracking-wide">
                                          AANBEVOLEN
                                       </div>
                                    )}

                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors mb-4">
                                       {isApartment ? <Building2 className="w-5 h-5" /> : <Home className="w-5 h-5" />}
                                    </div>

                                    <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors mb-1 break-all">{template.name}</h3>
                                    <ExpandableText
                                       text={template.description || t.noDescriptionAvailable}
                                       limit={60}
                                       className="text-xs text-slate-500 leading-relaxed mb-4 break-words"
                                    />

                                    <div className="mt-auto flex items-center justify-end">
                                       <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:text-blue-500 rotate-180 transition-all" />
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                     {isCreatingAgreement && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
                           <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                     )}
                  </div>
               </div>
            )
         }

         {/* Hidden File Input */}
         <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
         />

         <input
            type="file"
            ref={dossierFileInputRef}
            onChange={handleDossierFileChange}
            className="hidden"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
         />

         {/* Premium Side Drawer Viewer */}
         <div className={`fixed inset-y-0 right-0 w-[45%] bg-white/80 backdrop-blur-xl border-l border-gray-200 shadow-2xl z-[100] transform transition-transform duration-500 ease-in-out flex flex-col ${splitScreen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="h-16 flex items-center justify-between px-6 bg-white/50 border-b border-gray-200 shrink-0">
               <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
                     <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                     <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block leading-none mb-1">{t.documentPreview}</span>
                     <span className="text-sm font-bold text-slate-900">{selectedDocument?.name}</span>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <button
                     onClick={() => selectedDocument?.path && window.open(selectedDocument.path, '_blank')}
                     className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                     title={t.openInBrowser}
                  >
                     <ExternalLink className="w-5 h-5" />
                  </button>
                  <button
                     onClick={() => setSplitScreen(false)}
                     className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                     <X className="w-6 h-6" />
                  </button>
               </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto bg-slate-50/50">
               <div className="max-w-4xl mx-auto w-full h-full bg-white shadow-2xl border border-gray-200 rounded-sm overflow-hidden relative group">
                  {selectedDocument?.path ? (
                      <div className="w-full h-full overflow-y-auto bg-slate-200 flex flex-col items-center py-6">
                         {/\.(jpg|jpeg|png|gif|webp)($|\?|#)/i.test(selectedDocument.path || '') ? (
                            <div className="max-w-[90%] bg-white shadow-2xl rounded-lg p-2">
                               <img
                                  src={selectedDocument.path}
                                  alt={selectedDocument.name}
                                  className="w-full h-auto object-contain"
                               />
                            </div>
                         ) : /\.(docx|doc)($|\?|#)/i.test(selectedDocument.path || '') ? (
                            <DocxPreview url={selectedDocument.path} />
                         ) : (
                            <Document
                               file={selectedDocument.path}
                               onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                               loading={<div className="p-4 text-slate-500 font-medium flex items-center"><RefreshCw className="animate-spin w-4 h-4 mr-2"/> {t.documentLoading || 'Laden...'}</div>}
                               error={<div className="p-4 text-red-500 font-medium">{t.documentLoadError || 'Fout bij het laden'}</div>}
                            >
                               {Array.from(new Array(numPages || 0), (el, index) => (
                                   <div key={`page_${index + 1}`} className="mb-6 shadow-2xl bg-white">
                                       <Page
                                           pageNumber={index + 1}
                                           width={Math.min(window.innerWidth * 0.45, 800)}
                                           renderTextLayer={true}
                                           renderAnnotationLayer={true}
                                       />
                                   </div>
                               ))}
                            </Document>
                         )}
                      </div>
                  ) : (
                     <div className="flex items-center justify-center h-full text-slate-400">
                        {t.selectDocumentToView}
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div >
   );
};
