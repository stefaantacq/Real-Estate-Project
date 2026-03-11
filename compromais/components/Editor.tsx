
import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Download, FileText, Check, ChevronRight, Wand2, ArrowLeft, Eye, Undo, Redo, MoreHorizontal, Trash2, Plus, X, ListChecks, Maximize2, Split, ArrowUp, ArrowDown, ArrowRight, ExternalLink, Edit2, RefreshCw, AlertCircle } from 'lucide-react';
import { Language, DocumentSection, PlaceholderSuggestion, Dossier, DossierStatus } from '../types';
import { TRANSLATIONS, MOCK_SECTIONS, SUPPORTED_PLACEHOLDERS } from '../constants';
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
    const currentVersionId = useRef<string | null>(id || null);
    const t = TRANSLATIONS[lang];
    const [dossier, setDossier] = useState<Dossier | undefined>(undefined);
    const [sections, setSections] = useState<DocumentSection[]>([]);
    const [history, setHistory] = useState<DocumentSection[][]>([]);
    const [future, setFuture] = useState<DocumentSection[][]>([]);

    const updateSections = (updater: DocumentSection[] | ((prev: DocumentSection[]) => DocumentSection[])) => {
        setSections(prev => {
            const newSections = typeof updater === 'function' ? updater(prev) : updater;
            if (JSON.stringify(prev) !== JSON.stringify(newSections)) {
                setHistory(h => [...h, prev]);
                setFuture([]); // Clear future on new action
            }
            return newSections;
        });
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        // Bump all contentEditable render keys so React fully remounts the divs
        // instead of trying to patch a user-modified DOM. Without this, undoing
        // content changes throws a NotFoundError in the reconciler.
        sections.forEach(s => {
            contentRenderKeys.current[s.id] = (contentRenderKeys.current[s.id] || 0) + 1;
        });
        setSections(currentSections => {
            if (history.length === 0) return currentSections;
            const newHistory = [...history];
            const previousState = newHistory.pop()!;
            setHistory(newHistory);
            setFuture(f => [...f, currentSections]);
            return previousState;
        });
    };

    const handleRedo = () => {
        if (future.length === 0) return;
        sections.forEach(s => {
            contentRenderKeys.current[s.id] = (contentRenderKeys.current[s.id] || 0) + 1;
        });
        setSections(currentSections => {
            if (future.length === 0) return currentSections;
            const newFuture = [...future];
            const nextState = newFuture.pop()!;
            setFuture(newFuture);
            setHistory(h => [...h, currentSections]);
            return nextState;
        });
    };

    const [sidebarMode, setSidebarMode] = useState<'none' | 'ai' | 'checklist'>('none');
    const [splitScreen, setSplitScreen] = useState<boolean>(false);
    const [activePlaceholderId, setActivePlaceholderId] = useState<string | null>(null);
    const [selectedSourceDoc, setSelectedSourceDoc] = useState<{ name: string, path?: string, bronText?: string, placeholderLabel?: string, currentValue?: string, paginaNummer?: number | null } | null>(null);
    const [editingPlaceholder, setEditingPlaceholder] = useState<{ sectionId: string, placeholderId: string, partIndex?: number } | null>(null);
    const [isCurrentVersion, setIsCurrentVersion] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [suggestionState, setSuggestionState] = useState<{
        active: boolean;
        query: string;
        sectionId: string | null;
    }>({ active: false, query: '', sectionId: null });

    // AI Chat state
    const [chatMessages, setChatMessages] = useState<{role: 'user'|'model', content: string}[]>([
        { role: 'model', content: "Hallo! Ik ben je AI Copilot. Stel me gerust vragen over deze compromis of de onderliggende documenten." }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    // Per-section render version counter. Incremented after each state-driven content
    // update so the contentEditable div gets a new key and React fully re-mounts it
    // instead of trying to patch a DOM that was already modified by the user's typing.
    const contentRenderKeys = useRef<Record<string, number>>({});

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
                    setHistory([]);
                    setFuture([]);
                }
                if (ver) {
                    setIsCurrentVersion(ver.is_current === 1 || ver.is_current === true);
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
    const isReadOnly = isArchived || !isCurrentVersion;

    const handleSave = async (force: boolean = false) => {
        if (!currentVersionId.current || !isInitialized || (!force && isReadOnly)) return;
        try {
            const result: any = await api.updateVersion(currentVersionId.current, sections);
            if (result && result.new_ui_id) {
                currentVersionId.current = result.new_ui_id;
                // Update URL silently so refresh loads the correct version
                window.history.replaceState(null, '', `#/editor/${result.new_ui_id}`);
                setIsCurrentVersion(true);
            }
        } catch (error) {
            console.error("Failed to save version:", error);
        }
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    handleRedo();
                } else {
                    handleUndo();
                }
            } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
                e.preventDefault();
                handleRedo();
            } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                handleSave();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [history, future, sections, isInitialized, isReadOnly, id]);

    // Helper to get total validation status
    const totalPlaceholders = sections.flatMap(s => s.placeholders).length;
    const approvedPlaceholders = sections.flatMap(s => s.placeholders).filter(p => p.isApproved).length;
    const progress = Math.round((approvedPlaceholders / totalPlaceholders) * 100);

    const toggleApproveSection = (sectionId: string) => {
        if (isReadOnly) return;
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
        updateSections(updatedSections);
    };

    const removeSection = (sectionId: string) => {
        if (isReadOnly) return;
        if (window.confirm(t.deleteSectionConfirm)) {
            updateSections(prev => prev.filter(s => s.id !== sectionId));
        }
    };

    const addSection = () => {
        if (isReadOnly) return;
        const newId = `section-${Date.now()}`;
        updateSections(prev => [
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
        if (isReadOnly) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === sections.length - 1) return;

        const newSections = [...sections];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
        updateSections(newSections);
    };

    const toggleApprovePlaceholder = (sectionId: string, placeholderId: string) => {
        if (isReadOnly) return;
        
        // Find the source placeholder to get its current state and metadata
        const triggerSection = sections.find(s => s.id === sectionId);
        const triggerPh = triggerSection?.placeholders.find(p => p.id === placeholderId);
        if (!triggerPh) return;

        const newApproved = !triggerPh.isApproved;
        const updatedPh = { ...triggerPh, isApproved: newApproved };

        // Sync EVERYTHING (metadata + new approval) across all sections
        const updatedSections = sections.map(s => {
            const newPlaceholders = s.placeholders.map(p =>
                p.id === placeholderId ? { ...updatedPh } : p
            );
            const allApproved = newPlaceholders.length > 0 && newPlaceholders.every(p => p.isApproved);
            return { ...s, placeholders: newPlaceholders, isApproved: allApproved };
        });
        updateSections(updatedSections);
    };

    const updatePlaceholderValue = async (sectionId: string, placeholderId: string, newValue: string) => {
        if (isReadOnly) return;

        // Find the original placeholder to preserve its metadata
        const triggerSection = sections.find(s => s.id === sectionId);
        const triggerPh = triggerSection?.placeholders.find(p => p.id === placeholderId);
        if (!triggerPh) return;

        const updatedPh = { ...triggerPh, currentValue: newValue };

        // Sync EVERYTHING (metadata + new value) across ALL sections
        const updatedSections = sections.map(s => {
            const newPlaceholders = s.placeholders.map(p =>
                p.id === placeholderId ? { ...updatedPh } : p
            );
            const allApproved = newPlaceholders.length > 0 && newPlaceholders.every(p => p.isApproved);
            return {
                ...s,
                placeholders: newPlaceholders,
                isApproved: allApproved
            };
        });
        updateSections(updatedSections);
        setEditingPlaceholder(null);
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
                    setSplitScreen(true);
                    setSidebarMode('none');
                    return;
                }
            }

            // No document linked — still open the panel and show what we know about the placeholder
            setSelectedSourceDoc({
                name: placeholder.label || placeholderId,
                path: undefined as any,
                bronText: placeholder.bronText || '',
                placeholderLabel: placeholder.label,
                currentValue: placeholder.currentValue,
            });
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
        if (isReadOnly) return;

        // Scan the new content for [[sleutel]] or [placeholder:sleutel] patterns
        const tagPattern = /\[\[([A-Za-z0-9_]+)\]\]|\[placeholder:([A-Za-z0-9_]+)\]/g;
        const referencedIds = new Set<string>();
        let m: RegExpExecArray | null;
        while ((m = tagPattern.exec(newContent)) !== null) {
            referencedIds.add(m[1] || m[2]);
        }

        // Defer until after the blur event fully completes, then bump the render key
        // so the contentEditable div is fully re-mounted with the correct state instead
        // of React trying to patch a DOM that was already modified by the user's typing.
        setTimeout(() => {
            contentRenderKeys.current[sectionId] = (contentRenderKeys.current[sectionId] || 0) + 1;
            updateSections(prev => {
                // Get all unique placeholders across the document
                const allUsedPlaceholders = prev.flatMap(s => s.placeholders);
                
                // For each unique ID, find the "best" instance (the one with the most metadata)
                const bestInstances: Record<string, PlaceholderSuggestion> = {};
                allUsedPlaceholders.forEach(p => {
                    const currentBest = bestInstances[p.id];
                    // A placeholder is "better" if it has document metadata (source reference)
                    if (!currentBest || (!currentBest.documentPad && p.documentPad)) {
                        bestInstances[p.id] = { ...p };
                    }
                });

                return prev.map(s => {
                    if (s.id !== sectionId) return s;
                    
                    // Rebuild placeholders for this section based on text content tags
                    let newSectionPlaceholders: PlaceholderSuggestion[] = [];
                    referencedIds.forEach(pid => {
                        // Check if we already have it in the section
                        const existing = s.placeholders.find(p => p.id === pid);
                        if (existing) {
                            // Even if it exists, ensure it has the latest metadata from 'bestInstances'
                            newSectionPlaceholders.push({ ...bestInstances[pid] });
                        } else if (bestInstances[pid]) {
                            // Inject from other sections
                            newSectionPlaceholders.push({ ...bestInstances[pid] });
                        }
                    });

                    // Keep any placeholders that might have been in the section but were missed by regex
                    // (safety measure, though regex should be primary)
                    s.placeholders.forEach(p => {
                        if (!newSectionPlaceholders.some(np => np.id === p.id)) {
                            // Only keep if it was actually in the sections before
                            // (we don't want to leak deleted placeholders forever, 
                            // but we MUST avoid losing data during an edit session)
                        }
                    });

                    return { ...s, content: newContent, placeholders: newSectionPlaceholders };
                });
            });
        }, 0);
    };

    const handlePlaceholderInput = (e: React.FormEvent<HTMLDivElement>, sectionId: string) => {
        if (isReadOnly) return;
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const node = range.startContainer;
        if (node.nodeType !== Node.TEXT_NODE) return;

        const textBeforeCursor = node.textContent?.slice(0, range.startOffset) || "";
        const lastDoubleBracket = textBeforeCursor.lastIndexOf('[[');

        if (lastDoubleBracket !== -1) {
            const query = textBeforeCursor.slice(lastDoubleBracket + 2).toLowerCase();
            if (!query.includes(']]')) {
                setSuggestionState({
                    active: true,
                    query,
                    sectionId
                });
                return;
            }
        }

        if (suggestionState.active) {
            setSuggestionState({ active: false, query: '', sectionId: null });
        }
    };

    const handleSelectPlaceholderInEditor = (placeholderId: string) => {
        if (!suggestionState.sectionId || !suggestionState.active) return;

        const sectionId = suggestionState.sectionId;
        const activeEl = document.activeElement as HTMLDivElement;
        if (!activeEl || !activeEl.isContentEditable) return;

        let content = "";
        activeEl.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                content += node.textContent || "";
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node as HTMLElement;
                const phId = el.getAttribute('data-placeholder-id') || el.querySelector('[data-placeholder-id]')?.getAttribute('data-placeholder-id');
                if (phId) content += `[placeholder:${phId}]`;
                else if (el.tagName === 'BR') content += '\n';
                else content += el.innerText;
            }
        });

        // We replace "[[query" with "[[placeholderId]]"
        const trigger = `[[${suggestionState.query}`;
        const lastIdx = content.lastIndexOf(trigger);
        if (lastIdx !== -1) {
            const newContent = content.slice(0, lastIdx) + `[[${placeholderId}]]` + content.slice(lastIdx + trigger.length);
            handleContentEdit(sectionId, newContent);
        }

        setSuggestionState({ active: false, query: '', sectionId: null });
    };



    const handleTitleEdit = (sectionId: string, newTitle: string) => {
        if (isReadOnly) return;
        updateSections(prev => prev.map(s => s.id === sectionId ? { ...s, title: newTitle } : s));
    };

    const handleContentBlur = (sectionId: string, event: React.FocusEvent<HTMLDivElement>) => {
        const container = event.currentTarget;
        let content = "";

        // Improved reconstruction to avoid losing tags
        container.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                content += node.textContent || "";
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

    const handleContentBeforeInput = (e: any) => {
        if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return;
        
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        
        const shakePlaceholder = (phId: string) => {
            const ph = document.querySelector(`[data-placeholder-id="${phId}"]`) as HTMLElement;
            if (ph) {
                ph.classList.remove('animate-shake');
                void ph.offsetWidth; // Force reflow
                ph.classList.add('animate-shake');
            }
        };

        const ranges = e.getTargetRanges ? e.getTargetRanges() : [selection.getRangeAt(0)];
        for (const range of ranges) {
            const fragment = range.cloneContents();
            const phInside = fragment.querySelector('[data-placeholder-id]');
            if (phInside) {
                e.preventDefault();
                const id = phInside.getAttribute('data-placeholder-id') || phInside.querySelector('[data-placeholder-id]')?.getAttribute('data-placeholder-id');
                if (id) shakePlaceholder(id);
                return;
            }
            
            let common = range.commonAncestorContainer;
            let directPlaceholder: HTMLElement | null = null;
            if (common.nodeType === Node.ELEMENT_NODE) {
                directPlaceholder = (common as HTMLElement).closest('[data-placeholder-id]');
            } else if (common.parentElement) {
                directPlaceholder = common.parentElement.closest('[data-placeholder-id]');
            }
            
            if (directPlaceholder) {
                e.preventDefault();
                const id = directPlaceholder.getAttribute('data-placeholder-id');
                if (id) shakePlaceholder(id);
                return;
            }

            // For collapsed ranges (cursor position), also check the adjacent sibling
            // to catch forward-delete operations (Ctrl+D / deleteContentForward) that
            // would otherwise slip past and erase the placeholder.
            if (range.collapsed) {

                const isForward = e.inputType && (
                    e.inputType === 'deleteContentForward' ||
                    e.inputType === 'deleteWordForward' ||
                    e.inputType === 'deleteSoftLineForward'
                );
                const isBackwardBI = e.inputType && (
                    e.inputType === 'deleteContentBackward' ||
                    e.inputType === 'deleteWordBackward' ||
                    e.inputType === 'deleteSoftLineBackward'
                );
                const refNode = range.startContainer;
                const offset = range.startOffset;
                let adjacentPh: HTMLElement | null = null;

                // Improved adjacency check that looks across text node boundaries
                const getAdjacentNode = (node: Node, off: number, forward: boolean): Node | null => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        if (forward && off < (node.textContent?.length || 0)) return null; // Still in middle of text
                        if (!forward && off > 0) return null;
                        return forward ? node.nextSibling : node.previousSibling;
                    }
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const children = node.childNodes;
                        if (forward && off < children.length) return children[off];
                        if (!forward && off > 0) return children[off - 1];
                    }
                    return null;
                };

                const targetNode = getAdjacentNode(refNode, offset, isForward || false);
                if (targetNode && targetNode.nodeType === Node.ELEMENT_NODE) {
                    const el = targetNode as HTMLElement;
                    adjacentPh = el.closest?.('[data-placeholder-id]') || (el.hasAttribute?.('data-placeholder-id') ? el : null);
                }

                if (adjacentPh) {
                    e.preventDefault();
                    const id = adjacentPh.getAttribute('data-placeholder-id');
                    if (id) shakePlaceholder(id);
                    return;
                }
            }
        }
    };

    // sectionId is passed when the handler is used on a known section (enables Enter-to-inject)
    const handleContentKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, sectionId?: string) => {
        // --- Enter: immediately inject [[...]] placeholders without waiting for blur ---
        if (e.key === 'Enter' && sectionId && !isReadOnly) {
            // Read the current DOM content exactly like handleContentBlur does
            const container = e.currentTarget;
            let content = '';
            container.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    content += node.textContent || '';
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    const el = node as HTMLElement;
                    const phId = el.getAttribute('data-placeholder-id') || el.querySelector('[data-placeholder-id]')?.getAttribute('data-placeholder-id');
                    if (phId) content += `[placeholder:${phId}]`;
                    else if (el.tagName === 'BR') content += '\n';
                    else content += el.innerText;
                }
            });
            // Only trigger if there is a [[...]] pattern that could resolve to a placeholder
            if (/\[\[[A-Za-z0-9_]+\]\]/.test(content)) {
                setTimeout(() => handleContentEdit(sectionId, content), 0);
            }
        }

        // --- Delete / Backspace / Ctrl+D / Ctrl+H placeholder protection ---
        const isCtrlD = (e.key === 'd' || e.key === 'D') && e.ctrlKey;
        const isCtrlH = (e.key === 'h' || e.key === 'H') && e.ctrlKey;
        if (e.key === 'Backspace' || e.key === 'Delete' || isCtrlD || isCtrlH) {
            if ((e.target as HTMLElement).tagName === 'INPUT') return;

            const isBackspace = e.key === 'Backspace' || isCtrlH;
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;
            const range = selection.getRangeAt(0);

            const shakePlaceholder = (ph: HTMLElement) => {
                ph.classList.remove('animate-shake');
                void ph.offsetWidth; 
                ph.classList.add('animate-shake');
            };

            // 1. Block range selections that contain placeholders
            if (!range.collapsed) {
                const fragment = range.cloneContents();
                const phInside = fragment.querySelector('[data-placeholder-id]');
                if (phInside) {
                    e.preventDefault();
                    const id = phInside.getAttribute('data-placeholder-id') || phInside.querySelector('[data-placeholder-id]')?.getAttribute('data-placeholder-id');
                    if (id) {
                        const targetPh = document.querySelector(`[data-placeholder-id="${id}"]`) as HTMLElement;
                        if (targetPh) shakePlaceholder(targetPh);
                    }
                    return;
                }
            }

            // 2. Comprehensive boundary detection
            let currNode: Node | null = range.startContainer;
            let currOffset = range.startOffset;

            // Fast exit if cursor is placed directly inside or on the placeholder element itself 
            // (common in Chrome when clicking near uneditable elements)
            let directPlaceholder: HTMLElement | null = null;
            if (currNode.nodeType === Node.ELEMENT_NODE) {
                directPlaceholder = (currNode as HTMLElement).closest('[data-placeholder-id]');
                // If it's the parent div and offset points EXACTLY to the placeholder (Chrome often does this for Delete)
                if (!directPlaceholder) {
                    const pointedChild = currNode.childNodes[currOffset];
                    if (pointedChild && pointedChild.nodeType === Node.ELEMENT_NODE) {
                        // For Backspace, index is currOffset - 1. For Delete, it's currOffset.
                        const targetChild = isBackspace && currOffset > 0 ? currNode.childNodes[currOffset - 1] : pointedChild;
                        directPlaceholder = (targetChild as HTMLElement).closest('[data-placeholder-id]');
                    }
                }
            } else if (currNode.parentElement) {
                directPlaceholder = currNode.parentElement.closest('[data-placeholder-id]');
            }

            if (directPlaceholder) {
                e.preventDefault();
                shakePlaceholder(directPlaceholder);
                return;
            }

            let targetPlaceholder: HTMLElement | null = null;

            const checkNode = (n: Node | null): HTMLElement | null => {
                if (!n) return null;
                if (n.nodeType === Node.ELEMENT_NODE) {
                    const el = n as HTMLElement;
                    if (el.hasAttribute('data-placeholder-id')) return el;
                    return el.querySelector('[data-placeholder-id]') as HTMLElement;
                }
                return null;
            };

            while (currNode) {
                let target: Node | null = null;
                
                if (isBackspace) {
                    if (currOffset > 0) {
                        target = currNode.nodeType === Node.ELEMENT_NODE ? currNode.childNodes[currOffset - 1] : null; 
                    }
                } else {
                    const len = currNode.nodeType === Node.TEXT_NODE ? (currNode.textContent?.length || 0) : currNode.childNodes.length;
                    if (currOffset < len) {
                        target = currNode.nodeType === Node.ELEMENT_NODE ? currNode.childNodes[currOffset] : null;
                    }
                }

                if (target) {
                    targetPlaceholder = checkNode(target);
                    if (targetPlaceholder) break;
                    
                    if (target.nodeType === Node.TEXT_NODE && target.textContent?.trim()) break;

                    // target is a non-content node (BR or empty text) — move the cursor logic
                    // and continue looking in the loop.
                    if (isBackspace) {
                        currNode = target;
                        currOffset = (target.nodeType === Node.TEXT_NODE) ? (target.textContent?.length || 0) : target.childNodes.length;
                    } else {
                        currNode = target;
                        currOffset = 0;
                        // Move to next sibling of this empty node in the next iteration
                        const nextSib = target.nextSibling;
                        if (nextSib) {
                            currNode = target.parentNode;
                            currOffset = Array.from(currNode!.childNodes).indexOf(nextSib as ChildNode);
                        } else {
                            // Hit end of parent
                            currOffset = target.parentNode!.childNodes.length;
                            currNode = target.parentNode;
                        }
                    }
                    continue;
                }

                const atBoundary = isBackspace 
                    ? currOffset === 0 
                    : currOffset >= (currNode.nodeType === Node.TEXT_NODE ? (currNode.textContent?.length || 0) : currNode.childNodes.length);

                if (atBoundary) {
                    if (currNode === e.currentTarget) break;
                    const parent: Node | null = currNode.parentNode;
                    if (!parent) break;
                    currOffset = Array.from(parent.childNodes).indexOf(currNode as ChildNode);
                    if (!isBackspace) currOffset += 1;
                    currNode = parent;
                } else {
                    break;
                }
            }

            if (targetPlaceholder) {
                e.preventDefault();
                shakePlaceholder(targetPlaceholder);
                return;
            }
        }
    };

    // Render a placeholder chip within text
    const renderPlaceholder = (section: DocumentSection, p: PlaceholderSuggestion, partIndex: number) => {
        const isEditing = editingPlaceholder?.sectionId === section.id && editingPlaceholder?.placeholderId === p.id && editingPlaceholder?.partIndex === partIndex;

        if (isEditing) {
            return (
                <span key={`${p.id}-${partIndex}`} data-placeholder-id={p.id} className="inline-block align-baseline mx-1" contentEditable={false}>
                    <input
                        autoFocus
                        type="text"
                        defaultValue={p.currentValue}
                        className="px-2 py-1 rounded-md border-2 border-brand-500 bg-white dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-4 focus:ring-brand-100 w-40 shadow-lg text-brand-700"
                        onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter') {
                                updatePlaceholderValue(section.id, p.id, e.currentTarget.value);
                                setEditingPlaceholder(null);
                            }
                            if (e.key === 'Escape') {
                                setEditingPlaceholder(null);
                            }
                        }}
                        onBlur={(e) => {
                            updatePlaceholderValue(section.id, p.id, e.currentTarget.value);
                            setEditingPlaceholder(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </span>
            );
        }

        return (
            <span
                key={`${p.id}-${partIndex}`}
                data-placeholder-id={p.id}
                className={`
                    inline-block align-baseline relative group/placeholder mx-1 px-2 py-0.5 rounded-md border-2 transition-all duration-300
                    ${p.isApproved 
                        ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/10 dark:border-green-800 cursor-default' 
                        : 'bg-orange-50 border-orange-200 border-dashed hover:border-orange-400 text-orange-700 dark:bg-orange-900/10 dark:border-orange-800 animate-pulse-subtle cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
                    }
                `}
                contentEditable={false}
                onClick={() => !isReadOnly && !p.isApproved && setEditingPlaceholder({ sectionId: section.id, placeholderId: p.id, partIndex })}
            >
                {/* The Value */}
                <span className="text-sm font-bold">
                    {p.currentValue || <span className="italic opacity-50">{p.label}</span>}
                </span>

                {/* Tooltip / Controls */}
                <div className="hidden group-hover/placeholder:flex absolute bottom-full left-1/2 -translate-x-1/2 w-64 pb-2 z-[100] flex-col items-center animate-in fade-in zoom-in-95 duration-150">
                    <div className="w-full bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-800 p-2 flex flex-col gap-2 relative ring-1 ring-black/5">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{p.label}</span>
                            {/* Trash button — only visible on rejected (non-approved) placeholders */}
                            {!isReadOnly && !p.isApproved && (
                                <button
                                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); removePlaceholder(section.id, p.id); }}
                                    className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    title="Placeholder verwijderen"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                        
                        <div className="flex gap-2 items-center">
                            <button
                                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleSourceClick(p.id); }}
                                className="flex-1 flex items-center justify-center px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-300"
                            >
                                <Eye className="w-3.5 h-3.5 mr-1.5" /> {t.source}
                            </button>
                            {!isReadOnly && (
                                <button
                                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); toggleApprovePlaceholder(section.id, p.id); }}
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

    // Removes a rejected placeholder from a section's placeholder list and strips its tag from the content
    const removePlaceholder = (sectionId: string, placeholderId: string) => {
        if (isReadOnly) return;
        contentRenderKeys.current[sectionId] = (contentRenderKeys.current[sectionId] || 0) + 1;
        updateSections(prev => prev.map(s => {
            if (s.id !== sectionId) return s;
            const newPlaceholders = s.placeholders.filter(p => p.id !== placeholderId);
            // Also strip the placeholder tag from the content so it doesn't reappear on re-render
            const newContent = (s.content || '')
                .replace(new RegExp(`\\[\\[${placeholderId}\\]\\]`, 'g'), '')
                .replace(new RegExp(`\\[placeholder:${placeholderId}\\]`, 'g'), '');
            const allApproved = newPlaceholders.length > 0 && newPlaceholders.every(p => p.isApproved);
            return { ...s, content: newContent, placeholders: newPlaceholders, isApproved: allApproved };
        }));
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
            {!isCurrentVersion && dossier?.status !== DossierStatus.ARCHIVED && (
                <div className="bg-yellow-50 border-b border-yellow-200 p-3 flex flex-col md:flex-row items-center justify-between text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-900 dark:text-yellow-200">
                    <div className="flex items-center gap-2 font-medium">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        U bekijkt een oudere versie. Oude versies kunnen niet meer bewerkt worden.
                    </div>
                    <button 
                        onClick={() => handleSave(true)} 
                        className="mt-2 md:mt-0 flex items-center px-4 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold rounded-lg transition-colors shadow-sm"
                    >
                        Ga verder vanaf deze versie
                    </button>
                </div>
            )}
            <div className="h-14 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">

                <div className="flex items-center gap-4">
                    <button onClick={() => onBack(dossier?.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    {!isReadOnly && (
                        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 gap-1">
                            <button 
                                onClick={handleUndo} 
                                disabled={history.length === 0} 
                                className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent shadow-sm transition-all"
                                title="Ongedaan maken"
                            >
                                <Undo className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={handleRedo} 
                                disabled={future.length === 0} 
                                className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent shadow-sm transition-all"
                                title="Opnieuw uitvoeren"
                            >
                                <Redo className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    {!isReadOnly && (
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
                                                {!isReadOnly && (
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
                                                    className={`font-bold text-lg mb-3 uppercase flex items-center border-b border-gray-100 dark:border-slate-800 pb-2 outline-none ${!isReadOnly ? 'focus:border-brand-300' : ''}`}
                                                    contentEditable={!isReadOnly}
                                                    suppressContentEditableWarning
                                                    onBlur={(e) => handleTitleEdit(section.id, e.currentTarget.innerText)}
                                                >
                                                    {section.title}
                                                    {section.placeholders.length > 0 && section.isApproved && <Check className="w-4 h-4 text-green-500 ml-2" contentEditable={false} />}
                                                </div>

                                                {/* Editable Content Area */}
                                                <div className="relative">
                                                    <div
                                                        key={`${section.id}-v${contentRenderKeys.current[section.id] || 0}`}
                                                        className={`text-base text-justify text-slate-700 dark:text-slate-300 outline-none rounded p-1 -ml-1 min-h-[1.5em] whitespace-pre-wrap ${!isReadOnly ? 'focus:ring-2 focus:ring-brand-100' : ''}`}
                                                        contentEditable={!editingPlaceholder && !isReadOnly}
                                                        suppressContentEditableWarning
                                                        onBlur={(e) => handleContentBlur(section.id, e)}
                                                        onKeyDown={(e) => handleContentKeyDown(e, section.id)}
                                                        onBeforeInput={handleContentBeforeInput}
                                                        onInput={(e) => handlePlaceholderInput(e, section.id)}
                                                    >
                                                        {(section.content || '').split(/(\[\[[A-Za-z0-9_]+\]\]|\[placeholder:[A-Za-z0-9_]+\])/g).map((part, i) => {
                                                            const match = part.match(/\[\[([A-Za-z0-9_]+)\]\]|\[placeholder:([A-Za-z0-9_]+)\]/);
                                                            if (match) {
                                                                const placeholderId = match[1] || match[2];
                                                                const p = section.placeholders.find(ph => ph.id === placeholderId);
                                                                if (p) return renderPlaceholder(section, p, i);
                                                            }
                                                            return <span key={`${section.id}-part-${i}`}>{part}</span>;
                                                        })}
                                                    </div>

                                                    {/* Suggestion Dropdown */}
                                                    {suggestionState.active && suggestionState.sectionId === section.id && (
                                                        <div className="absolute z-50 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl mt-1 w-64 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200" style={{ top: '100%', left: 0 }}>
                                                            <div className="p-2 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.choosePlaceholder}</span>
                                                            </div>
                                                            {SUPPORTED_PLACEHOLDERS
                                                                .filter(p => p.id.toLowerCase().includes(suggestionState.query) || p.label.toLowerCase().includes(suggestionState.query))
                                                                .map(p => (
                                                                    <button
                                                                        key={p.id}
                                                                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleSelectPlaceholderInEditor(p.id); }}
                                                                        className="w-full text-left px-4 py-2 text-xs hover:bg-brand-50 dark:hover:bg-brand-900/20 text-slate-700 dark:text-slate-300 flex flex-col border-b border-gray-50 dark:border-slate-700/50 last:border-0"
                                                                    >
                                                                        <span className="font-bold text-brand-600">{p.label}</span>
                                                                        <span className="text-[10px] text-slate-400 opacity-70">placeholder:{p.id}</span>
                                                                    </button>
                                                                ))}
                                                            {SUPPORTED_PLACEHOLDERS.filter(p => p.id.toLowerCase().includes(suggestionState.query) || p.label.toLowerCase().includes(suggestionState.query)).length === 0 && (
                                                                <div className="px-4 py-3 text-xs text-slate-400 italic">{t.noMatchingPlaceholders}</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                {/* [[...]] hint — only visible on section hover */}
                                                {!isReadOnly && (
                                                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-600 select-none opacity-0 group-hover/section:opacity-100 transition-opacity duration-200">
                                                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">[[sleutel]]</span>
                                                        <span>typen voegt een bestaande placeholder in</span>
                                                    </div>
                                                )}
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
                        {!isReadOnly && (
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
                                    <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
                                        {/* Info card when there is no linked source document */}
                                        <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-6 flex flex-col gap-4">
                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                                <FileText className="w-5 h-5 flex-shrink-0" />
                                                <span className="text-xs font-bold uppercase tracking-widest">{selectedSourceDoc?.placeholderLabel || activePlaceholderId}</span>
                                            </div>
                                            {selectedSourceDoc?.currentValue ? (
                                                <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl p-4">
                                                    <div className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-1">Ingevulde waarde</div>
                                                    <div className="text-sm font-semibold text-brand-800 dark:text-brand-200">{selectedSourceDoc.currentValue}</div>
                                                </div>
                                            ) : null}
                                            {selectedSourceDoc?.bronText ? (
                                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                                                    <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Brontekst</div>
                                                    <div className="text-sm text-amber-900 dark:text-amber-200 italic">"{selectedSourceDoc.bronText}"</div>
                                                </div>
                                            ) : null}
                                            <div className="flex items-start gap-2 text-slate-400 dark:text-slate-500">
                                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                <p className="text-xs leading-relaxed">
                                                    Geen brondocument gekoppeld aan deze placeholder. Koppel een document via de AI-analyse om de bronvermelding te activeren.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
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
