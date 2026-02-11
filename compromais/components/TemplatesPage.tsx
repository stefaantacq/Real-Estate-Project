import React, { useState } from 'react';
import { Search, Plus, FileText, ChevronRight, Layout as LayoutIcon, Globe, Lock, MoreVertical, Edit2, Trash2, Copy, Eye, X, Check, RefreshCw, Archive } from 'lucide-react';
import { Language, Template, DocumentSection, PlaceholderSuggestion } from '../types';
import { TRANSLATIONS, SUPPORTED_PLACEHOLDERS } from '../constants';
import { api } from '../services/api'; // Integrated API

interface TemplatesPageProps {
    lang: Language;
}

const AutoResizeTextarea: React.FC<{
    value: string;
    onChange: (val: string, target?: HTMLTextAreaElement) => void;
    className?: string;
    placeholder?: string;
}> = ({ value, onChange, className, placeholder }) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const adjustHeight = () => {
        const target = textareaRef.current;
        if (target) {
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
        }
    };

    React.useEffect(() => {
        adjustHeight();
    }, [value]);

    // Initial adjustment on mount
    React.useEffect(() => {
        setTimeout(adjustHeight, 50); // Small delay to ensure styles are applied
    }, []);

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value, e.target)}
            onKeyUp={(e) => onChange((e.target as HTMLTextAreaElement).value, e.target as HTMLTextAreaElement)}
            onClick={(e) => onChange((e.target as HTMLTextAreaElement).value, e.target as HTMLTextAreaElement)}
            className={className}
            placeholder={placeholder}
            rows={1}
            style={{ overflow: 'hidden', resize: 'none' }}
        />
    );
};

import { ExpandableText } from './ExpandableText';

export const TemplatesPage: React.FC<TemplatesPageProps> = ({ lang }) => {
    const t = TRANSLATIONS[lang];
    const [templates, setTemplates] = useState<Template[]>([]); // Initialized empty
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'cib' | 'custom' | 'archived'>('all');

    // Fetch templates from API
    React.useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const data = await api.getTemplates();
                setTemplates(data);
            } catch (error) {
                console.error("Failed to load templates:", error);
            }
        };
        fetchTemplates();
    }, [lang]);
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
    const [isEditingInPreview, setIsEditingInPreview] = useState(false);
    const [editedSections, setEditedSections] = useState<DocumentSection[]>([]);
    const [showSaveToast, setShowSaveToast] = useState(false);
    const [suggestionState, setSuggestionState] = useState<{
        active: boolean;
        query: string;
        sectionId: string | null;
        cursorPos: number;
    }>({ active: false, query: '', sectionId: null, cursorPos: 0 });

    // Form state for new template
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newType, setNewType] = useState<'House' | 'Apartment' | 'Commercial'>('House');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analyzedSections, setAnalyzedSections] = useState<DocumentSection[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleOpenPreview = async (template: Template) => {
        setPreviewTemplate(template);
        setIsEditingInPreview(false);

        // If template has no sections (lazy loaded), fetch full content
        if (!template.sections || template.sections.length === 0) {
            setIsPreviewLoading(true);
            try {
                const fullTemplate = await api.getTemplateById(template.id);
                setPreviewTemplate(fullTemplate);
                setEditedSections(fullTemplate.sections || []);

                // Update the templates list so it's cached for this session
                setTemplates(prev => prev.map(t => t.id === template.id ? fullTemplate : t));
            } catch (error: any) {
                console.error("Failed to fetch full template:", error);
                alert(`Fout bij het laden van template details: ${error.message}`);
                setPreviewTemplate(null);
            } finally {
                setIsPreviewLoading(false);
            }
        } else {
            setEditedSections(template.sections || []);
        }
    };

    const handleEditToggle = () => {
        setIsEditingInPreview(!isEditingInPreview);
    };

    const handleSectionContentChange = (sectionId: string, newContent: string, target?: HTMLTextAreaElement) => {
        setEditedSections(prev => prev.map(s =>
            s.id === sectionId ? { ...s, content: newContent } : s
        ));

        if (target) {
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;

            // Suggestion logic
            const cursorPos = target.selectionStart;
            const textBeforeCursor = newContent.slice(0, cursorPos);
            const lastBracketIndex = textBeforeCursor.lastIndexOf('[');

            if (lastBracketIndex !== -1 && !textBeforeCursor.slice(lastBracketIndex).includes(']')) {
                const query = textBeforeCursor.slice(lastBracketIndex + 1).toLowerCase();
                setSuggestionState({ active: true, query, sectionId, cursorPos });
            } else {
                setSuggestionState({ active: false, query: '', sectionId: null, cursorPos: 0 });
            }
        }
    };

    const handleSelectPlaceholder = (placeholderId: string) => {
        if (!suggestionState.sectionId) return;

        setEditedSections(prev => prev.map(s => {
            if (s.id === suggestionState.sectionId) {
                const content = s.content;
                const textBeforeBracket = content.slice(0, content.lastIndexOf('[', suggestionState.cursorPos));
                const textAfterCursor = content.slice(suggestionState.cursorPos);
                const newPlaceholder = `[placeholder:${placeholderId}]`;
                return { ...s, content: textBeforeBracket + newPlaceholder + textAfterCursor };
            }
            return s;
        }));

        setSuggestionState({ active: false, query: '', sectionId: null, cursorPos: 0 });
    };

    const handleAddSection = () => {
        const newSection: DocumentSection = {
            id: `sec-${Date.now()}`,
            title: 'Nieuwe Sectie',
            content: '',
            isApproved: false,
            placeholders: []
        };
        setEditedSections(prev => [...prev, newSection]);
    };

    const handleUpdateSectionTitle = (id: string, newTitle: string) => {
        setEditedSections(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
    };

    const handleDeleteSection = (id: string) => {
        setEditedSections(prev => prev.filter(s => s.id !== id));
    };

    const handleSaveEdits = async () => {
        if (!previewTemplate) return;
        setIsSaving(true);

        // Helper to extract placeholders from content
        const syncPlaceholders = (section: DocumentSection): DocumentSection => {
            const matches = Array.from(section.content.matchAll(/\[placeholder:([a-zA-Z0-9_]+)\]/g));
            const foundIds = new Set(matches.map(m => m[1]));

            const currentPlaceholders = section.placeholders || [];

            // 1. Keep existing placeholders that are still in content
            const validPlaceholders = currentPlaceholders.filter(p => foundIds.has(p.id));

            // 2. Add new placeholders found in content but not in array
            const existingIds = new Set(validPlaceholders.map(p => p.id));

            foundIds.forEach(id => {
                if (!existingIds.has(id)) {
                    // Try to find definition in SUPPORTED_PLACEHOLDERS
                    const supported = SUPPORTED_PLACEHOLDERS.find(sp => sp.id === id);
                    if (supported) {
                        validPlaceholders.push({
                            id: supported.id,
                            label: supported.label,
                            currentValue: '',
                            type: 'text', // Default or from supported
                            sourceDoc: '',
                            sourcePage: 0,
                            confidence: 'High',
                            isApproved: true
                        });
                    } else {
                        // Unknown placeholder (maybe manual entry), adding generic
                        validPlaceholders.push({
                            id: id,
                            label: id, // Fallback label
                            currentValue: '',
                            type: 'text',
                            sourceDoc: '',
                            sourcePage: 0,
                            confidence: 'Medium',
                            isApproved: true
                        });
                    }
                }
            });

            return { ...section, placeholders: validPlaceholders };
        };

        const sectionsToSave = editedSections.map(syncPlaceholders);

        try {
            await api.updateTemplate(previewTemplate.id, {
                name: previewTemplate.name,
                title: previewTemplate.title,
                description: previewTemplate.description,
                sections: sectionsToSave
            });

            const updatedTemplates = templates.map(t =>
                t.id === previewTemplate.id ? {
                    ...t,
                    name: previewTemplate.name,
                    title: previewTemplate.title,
                    description: previewTemplate.description,
                    sections: sectionsToSave
                } : t
            );

            setTemplates(updatedTemplates);
            setPreviewTemplate({
                ...previewTemplate,
                sections: sectionsToSave
            });
            setEditedSections(sectionsToSave); // Update local state too
            setIsEditingInPreview(false);

            // Show non-blocking toast
            setShowSaveToast(true);
            setTimeout(() => setShowSaveToast(false), 3000);
        } catch (error: any) {
            console.error("Failed to save template:", error);
            alert(`Er is een fout opgetreden bij het opslaan: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddNew = () => {
        setNewName('');
        setNewDesc('');
        setNewType('House');
        setAnalyzedSections([]);
        setSelectedFile(null);
        setIsCreating(true);
    };

    const handleSaveNew = async () => {
        if (!newName) return alert('Geef een naam op');

        // Keep the modal open to show analysis progress
        setIsAnalyzing(true);

        try {
            const formData = new FormData();
            formData.append('name', newName);
            formData.append('title', newName);
            formData.append('description', newDesc);
            formData.append('type', newType);
            formData.append('source', 'Custom');

            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            const response = await api.createTemplate(formData);
            const newTemplate: Template = response.template;

            setTemplates([newTemplate, ...templates]);
            setIsCreating(false);
        } catch (error: any) {
            console.error("Failed to create template:", error);
            alert(`Fout bij het aanmaken van de template: ${error.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const confirmDelete = async () => {
        if (templateToDelete) {
            try {
                await api.deleteTemplate(templateToDelete.id);
                setTemplates(prev => prev.filter(t => t.id !== templateToDelete.id));
                setTemplateToDelete(null);
            } catch (error: any) {
                console.error("Failed to delete template:", error);

                // Check if it's the specific foreign key error (simple string check or status code)
                if (error.message?.includes('in gebruik') || error.message?.includes('gekoppeld')) {
                    if (confirm(`Deze template is in gebruik en kan niet verwijderd worden.\nWilt u deze template in plaats daarvan archiveren?`)) {
                        await handleArchive(templateToDelete, true);
                        setTemplateToDelete(null);
                        return;
                    }
                }
                alert(`Fout bij verwijderen template: ${error.message}`);
            }
        }
    };

    const handleArchive = async (template: Template, archiveStatus: boolean) => {
        try {
            await api.archiveTemplate(template.id, archiveStatus);
            setTemplates(prev => prev.map(t =>
                t.id === template.id ? { ...t, isArchived: archiveStatus } : t
            ));

            // Also update preview if open
            if (previewTemplate && previewTemplate.id === template.id) {
                setPreviewTemplate({ ...previewTemplate, isArchived: archiveStatus });
            }
        } catch (error: any) {
            console.error("Failed to archive template:", error);
            alert(`Fout bij archiveren: ${error.message}`);
        }
    };

    const filteredTemplates = templates.filter(tmpl => {
        const nameMatch = (tmpl.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const titleMatch = (tmpl.title || '').toLowerCase().includes(searchTerm.toLowerCase());
        const descMatch = (tmpl.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSearch = nameMatch || titleMatch || descMatch;

        const matchesTab =
            (activeTab === 'all') ||
            (activeTab === 'cib' && tmpl.source === 'CIB') ||
            (activeTab === 'custom' && tmpl.source === 'Custom') ||
            (activeTab === 'archived' && tmpl.isArchived);

        // Optional: If you want to hide archived templates from "All", "CIB", "Custom", uncomment below:
        // if (activeTab !== 'archived' && tmpl.isArchived) return false;

        return matchesSearch && matchesTab;
    }).sort((a, b) => {
        // Sort archived to bottom
        if (a.isArchived && !b.isArchived) return 1;
        if (!a.isArchived && b.isArchived) return -1;
        return 0;
    });

    const renderPlaceholder = (p: PlaceholderSuggestion) => (
        <span
            key={p.id}
            className="inline-flex items-center px-2 py-1 rounded-md bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-200 border border-brand-200 dark:border-brand-700 text-xs font-bold mx-1 cursor-help align-middle transition-all hover:scale-[1.02] shadow-sm"
            title={`${p.label}`}
        >
            {p.label}
        </span>
    );


    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t.templates}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Beheer uw document sjablonen en extractie regels
                    </p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm self-start md:self-auto"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nieuwe Template
                </button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-2 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg w-full md:w-auto">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Alle
                    </button>
                    <button
                        onClick={() => setActiveTab('cib')}
                        className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'cib' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        CIB
                    </button>
                    <button
                        onClick={() => setActiveTab('custom')}
                        className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'custom' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Eigen
                    </button>
                    <button
                        onClick={() => setActiveTab('archived')}
                        className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'archived' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Gearchiveerd
                    </button>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Zoek templates..."
                        className="w-full bg-gray-50 dark:bg-slate-950 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                    <div
                        key={template.id}
                        onClick={() => handleOpenPreview(template)}
                        className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 relative cursor-pointer"
                    >
                        {/* Template Status / Badge */}
                        <div className="absolute top-3 right-3 flex gap-2">
                            {template.source === 'CIB' ? (
                                <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full uppercase tracking-wider border border-blue-100 dark:border-blue-800">
                                    CIB Official
                                </span>
                            ) : (
                                <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-bold rounded-full uppercase tracking-wider border border-purple-100 dark:border-purple-800">
                                    Eigen Template
                                </span>
                            )}
                            {template.isArchived && (
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-bold rounded-full uppercase tracking-wider border border-gray-200 dark:border-gray-700">
                                    Gearchiveerd
                                </span>
                            )}
                        </div>

                        <div className="p-6">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/20 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                <LayoutIcon className="w-6 h-6" />
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{template.name}</h3>
                            <ExpandableText
                                text={template.description}
                                limit={80}
                                className="text-sm text-slate-500 dark:text-slate-400 mb-6"
                            />

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-slate-800">
                                <div className="flex items-center text-xs text-slate-400">
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300 mr-2">
                                        {template.type}
                                    </span>
                                </div>

                                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={() => setTemplateToDelete(template)}
                                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                        title="Verwijderen"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleArchive(template, !template.isArchived);
                                        }}
                                        className={`p-2 rounded-lg transition-colors ${template.isArchived
                                            ? 'text-orange-400 hover:text-orange-600 hover:bg-orange-50'
                                            : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50'}`}
                                        title={template.isArchived ? "Dearchiveren" : "Archiveren"}
                                    >
                                        <Archive className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Hover Action Overlay */}
                        <div className="absolute inset-0 bg-brand-600/5 dark:bg-brand-400/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </div>
                ))}

                {/* Add Template Card */}
                <button
                    onClick={handleAddNew}
                    className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-white dark:hover:bg-slate-900 transition-all group min-h-[220px]"
                >
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm mb-4">
                        <Plus className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-slate-500 group-hover:text-brand-600 transition-colors uppercase tracking-widest">
                        Template Toevoegen
                    </span>
                </button>
            </div>

            {/* Preview Modal */}
            {previewTemplate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
                            <div className="flex-1 mr-4">
                                {isEditingInPreview ? (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-brand-600 shrink-0" />
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={previewTemplate.name}
                                                    onChange={(e) => setPreviewTemplate({ ...previewTemplate, name: e.target.value })}
                                                    className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded px-2 py-1 text-sm font-bold w-full focus:ring-1 focus:ring-brand-500 outline-none"
                                                    placeholder="Template Naam"
                                                />
                                            </div>
                                        </div>
                                        <textarea
                                            value={previewTemplate.description}
                                            onChange={(e) => setPreviewTemplate({ ...previewTemplate, description: e.target.value })}
                                            className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded px-2 py-1 text-xs w-full focus:ring-2 focus:ring-brand-500 outline-none resize-none transition-all duration-200 max-h-48 overflow-y-auto shadow-inner"
                                            placeholder="Beschrijving"
                                            rows={2}
                                            onFocus={(e) => {
                                                const target = e.target as HTMLTextAreaElement;
                                                target.style.height = 'auto';
                                                target.style.height = `${Math.min(target.scrollHeight, 192)}px`; // max-h-48 is 192px
                                            }}
                                            onInput={(e) => {
                                                const target = e.target as HTMLTextAreaElement;
                                                target.style.height = 'auto';
                                                target.style.height = `${Math.min(target.scrollHeight, 192)}px`;
                                            }}
                                            onBlur={(e) => {
                                                const target = e.target as HTMLTextAreaElement;
                                                // Keep it at 2 rows (approx 48px) if blurred to keep header compact
                                                target.style.height = '48px';
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                                            <FileText className="w-5 h-5 mr-2 text-brand-600" />
                                            {previewTemplate.name}
                                        </h2>
                                        <ExpandableText
                                            text={previewTemplate.description}
                                            limit={120}
                                            className="text-xs text-slate-500 mt-1 italic"
                                        />
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                {isEditingInPreview ? (
                                    <button
                                        onClick={handleSaveEdits}
                                        disabled={isSaving}
                                        className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold shadow-sm transition-all"
                                    >
                                        {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Copy className="w-4 h-4 mr-2" />}
                                        {isSaving ? 'Opslaan...' : 'Opslaan'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleEditToggle}
                                        className="flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all"
                                    >
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        Bewerken
                                    </button>
                                )}
                                <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1"></div>
                                <button
                                    onClick={() => handleArchive(previewTemplate, !previewTemplate.isArchived)}
                                    className={`p-2 rounded-lg transition-colors ${previewTemplate.isArchived
                                        ? 'text-orange-400 hover:text-orange-600 hover:bg-orange-50'
                                        : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50'}`}
                                    title={previewTemplate.isArchived ? "Dearchiveren" : "Archiveren"}
                                >
                                    <Archive className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setPreviewTemplate(null)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                                    title="Sluiten"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 bg-slate-100 dark:bg-slate-950/50">
                            {isPreviewLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 pointer-events-none">
                                    <RefreshCw className="w-10 h-10 text-brand-500 animate-spin mb-4" />
                                    <p className="text-slate-500 dark:text-slate-400 font-medium font-sans">Template details laden...</p>
                                </div>
                            ) : (
                                <div className="max-w-[800px] mx-auto bg-white dark:bg-slate-900 shadow-lg border border-gray-200 dark:border-slate-800 p-12 text-slate-800 dark:text-slate-200 font-serif leading-relaxed min-h-screen">
                                    <div className="text-center border-b-2 border-slate-900 dark:border-slate-100 pb-4 mb-12">
                                        {isEditingInPreview ? (
                                            <div className="flex flex-col gap-1">
                                                <input
                                                    value={previewTemplate.title || ''}
                                                    onChange={(e) => setPreviewTemplate({ ...previewTemplate, title: e.target.value })}
                                                    className="text-2xl font-bold uppercase tracking-tight text-center w-full bg-slate-50 dark:bg-slate-800/50 border-none focus:ring-2 focus:ring-brand-500 rounded py-2 outline-none transition-all"
                                                    placeholder="Voer de titel van het document in..."
                                                />
                                            </div>
                                        ) : (
                                            <h1 className="text-2xl font-bold uppercase tracking-tight">{previewTemplate.title || previewTemplate.name}</h1>
                                        )}
                                    </div>
                                    <div className="space-y-8">
                                        {editedSections.length > 0 ? (
                                            editedSections.map((section) => (
                                                <div key={section.id} className="space-y-3 group/section relative">
                                                    {isEditingInPreview && (
                                                        <div className="absolute top-0 right-0 opacity-0 group-hover/section:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleDeleteSection(section.id)}
                                                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}

                                                    {isEditingInPreview ? (
                                                        <input
                                                            value={section.title}
                                                            onChange={(e) => handleUpdateSectionTitle(section.id, e.target.value)}
                                                            className="font-bold text-base uppercase border-b border-gray-100 dark:border-slate-800 pb-1 w-full bg-transparent outline-none focus:border-brand-500 transition-colors"
                                                        />
                                                    ) : (
                                                        <h3 className="font-bold text-base uppercase border-b border-gray-100 dark:border-slate-800 pb-1">{section.title}</h3>
                                                    )}

                                                    {isEditingInPreview ? (
                                                        <div className="relative">
                                                            <AutoResizeTextarea
                                                                value={section.content}
                                                                onChange={(val, target) => handleSectionContentChange(section.id, val, target)}
                                                                className="w-full p-0 font-serif text-sm bg-transparent border-none focus:ring-0 outline-none transition-all text-justify leading-relaxed text-slate-800 dark:text-slate-200 antialiased"
                                                                placeholder="Voer hier de sectie-inhoud in..."
                                                            />

                                                            {suggestionState.active && suggestionState.sectionId === section.id && (
                                                                <div className="absolute z-50 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl mt-1 w-64 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                                                    <div className="p-2 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kies een placeholder</span>
                                                                    </div>
                                                                    {SUPPORTED_PLACEHOLDERS
                                                                        .filter(p => p.id.includes(suggestionState.query) || p.label.toLowerCase().includes(suggestionState.query))
                                                                        .map(p => (
                                                                            <button
                                                                                key={p.id}
                                                                                onClick={() => handleSelectPlaceholder(p.id)}
                                                                                className="w-full text-left px-4 py-2 text-xs hover:bg-brand-50 dark:hover:bg-brand-900/20 text-slate-700 dark:text-slate-300 flex flex-col border-b border-gray-50 dark:border-slate-700/50 last:border-0"
                                                                            >
                                                                                <span className="font-bold text-brand-600">{p.label}</span>
                                                                                <span className="text-[10px] text-slate-400 opacity-70">placeholder:{p.id}</span>
                                                                            </button>
                                                                        ))}
                                                                    {SUPPORTED_PLACEHOLDERS.filter(p => p.id.includes(suggestionState.query) || p.label.toLowerCase().includes(suggestionState.query)).length === 0 && (
                                                                        <div className="px-4 py-3 text-xs text-slate-400 italic">Geen overeenkomende placeholders...</div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="font-serif text-sm leading-relaxed text-justify whitespace-pre-wrap text-slate-800 dark:text-slate-200 antialiased" style={{ textAlign: 'justify' }}>
                                                            {(section.content || '').split(/(\[placeholder:[a-z0-9_]+\])/g).map((part, i) => {
                                                                const match = part.match(/\[placeholder:([a-z0-9_]+)\]/);
                                                                if (match) {
                                                                    const placeholderId = match[1];
                                                                    const p = section.placeholders?.find(ph => ph.id === placeholderId);
                                                                    if (p) return renderPlaceholder(p);
                                                                }
                                                                return <span key={`${section.id}-part-${i}`}>{part}</span>;
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            !isEditingInPreview && (
                                                <div className="py-20 text-center text-slate-400 italic font-sans">
                                                    Geen inhoud beschikbaar om te bekijken of te bewerken.
                                                </div>
                                            )
                                        )}

                                        {isEditingInPreview && (
                                            <button
                                                onClick={handleAddSection}
                                                className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl text-slate-400 hover:border-brand-500 hover:text-brand-500 transition-all flex items-center justify-center font-bold"
                                            >
                                                <Plus className="w-5 h-5 mr-2" />
                                                Sectie Toevoegen
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex justify-end bg-gray-50/50 dark:bg-slate-900/50">
                            <button
                                onClick={() => setPreviewTemplate(null)}
                                className="px-6 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors text-sm font-medium"
                            >
                                Sluiten
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Simple Add Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nieuwe Template</h2>
                            <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-slate-400"><X className="w-6 h-6" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Naam</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                    placeholder="bijv. Mijn Eigen Huis Template"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Beschrijving</label>
                                <textarea
                                    value={newDesc}
                                    onChange={(e) => setNewDesc(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all h-24"
                                    placeholder="Geef een korte beschrijving..."
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                                <select
                                    value={newType}
                                    onChange={(e) => setNewType(e.target.value as any)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                >
                                    <option value="House">House</option>
                                    <option value="Apartment">Apartment</option>
                                    <option value="Commercial">Commercial</option>
                                </select>
                            </div>
                            <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Of start vanaf een PDF (AI Analyse)</label>
                                <div className="flex flex-col gap-3">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            setSelectedFile(file);
                                            if (file && !newName) setNewName(file.name.replace('.pdf', ''));
                                        }}
                                        className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-slate-800 dark:file:text-slate-300"
                                    />
                                    <p className="text-[10px] text-slate-500 italic">
                                        Gemini zal de PDF analyseren tijdens het opslaan om secties en placeholders te identificeren.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-slate-900/50">
                            <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">Annuleren</button>
                            <button
                                onClick={handleSaveNew}
                                disabled={isAnalyzing}
                                className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-brand-700 transition-colors disabled:opacity-50"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Bezig met analyseren & opslaan...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Template Opslaan
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {templateToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mx-auto mb-4">
                                <Trash2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Template verwijderen?</h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                Weet u zeker dat u de template <span className="font-semibold text-slate-900 dark:text-white">"{templateToDelete.name}"</span> wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
                            </p>
                        </div>
                        <div className="px-6 py-4 bg-gray-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => setTemplateToDelete(null)}
                                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                Annuleren
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm shadow-red-200 dark:shadow-none transition-all"
                            >
                                Ja, Verwijder
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Toast Notification */}
            {showSaveToast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 dark:border-slate-200">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-bold">Wijzigingen succesvol opgeslagen</span>
                        <div className="w-px h-4 bg-slate-700 dark:bg-slate-200 mx-1"></div>
                        <button
                            onClick={() => setShowSaveToast(false)}
                            className="p-1 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
