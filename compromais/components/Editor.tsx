
import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Download, FileText, Check, ChevronRight, Wand2, ArrowLeft, Eye, Undo, Redo, MoreHorizontal, Trash2, Plus, X, ListChecks, Maximize2, Split, ArrowUp, ArrowDown, ArrowRight, ExternalLink, Edit2, RefreshCw, AlertCircle } from 'lucide-react';
import { Language, DocumentSection, PlaceholderSuggestion, Dossier, DossierStatus } from '../types';
import { TRANSLATIONS, MOCK_SECTIONS } from '../constants';
import { api } from '../services/api';

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface EditorProps {
    lang: Language;
    onBack: (dossierId?: string) => void;
}

const NAME_PLACEHOLDERS = [
    'seller_firstname', 'seller_lastname',
    'buyer1_firstname', 'buyer1_lastname',
    'buyer2_firstname', 'buyer2_lastname'
];

export const Editor: React.FC<EditorProps> = ({ lang, onBack }) => {
    const { id } = useParams<{ id: string }>();
    const t = TRANSLATIONS[lang];
    const [dossier, setDossier] = useState<Dossier | undefined>(undefined);
    const [sections, setSections] = useState<DocumentSection[]>([]);
    const [sidebarMode, setSidebarMode] = useState<'none' | 'ai' | 'checklist'>('none');
    const [splitScreen, setSplitScreen] = useState<boolean>(false);
    const [activePlaceholderId, setActivePlaceholderId] = useState<string | null>(null);
    const [selectedSourceDoc, setSelectedSourceDoc] = useState<{ name: string, path?: string, bronText?: string, placeholderLabel?: string, currentValue?: string, paginaNummer?: number | null } | null>(null);
    const [editingPlaceholder, setEditingPlaceholder] = useState<{ sectionId: string, placeholderId: string } | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [numPages, setNumPages] = useState<number | null>(null);

    // AI Chat state
    const [chatMessages, setChatMessages] = useState<{role: 'user'|'model', content: string}[]>([
        { role: 'model', content: "Hallo! Ik ben je AI Copilot. Stel me gerust vragen over deze compromis of de onderliggende documenten." }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Initial Load
    useEffect(() => {
        const fetchVersion = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const ver: any = await api.getVersion(id);
                // We mock a minimalist dossier object for the header part
                setDossier({
                    id: ver.dossier_ui_id || ver.ui_id,
                    name: "Verkoopovereenkomst",
                    status: ver.dossier_status,
                    documents: ver.dossier_documents || []
                } as any);

                if (ver.path) {
                    setSelectedSourceDoc({ name: ver.number, path: ver.path });
                }

                if (ver.sections) {
                    setSections(ver.sections);
                }
                setIsInitialized(true);
            } catch (error) {
                console.error("Failed to fetch version", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVersion();
    }, [id]);

    // Chat Auto-scroll
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages]);

    // Save on Change (Debounced or explicit)
    // For simplicity in this demo, we save when sections change but maybe we should add a save button
    const isArchived = dossier?.status === DossierStatus.ARCHIVED;

    const handleSave = async (updatedSections?: DocumentSection[]) => {
        if (!id || !isInitialized || isArchived) return;
        try {
            await api.updateVersion(id, updatedSections || sections);
            // Show some success toast maybe
        } catch (error) {
            console.error("Failed to save version:", error);
        }
    };

    // Helper to get total validation status
    const totalPlaceholders = sections.flatMap(s => s.placeholders).length;
    const approvedPlaceholders = sections.flatMap(s => s.placeholders).filter(p => p.isApproved).length;
    const progress = Math.round((approvedPlaceholders / totalPlaceholders) * 100);

    const toggleApproveSection = (sectionId: string) => {
        if (isArchived) return;
        const updatedSections = sections.map(s => {
            if (s.id === sectionId) {
                const newApprovedState = !s.isApproved;
                return {
                    ...s,
                    isApproved: newApprovedState,
                    placeholders: s.placeholders.map(p => ({ ...p, isApproved: newApprovedState }))
                };
            }
            return s;
        });
        setSections(updatedSections);
        handleSave(updatedSections);
    };

    const removeSection = (sectionId: string) => {
        if (isArchived) return;
        if (window.confirm(t.deleteSectionConfirm)) {
            setSections(prev => prev.filter(s => s.id !== sectionId));
        }
    };

    const addSection = () => {
        if (isArchived) return;
        const newId = `section-${Date.now()}`;
        setSections(prev => [
            ...prev,
            {
                id: newId,
                title: 'Nieuwe Sectie',
                content: '',
                placeholders: [],
                isApproved: false
            }
        ]);
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        if (isArchived) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === sections.length - 1) return;

        const newSections = [...sections];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
        setSections(newSections);
    };

    const toggleApprovePlaceholder = (sectionId: string, placeholderId: string) => {
        if (isArchived) return;
        const updatedSections = sections.map(s => {
            if (s.id !== sectionId) return s;
            return {
                ...s,
                placeholders: s.placeholders.map(p => p.id === placeholderId ? { ...p, isApproved: !p.isApproved } : p)
            };
        });
        setSections(updatedSections);
        handleSave(updatedSections);
    };

    const updatePlaceholderValue = async (sectionId: string, placeholderId: string, newValue: string) => {
        if (isArchived) return;
        const updatedSections = sections.map(s => {
            if (s.id !== sectionId) return s;
            return {
                ...s,
                placeholders: s.placeholders.map(p => p.id === placeholderId ? { ...p, currentValue: newValue } : p)
            };
        });
        setSections(updatedSections);
        setEditingPlaceholder(null);

        // Immediate Save
        if (id) {
            try {
                await api.updateVersion(id, updatedSections);
            } catch (error) {
                console.error("Failed to save placeholder update:", error);
            }
        }
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim() || isChatLoading) return;

        const newUserMsg = { role: 'user' as const, content: chatInput.trim() };
        const newMessages = [...chatMessages, newUserMsg];
        setChatMessages(newMessages);
        setChatInput('');
        setIsChatLoading(true);

        try {
            // Build Context
            let contextContext = "HUIDIGE INHOUD VAN HET DOCUMENT:\n\n";
            sections.forEach(s => {
                contextContext += `--- Sectie: ${s.title} ---\n`;
                let contentCopy = s.content || '';
                s.placeholders.forEach(p => {
                     // create placeholder tags to match the ones in content
                     const tag1 = `[[${p.id}]]`;
                     const tag2 = `[placeholder:${p.id}]`;
                     const val = p.currentValue ? `[${p.currentValue}]` : '[LEEG]';
                     contentCopy = contentCopy.split(tag1).join(val).split(tag2).join(val);
                });
                contextContext += contentCopy + "\n\n";
            });
            
            contextContext += "EXTRACTIES UIT BRONDOCUMENT(EN):\n";
            sections.flatMap(s => s.placeholders).forEach(p => {
                 if (p.bronText) {
                      contextContext += `- ${p.label} (${p.id}): '${p.currentValue}' | Originele bron tekst: '${p.bronText}'\n`;
                 } else if (p.currentValue) {
                      contextContext += `- ${p.label} (${p.id}): '${p.currentValue}'\n`;
                 }
            });

            let currentAssistantMessage = "";
            let firstChunkReceived = false;
            
            await api.streamChatWithAi(newMessages, contextContext, (chunk) => {
                if (!firstChunkReceived) {
                    firstChunkReceived = true;
                    // Hide the bouncing dots immediately when the first word streams in
                    setIsChatLoading(false);
                    currentAssistantMessage += chunk;
                    // Append the message bubble
                    setChatMessages(prev => [...prev, { role: 'model', content: currentAssistantMessage }]);
                } else {
                    currentAssistantMessage += chunk;
                    setChatMessages(prev => {
                        const newArr = [...prev];
                        // Update the last bubble
                        newArr[newArr.length - 1] = { role: 'model', content: currentAssistantMessage };
                        return newArr;
                    });
                }
            });
            
            // Fallback in case the stream ended successfully without any chunks
            if (!firstChunkReceived) {
                setIsChatLoading(false);
                setChatMessages(prev => [...prev, { role: 'model', content: 'Geen antwoord ontvangen.' }]);
            }

        } catch (error) {
            console.error("AI Chat error:", error);
            setChatMessages(prev => {
                const newArr = [...prev];
                const last = newArr[newArr.length - 1];
                if (last.role === 'model' && !last.content) {
                    last.content = "Oeps, er ging iets mis bij het ophalen van een antwoord. Controleer de netwerkverbinding of de API instellingen.";
                } else {
                    newArr.push({ role: 'model', content: "Oeps, er ging iets mis bij het ophalen van een antwoord. Controleer de netwerkverbinding of de API instellingen." });
                }
                return newArr;
            });
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleSourceClick = (placeholderId: string) => {
        setActivePlaceholderId(placeholderId);

        const placeholder = sections.flatMap(s => s.placeholders).find(p => p.id === placeholderId);
        if (placeholder) {
            // First try the new document metadata logic
            if (placeholder.documentPad || placeholder.documentNaam) {
                // Determine path.
                const pathStr = placeholder.documentPad || '';
                const filename = pathStr.split('/').pop() || pathStr;
                
                // Use the new preview endpoint allowing inline viewing of DOCX files as PDF
                let relativeUrl = pathStr.startsWith('http') ? pathStr : `/api/documents/preview/${filename}`;

                // Chrome's PDF viewer requires the URL to end in .pdf to process the #search hash
                // We append a pseudo .pdf extension so it forces the PDF-viewer behavior
                if (!relativeUrl.toLowerCase().endsWith('.pdf') && !pathStr.startsWith('http')) {
                    relativeUrl += '.pdf';
                }

                if (placeholder.bronText || placeholder.currentValue) {
                    const textToSearch = placeholder.bronText || placeholder.currentValue;
                    let cleanText = textToSearch.replace(/['"]/g, '');
                    
                    const words = cleanText.split(/\s+/);
                    if (words.length > 3) {
                        cleanText = words.slice(0, 3).join(' ');
                    }
                    
                    // Chrome PDF native viewer matches exact phrases better with wrapped quotes
                    const searchParam = encodeURIComponent(`"${cleanText}"`);
                    
                    if (placeholder.paginaNummer) {
                        relativeUrl += `#page=${placeholder.paginaNummer}&search=${searchParam}`;
                    } else {
                        relativeUrl += `#search=${searchParam}`;
                    }
                }

                setSelectedSourceDoc({ 
                    name: placeholder.documentNaam || 'Brondocument', 
                    path: relativeUrl,
                    bronText: placeholder.bronText || '',
                    placeholderLabel: placeholder.label,
                    currentValue: placeholder.currentValue,
                    paginaNummer: placeholder.paginaNummer
                });
                setSplitScreen(true);
                setSidebarMode('none');
                return;
            }

            // Fallback to old behavior if no new data exists
            if (placeholder.sourceDoc && dossier?.documents) {
                const doc = dossier.documents.find(d => d.name === placeholder.sourceDoc);
                if (doc) {
                    setSelectedSourceDoc({ 
                        name: doc.name, 
                        path: doc.path,
                        placeholderLabel: placeholder.label
                    });
                }
            }
        }

        setSplitScreen(true);
        setSidebarMode('none');
    };

    const handleExport = async (format: 'pdf' | 'docx' = 'pdf') => {
        if (!id) return;
        if (progress < 100) {
            if (!window.confirm(t.warningUnapproved)) return;
        }

        try {
            // Save first ensuring backend has latest
            // However, handleSave is async but we need to wait. 
            // In a real app we'd await this.handleSave() but handleSave is defined inside render cycle (ok)
            // But it relies on state 'sections'. 
            await api.updateVersion(id, sections);

            await api.exportVersion(id, format);
        } catch (error) {
            console.error(error);
            alert('Export failed. Please check backend logs.');
        }
    };

    const handleContentEdit = async (sectionId: string, newContent: string) => {
        if (isArchived) return;
        const updatedSections = sections.map(s => s.id === sectionId ? { ...s, content: newContent } : s);
        setSections(updatedSections);

        if (id) {
            try {
                await api.updateVersion(id, updatedSections);
            } catch (error) {
                console.error("Failed to save content edit:", error);
            }
        }
    };

    const handleTitleEdit = (sectionId: string, newTitle: string) => {
        if (isArchived) return;
        setSections(prev => prev.map(s => s.id === sectionId ? { ...s, title: newTitle } : s));
    };

    const handleContentBlur = (sectionId: string, event: React.FocusEvent<HTMLDivElement>) => {
        const container = event.currentTarget;
        let content = "";

        // Improved reconstruction to avoid losing tags
        container.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                content += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node as HTMLElement;
                // Look for placeholder ID in the element or its children (in case of browser nesting)
                const placeholderId = el.getAttribute('data-placeholder-id') || el.querySelector('[data-placeholder-id]')?.getAttribute('data-placeholder-id');
                if (placeholderId) {
                    content += `[placeholder:${placeholderId}]`;
                } else if (el.tagName === 'BR') {
                    content += '\n';
                } else {
                    content += el.innerText;
                }
            }
        });

        // Only call edit if content actually changed to avoid redundant saves
        const currentSection = sections.find(s => s.id === sectionId);
        if (currentSection && currentSection.content !== content) {
            handleContentEdit(sectionId, content);
        }
    };

    // Render a placeholder chip within text
    const renderPlaceholder = (section: DocumentSection, p: PlaceholderSuggestion) => {
        const isEditing = editingPlaceholder?.sectionId === section.id && editingPlaceholder?.placeholderId === p.id;

        if (isEditing) {
            return (
                <span key={p.id} data-placeholder-id={p.id} className="inline-block align-baseline mx-1" contentEditable={false}>
                    <input
                        autoFocus
                        type="text"
                        defaultValue={p.currentValue}
                        className="px-2 py-1 rounded-md border-2 border-brand-500 bg-white dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-4 focus:ring-brand-100 w-40 shadow-lg text-brand-700"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') updatePlaceholderValue(section.id, p.id, e.currentTarget.value);
                            if (e.key === 'Escape') setEditingPlaceholder(null);
                        }}
                        onBlur={(e) => updatePlaceholderValue(section.id, p.id, e.currentTarget.value)}
                        onClick={(e) => e.stopPropagation()}
                    />
                </span>
            );
        }

        return (
            <span
                key={p.id}
                data-placeholder-id={p.id}
                className={`
                    inline-block align-baseline relative group/placeholder mx-1 px-2 py-0.5 rounded-md border-2 transition-all duration-300 cursor-pointer select-none
                    ${p.isApproved 
                        ? 'bg-green-50 border-green-200 hover:border-green-400 text-green-700 dark:bg-green-900/10 dark:border-green-800' 
                        : 'bg-orange-50 border-orange-200 border-dashed hover:border-orange-400 text-orange-700 dark:bg-orange-900/10 dark:border-orange-800 animate-pulse-subtle'
                    }
                `}
                contentEditable={false}
                onDoubleClick={() => !isArchived && setEditingPlaceholder({ sectionId: section.id, placeholderId: p.id })}
            >
                {/* The Value */}
                <span className="text-sm font-bold flex items-center gap-1">
                    {p.isApproved ? <Check className="w-3 h-3 text-green-500" /> : <AlertCircle className="w-3 h-3 text-orange-500" />}
                    {p.currentValue || <span className="italic opacity-50">Leeg</span>}
                </span>

                {/* Tooltip / Controls */}
                <div className="hidden group-hover/placeholder:flex absolute bottom-full left-1/2 -translate-x-1/2 w-64 pb-2 z-[100] flex-col items-center animate-in fade-in zoom-in-95 duration-150">
                    <div className="w-full bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-800 p-2 flex flex-col gap-2 relative ring-1 ring-black/5">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{p.label}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${p.isApproved ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                {p.isApproved ? t.statusApproved : t.statusForReview}
                            </span>
                        </div>
                        
                        <div className="flex gap-2 items-center">
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSourceClick(p.id); }}
                                className="flex-1 flex items-center justify-center px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-300"
                            >
                                <Eye className="w-3.5 h-3.5 mr-1.5" /> {t.source}
                            </button>
                            {!isArchived && (
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleApprovePlaceholder(section.id, p.id); }}
                                    className={`flex-1 flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-md active:scale-95
                                        ${p.isApproved ? 'bg-red-500 hover:bg-red-600 shadow-red-500/10' : 'bg-green-600 hover:bg-green-700 shadow-green-500/10'}
                                    `}
                                >
                                    {p.isApproved ? <X className="w-3.5 h-3.5 mr-1.5" /> : <Check className="w-3.5 h-3.5 mr-1.5" />}
                                    {p.isApproved ? t.reject : t.approve}
                                </button>
                            )}
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white dark:border-t-slate-900"></div>
                    </div>
                </div>
            </span>
        );
    };

    // Content renderer that handles text editing AND placeholders
    // For the prototype, we assume "editable" means the user can edit the TEXT parts.
    // Rendering ContentEditable mixed with React Components is complex (Draft.js/Slate).
    // Strategy: 
    // We render a contentEditable div.
    // BUT the placeholders are chips.
    // Simple hack: We use a non-editable container with overlay? No.
    // We just use a div with text.
    // The user interaction "Edit everything" is best served by a contentEditable div where we inject the spans.
    // But updating state from that is hard.
    // FOR NOW: We will use a split approach. 
    // The text is rendered as spans.
    // "Real editor" implies you can click and type anywhere. 
    // To support this fully in a demo without a heavy library:
    // We will make the section contentEditable.
    // We'll trust the user not to break the HTML structure of the placeholders too much.

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-slate-950 h-full">
                <RefreshCw className="w-10 h-10 animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] animate-in fade-in duration-500">

            {/* Top Toolbar */}
            <div className="h-14 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => onBack(dossier?.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    {!isArchived && (
                        <button onClick={handleSave} className="flex items-center px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg text-sm font-bold transition-all border border-brand-200">
                            <Save className="w-4 h-4 mr-2" />
                            {t.save}
                        </button>
                    )}
                    <div className="flex items-center gap-2">
                        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1 mr-2">
                            <button
                                onClick={() => handleExport('docx')}
                                className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-600 rounded-md transition-all text-xs font-medium flex items-center gap-1"
                                title="Export to Word"
                            >
                                <FileText className="w-4 h-4" /> DOCX
                            </button>
                            <div className="w-[1px] bg-slate-300 dark:bg-slate-600 mx-1"></div>
                            <button
                                onClick={() => handleExport('pdf')}
                                className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-600 rounded-md transition-all text-xs font-medium flex items-center gap-1"
                                title="Export to PDF"
                            >
                                <Download className="w-4 h-4" /> PDF
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center mr-4 bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-slate-700">
                        <div className="text-xs font-medium mr-3 text-slate-500">{progress}{t.percentComplete}</div>
                        <div className="w-24 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            const newMode = sidebarMode === 'checklist' ? 'none' : 'checklist';
                            setSidebarMode(newMode);
                            if (newMode !== 'none') setSplitScreen(false);
                        }}
                        className={`p-2 rounded-lg transition-colors border ${sidebarMode === 'checklist' ? 'bg-brand-50 border-brand-200 text-brand-700' : 'border-transparent hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                        title={t.validationChecklist}
                    >
                        <ListChecks className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => {
                            const newMode = sidebarMode === 'ai' ? 'none' : 'ai';
                            setSidebarMode(newMode);
                            if (newMode !== 'none') setSplitScreen(false);
                        }}
                        className={`p-2 rounded-lg transition-colors border ${sidebarMode === 'ai' ? 'bg-brand-50 border-brand-200 text-brand-700' : 'border-transparent hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                        title={t.aiAssistant}
                    >
                        <Wand2 className="w-5 h-5" />
                    </button>


                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex min-h-0 bg-gray-100 dark:bg-slate-950 relative overflow-hidden">

                {/* Document Area */}
                <div className="flex-1 overflow-y-auto p-12 transition-all duration-300 bg-slate-200 dark:bg-slate-950/50">
                    <div className="flex flex-col items-center gap-12 pb-24">
                        {Array.from({ length: Math.ceil(sections.length / 3) || 1 }).map((_, pageIndex) => (
                            <div key={pageIndex} className="max-w-[850px] w-full h-fit min-h-[1100px] bg-white dark:bg-slate-900 shadow-2xl border border-gray-200 dark:border-slate-800 p-16 text-slate-900 dark:text-slate-100 font-serif leading-relaxed relative ring-1 ring-slate-100 dark:ring-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {pageIndex === 0 && (
                                    <div className="text-center font-bold text-2xl uppercase border-b-2 border-slate-900 dark:border-slate-100 pb-4 mb-10">
                                        {dossier?.name || t.newCompromis}
                                    </div>
                                )}

                                <div className="space-y-12">
                                    {sections.slice(pageIndex * 3, (pageIndex * 3) + 3).map((section, subIndex) => {
                                        const globalIndex = (pageIndex * 3) + subIndex;
                                        return (
                                            <div key={section.id} className="group/section relative border border-transparent hover:border-dashed hover:border-blue-400 rounded-xl p-6 -m-6 transition-all hover:bg-blue-50/50 dark:hover:bg-blue-900/10">

                                                {/* Floating Actions */}
                                                {!isArchived && (
                                                    <div className="absolute -top-3 -right-2 flex gap-1 opacity-0 group-hover/section:opacity-100 transition-all bg-white dark:bg-slate-900 shadow-lg border border-gray-100 dark:border-slate-700 rounded-lg p-1 scale-90 hover:scale-100 z-10">
                                                    <button onClick={() => moveSection(globalIndex, 'up')} disabled={globalIndex === 0} className="p-1.5 text-slate-400 hover:text-brand-500 disabled:opacity-30 rounded hover:bg-gray-50">
                                                        <ArrowUp className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => moveSection(globalIndex, 'down')} disabled={globalIndex === sections.length - 1} className="p-1.5 text-slate-400 hover:text-brand-500 disabled:opacity-30 rounded hover:bg-gray-50">
                                                        <ArrowDown className="w-4 h-4" />
                                                    </button>
                                                    <div className="w-px bg-gray-200 mx-1"></div>
                                                    {section.placeholders.length > 0 && (
                                                        <button onClick={() => toggleApproveSection(section.id)} className={`p-1.5 rounded hover:bg-gray-50 ${section.isApproved ? 'text-green-500' : 'text-slate-400 hover:text-green-500'}`}>
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button onClick={() => removeSection(section.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-gray-50">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                )}

                                                {/* Editable Title */}
                                                <div
                                                    className={`font-bold text-lg mb-3 uppercase flex items-center border-b border-gray-100 dark:border-slate-800 pb-2 outline-none ${!isArchived ? 'focus:border-brand-300' : ''}`}
                                                    contentEditable={!isArchived}
                                                    suppressContentEditableWarning
                                                    onBlur={(e) => handleTitleEdit(section.id, e.currentTarget.innerText)}
                                                >
                                                    {section.title}
                                                    {section.placeholders.length > 0 && section.isApproved && <Check className="w-4 h-4 text-green-500 ml-2" contentEditable={false} />}
                                                </div>

                                                {/* Editable Content Area */}
                                                <div
                                                    className={`text-base text-justify text-slate-700 dark:text-slate-300 outline-none rounded p-1 -ml-1 min-h-[1.5em] whitespace-pre-wrap ${!isArchived ? 'focus:ring-2 focus:ring-brand-100' : ''}`}
                                                    contentEditable={!editingPlaceholder && !isArchived}
                                                    suppressContentEditableWarning
                                                    onBlur={(e) => handleContentBlur(section.id, e)}
                                                >
                                                    {(section.content || '').split(/(\[\[[A-Za-z0-9_]+\]\]|\[placeholder:[A-Za-z0-9_]+\])/g).map((part, i) => {
                                                        const match = part.match(/\[\[([A-Za-z0-9_]+)\]\]|\[placeholder:([A-Za-z0-9_]+)\]/);
                                                        if (match) {
                                                            const placeholderId = match[1] || match[2];
                                                            const p = section.placeholders.find(ph => ph.id === placeholderId);
                                                            if (p) return renderPlaceholder(section, p);
                                                        }
                                                        return <span key={`${section.id}-part-${i}`}>{part}</span>;
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Page Number Footer */}
                                <div className="absolute bottom-8 left-0 right-0 text-center text-slate-400 text-sm font-sans select-none">
                                    Pagina {pageIndex + 1}
                                </div>
                            </div>
                        ))}

                        {/* Add Section Button */}
                        {!isArchived && (
                            <div className="flex justify-center py-8 opacity-40 hover:opacity-100 transition-opacity">
                                <button
                                    onClick={addSection}
                                    className="flex items-center px-6 py-3 bg-white dark:bg-slate-800 rounded-full text-slate-500 hover:text-brand-500 text-sm border-2 border-dashed border-slate-300 hover:border-brand-400 hover:shadow-md transition-all"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t.addSectionBtn || 'Voeg nieuwe sectie toe'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Split Screen Source Viewer */}
                {splitScreen && (
                    <div className="flex-1 border-l border-gray-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex flex-col animate-in slide-in-from-right duration-300 shadow-xl z-20">
                        <div className="h-10 flex items-center justify-between px-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shrink-0">
                            <div className="flex items-center">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center mr-3">
                                    <FileText className="w-3 h-3 mr-2" />
                                    {selectedSourceDoc ? `${t.source}: ${selectedSourceDoc.name}` : (activePlaceholderId && NAME_PLACEHOLDERS.includes(activePlaceholderId)
                                            ? t.sourceIdCard
                                            : t.sourceDocument)}
                                </span>
                                <button
                                    onClick={() => selectedSourceDoc?.path && window.open(selectedSourceDoc.path, '_blank')}
                                    className="p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors"
                                    title={t.openInBrowser}
                                >
                                    <ExternalLink className="w-3 h-3" />
                                </button>
                            </div>
                            <button onClick={() => setSplitScreen(false)} className="text-slate-400 hover:text-slate-900 hover:bg-gray-100 rounded p-1">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden bg-slate-100 dark:bg-slate-950">
                            <div className="w-full h-full bg-white shadow-lg flex flex-col items-center justify-center text-slate-300 border border-gray-200 overflow-hidden relative group">
                                {selectedSourceDoc?.path ? (
                                    <div className="w-full h-full overflow-y-auto bg-slate-200 flex flex-col items-center py-6">
                                        <Document
                                            file={selectedSourceDoc.path}
                                            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                            loading={<div className="p-4 text-slate-500 font-medium flex items-center"><RefreshCw className="animate-spin w-4 h-4 mr-2"/> {t.documentLoading}</div>}
                                            error={<div className="p-4 text-red-500 font-medium">{t.documentLoadError}</div>}
                                        >
                                            {Array.from(new Array(numPages || 0), (el, index) => (
                                                <div key={`page_${index + 1}`} className="mb-6 shadow-2xl bg-white">
                                                    <Page 
                                                        pageNumber={index + 1} 
                                                        width={Math.min(window.innerWidth * 0.45, 800)}
                                                        renderTextLayer={true}
                                                        renderAnnotationLayer={true}
                                                        onRenderSuccess={() => {
                                                            setTimeout(() => {
                                                                const marks = document.querySelectorAll('.react-pdf__Page mark');
                                                                if (marks.length > 0) {
                                                                    marks[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                                }
                                                            }, 300);
                                                        }}
                                                        customTextRenderer={textItem => {
                                                            const { bronText, currentValue, paginaNummer } = selectedSourceDoc;
                                                            // Only highlight if we are on the exact specified page (if known)
                                                            if (paginaNummer && paginaNummer !== (index + 1)) return textItem.str;
                                                            
                                                            const textToSearch = currentValue?.trim() || bronText?.trim();
                                                            if (!textToSearch || textToSearch.length < 2) return textItem.str;
                                                            
                                                            // Highlight the exact value (or exact full sentence fallback)
                                                            const regex = new RegExp(`(${textToSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                                                            return textItem.str.replace(regex, '<mark class="bg-yellow-300 font-bold px-1 rounded shadow-sm text-black">$1</mark>');
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </Document>
                                    </div>
                                ) : activePlaceholderId && NAME_PLACEHOLDERS.includes(activePlaceholderId) ? (
                                    <div className="relative w-full h-full flex items-center justify-center bg-slate-200">
                                        <img
                                            src="/id_card_evidence.png"
                                            alt="Identity Card Proof"
                                            className="max-w-[90%] max-h-[90%] object-contain shadow-2xl rounded-lg border-4 border-white"
                                        />
                                        <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-slate-900/90 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-lg backdrop-blur-sm">
                                            <div className="text-xs font-bold text-slate-500 uppercase mb-1">{t.aiContextMapping}</div>
                                            <div className="text-sm text-slate-700 dark:text-slate-200">
                                                {t.aiContextFieldContent} <strong>{sections.flatMap(s => s.placeholders).find(p => p.id === activePlaceholderId)?.label}</strong> {t.aiContextMatchingId}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Fake PDF Lines as fallback */}
                                        <div className="absolute inset-0 p-8 space-y-4 opacity-50 pointer-events-none">
                                            {[...Array(20)].map((_, i) => (
                                                <div key={i} className="h-2 bg-slate-200 rounded w-full" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
                                            ))}
                                        </div>

                                        {/* Highlighted Area */}
                                        <div className="absolute top-1/4 left-10 right-10 h-24 bg-yellow-200/50 border-2 border-yellow-400 rounded flex items-center justify-center">
                                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-bold shadow-sm">{t.foundData}</span>
                                        </div>

                                        <span className="relative z-10 font-medium text-slate-400 bg-white/80 px-4 py-2 rounded-lg backdrop-blur-sm">{t.noSourceFound}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Sidebars */}
                {sidebarMode !== 'none' && (
                    <div className="shrink-0 w-80 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 shadow-2xl z-30 flex flex-col animate-in slide-in-from-right duration-300 relative">
                        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-slate-800 shrink-0">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center">
                                {sidebarMode === 'ai' ? <Wand2 className="w-4 h-4 mr-2 text-brand-600" /> : <ListChecks className="w-4 h-4 mr-2 text-brand-600" />}
                                {sidebarMode === 'ai' ? t.aiAssistant : t.validationChecklist}
                            </h3>
                            <button onClick={() => setSidebarMode('none')} className="text-slate-400 hover:text-slate-900 p-1 hover:bg-gray-100 rounded">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {sidebarMode === 'checklist' ? (
                                <div className="space-y-6">
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900 mb-4">
                                        <div className="text-sm font-bold text-green-800 dark:text-green-300 mb-1">Status: {progress}{t.percentComplete}</div>
                                        <div className="w-full h-1.5 bg-green-200 dark:bg-green-900 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>

                                    {sections.filter(s => s.placeholders.length > 0).map(s => (
                                        <div key={s.id} className="space-y-2">
                                            <div className="flex items-center justify-between font-medium text-sm text-slate-700 dark:text-slate-200">
                                                {s.title}
                                                {s.isApproved ? <Check className="w-4 h-4 text-green-600" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div>}
                                            </div>
                                            <div className="pl-3 space-y-1 border-l-2 border-gray-100 dark:border-slate-800 ml-1">
                                                {s.placeholders
                                                    .filter((v, i, a) => a.findIndex(t => t.label === v.label) === i)
                                                    .map(p => {
                                                        const group = s.placeholders.filter(t => t.label === p.label);
                                                        const isAllApproved = group.every(t => t.isApproved);
                                                        
                                                        return (
                                                            <div key={p.label} className="flex items-center justify-between text-xs py-1 hover:bg-gray-50 dark:hover:bg-slate-800 px-2 rounded cursor-pointer" onClick={() => setActivePlaceholderId(p.id)}>
                                                                <span className={isAllApproved ? "text-slate-500 line-through decoration-green-500" : "text-slate-600 font-medium"}>{p.label}</span>
                                                                {isAllApproved ? <Check className="w-3 h-3 text-green-500" /> : <div className="w-3 h-3 rounded-full border border-slate-300"></div>}
                                                            </div>
                                                        );
                                                    })
                                                }
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // AI Chat Interface
                                <div className="flex flex-col h-full">
                                    <div className="flex-1 space-y-4 mb-4 overflow-y-auto pr-2 pb-2">
                                        {chatMessages.map((msg, i) => (
                                            msg.role === 'model' ? (
                                                <div key={i} className="flex gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                                                        <Wand2 className="w-4 h-4 text-brand-600" />
                                                    </div>
                                                    <div className="bg-gray-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none text-sm text-slate-700 dark:text-slate-300 shadow-sm whitespace-pre-wrap">
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div key={i} className="flex gap-3 flex-row-reverse">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                                        <span className="text-xs font-bold text-slate-600">ME</span>
                                                    </div>
                                                    <div className="bg-brand-600 text-white p-3 rounded-2xl rounded-tr-none text-sm shadow-sm whitespace-pre-wrap">
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                        
                                        {isChatLoading && (
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                                                    <Wand2 className="w-4 h-4 text-brand-600" />
                                                </div>
                                                <div className="bg-gray-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none text-sm text-slate-700 dark:text-slate-300 shadow-sm">
                                                    <div className="flex space-x-1 items-center h-4 py-2">
                                                        <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce"></div>
                                                        <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                        <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>
                                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 pb-2">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSendMessage();
                                                }}
                                                placeholder="Stel een vraag of geef een opdracht..."
                                                className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-3 pr-10 text-sm bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                                            />
                                            <button 
                                                onClick={handleSendMessage}
                                                disabled={isChatLoading || !chatInput.trim()}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:hover:bg-brand-600 transition-colors"
                                            >
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
