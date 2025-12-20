
import React, { useState, useRef, useEffect } from 'react';
import { Save, Download, FileText, Check, ChevronRight, Wand2, ArrowLeft, Eye, Undo, Redo, MoreHorizontal, Trash2, Plus, X, ListChecks, Maximize2, Split, ArrowUp, ArrowDown, ArrowRight, ExternalLink } from 'lucide-react';
import { Language, DocumentSection, PlaceholderSuggestion } from '../types';
import { TRANSLATIONS, MOCK_SECTIONS } from '../constants';

interface EditorProps {
    lang: Language;
    onBack: () => void;
}

export const Editor: React.FC<EditorProps> = ({ lang, onBack }) => {
    const t = TRANSLATIONS[lang];
    const [sections, setSections] = useState<DocumentSection[]>(MOCK_SECTIONS);
    const [sidebarMode, setSidebarMode] = useState<'none' | 'ai' | 'checklist'>('none');
    const [splitScreen, setSplitScreen] = useState<boolean>(false);
    const [activePlaceholderId, setActivePlaceholderId] = useState<string | null>(null);

    // Helper to get total validation status
    const totalPlaceholders = sections.flatMap(s => s.placeholders).length;
    const approvedPlaceholders = sections.flatMap(s => s.placeholders).filter(p => p.isApproved).length;
    const progress = Math.round((approvedPlaceholders / totalPlaceholders) * 100);

    const toggleApproveSection = (sectionId: string) => {
        setSections(prev => prev.map(s => s.id === sectionId ? { ...s, isApproved: !s.isApproved } : s));
    };

    const removeSection = (sectionId: string) => {
        if (window.confirm('Verwijder deze sectie?')) {
            setSections(prev => prev.filter(s => s.id !== sectionId));
        }
    };

    const addSection = () => {
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
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === sections.length - 1) return;

        const newSections = [...sections];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
        setSections(newSections);
    };

    const toggleApprovePlaceholder = (sectionId: string, placeholderId: string) => {
        setSections(prev => prev.map(s => {
            if (s.id !== sectionId) return s;
            return {
                ...s,
                placeholders: s.placeholders.map(p => p.id === placeholderId ? { ...p, isApproved: !p.isApproved } : p)
            };
        }));
    };

    const handleSourceClick = (id: string) => {
        setActivePlaceholderId(id);
        setSplitScreen(true);
    };

    const handleExport = () => {
        if (progress < 100) {
            if (!window.confirm(t.warningUnapproved)) return;
        }
        alert('Document exported to PDF/Word!');
    };

    const handleContentEdit = (sectionId: string, newContent: string) => {
        setSections(prev => prev.map(s => s.id === sectionId ? { ...s, content: newContent } : s));
    };

    // Render a placeholder chip within text
    const renderPlaceholder = (section: DocumentSection, p: PlaceholderSuggestion) => {
        return (
            <span key={p.id} className="inline-block align-baseline relative group/placeholder mx-1" contentEditable={false}>
                {/* The Chip */}
                <span
                    className={`
                    px-1.5 py-0.5 rounded border text-sm font-medium transition-colors cursor-pointer select-none
                    ${p.isApproved
                            ? 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300'
                            : 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-300'
                        }
                `}
                >
                    {p.currentValue}
                </span>

                {/* Tooltip / Controls - HOVER ONLY (group-hover) */}
                {/* We use pb-2 to create an invisible bridge so the mouse can travel to the tooltip without losing hover */}
                <div className="hidden group-hover/placeholder:flex absolute bottom-full left-1/2 -translate-x-1/2 w-48 pb-2 z-50 flex-col items-center animate-in fade-in zoom-in-95 duration-100">
                    <div className="w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 p-2 flex flex-col gap-2 relative">
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-center">{p.label}</div>
                        <div className="flex gap-1.5">
                            <button
                                onClick={(e) => { e.preventDefault(); handleSourceClick(p.id); }}
                                className="flex-1 flex items-center justify-center px-2 py-1.5 bg-gray-100 dark:bg-slate-700 rounded text-xs hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                                title={t.source}
                            >
                                <Eye className="w-3 h-3 mr-1" /> {t.source}
                            </button>
                            <button
                                onClick={(e) => { e.preventDefault(); toggleApprovePlaceholder(section.id, p.id); }}
                                className={`flex-1 flex items-center justify-center px-2 py-1.5 rounded text-xs text-white transition-colors
                                ${p.isApproved ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                            `}
                            >
                                {p.isApproved ? <X className="w-3 h-3 mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                                {p.isApproved ? t.reject : t.approve}
                            </button>
                        </div>
                        {/* Arrow is now part of the styled box */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-top-white dark:border-top-slate-800"></div>
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

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] animate-in fade-in duration-500">

            {/* Top Toolbar */}
            <div className="h-14 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="h-6 w-px bg-gray-300 dark:bg-slate-700 mx-2"></div>
                    <div className="flex gap-1">
                        <button className="p-2 text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors" title={t.undo}>
                            <Undo className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors" title={t.redo}>
                            <Redo className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center mr-4 bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-slate-700">
                        <div className="text-xs font-medium mr-3 text-slate-500">{progress}% Validated</div>
                        <div className="w-24 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>

                    <button
                        onClick={() => setSidebarMode(sidebarMode === 'checklist' ? 'none' : 'checklist')}
                        className={`p-2 rounded-lg transition-colors border ${sidebarMode === 'checklist' ? 'bg-brand-50 border-brand-200 text-brand-700' : 'border-transparent hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                        title={t.validationChecklist}
                    >
                        <ListChecks className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => setSidebarMode(sidebarMode === 'ai' ? 'none' : 'ai')}
                        className={`p-2 rounded-lg transition-colors border ${sidebarMode === 'ai' ? 'bg-brand-50 border-brand-200 text-brand-700' : 'border-transparent hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                        title={t.aiAssistant}
                    >
                        <Wand2 className="w-5 h-5" />
                    </button>

                    <div className="h-6 w-px bg-gray-300 dark:bg-slate-700 mx-2"></div>

                    <button
                        onClick={handleExport}
                        className="flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        {t.export}
                    </button>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex min-h-0 bg-gray-100 dark:bg-slate-950 relative overflow-hidden">

                {/* Document Area */}
                <div className={`flex-1 overflow-y-auto p-8 transition-all duration-300 flex justify-center ${splitScreen ? 'w-1/2' : 'w-full'}`}>
                    <div className="max-w-[800px] w-full min-h-[1000px] bg-white dark:bg-slate-900 shadow-xl border border-gray-200 dark:border-slate-800 p-12 text-slate-900 dark:text-slate-100 font-serif leading-relaxed">
                        <div className="text-center font-bold text-2xl uppercase border-b-2 border-slate-900 dark:border-slate-100 pb-4 mb-10">
                            Verkoopcompromis
                        </div>

                        <div className="space-y-8">
                            {sections.map((section, index) => (
                                <div key={section.id} className="group/section relative border border-transparent hover:border-dashed hover:border-brand-300 rounded p-4 -m-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/20">

                                    {/* Floating Actions */}
                                    <div className="absolute -top-3 -right-2 flex gap-1 opacity-0 group-hover/section:opacity-100 transition-all bg-white dark:bg-slate-900 shadow-lg border border-gray-100 dark:border-slate-700 rounded-lg p-1 scale-90 hover:scale-100 z-10">
                                        <button onClick={() => moveSection(index, 'up')} disabled={index === 0} className="p-1.5 text-slate-400 hover:text-brand-500 disabled:opacity-30 rounded hover:bg-gray-50">
                                            <ArrowUp className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => moveSection(index, 'down')} disabled={index === sections.length - 1} className="p-1.5 text-slate-400 hover:text-brand-500 disabled:opacity-30 rounded hover:bg-gray-50">
                                            <ArrowDown className="w-4 h-4" />
                                        </button>
                                        <div className="w-px bg-gray-200 mx-1"></div>
                                        <button onClick={() => toggleApproveSection(section.id)} className={`p-1.5 rounded hover:bg-gray-50 ${section.isApproved ? 'text-green-500' : 'text-slate-400 hover:text-green-500'}`}>
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => removeSection(section.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-gray-50">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Editable Title */}
                                    <div
                                        className="font-bold text-lg mb-3 uppercase flex items-center border-b border-gray-100 dark:border-slate-800 pb-2 outline-none focus:border-brand-300"
                                        contentEditable
                                        suppressContentEditableWarning
                                        onInput={(e) => {
                                            // Update title (simplified)
                                        }}
                                    >
                                        {section.title}
                                        {section.isApproved && <Check className="w-4 h-4 text-green-500 ml-2" contentEditable={false} />}
                                    </div>

                                    {/* Editable Content Area */}
                                    <div
                                        className="text-base text-justify text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-brand-100 rounded p-1 -ml-1 min-h-[1.5em]"
                                        contentEditable
                                        suppressContentEditableWarning
                                        onInput={(e) => {
                                            // In a real app we'd parse HTML back to text, for mock we do nothing to avoid complexity
                                            // e.currentTarget.innerText
                                        }}
                                    >
                                        {/* We map the placeholders to actual elements */}
                                        {/* Since we can't easily put React components inside contentEditable and keep state working perfectly in this mock, 
                                      we will render the array of nodes. */}
                                        {section.content.split(/(\[placeholder:[a-z_]+\])/g).map((part, i) => {
                                            if (part.startsWith('[placeholder:')) {
                                                const pIndex = Math.floor(i / 2);
                                                const p = section.placeholders[pIndex % section.placeholders.length];
                                                if (p) return renderPlaceholder(section, p);
                                            }
                                            return <span key={i}>{part}</span>;
                                        })}
                                    </div>
                                </div>
                            ))}

                            {/* Add Section Button - Now Functional */}
                            <div className="flex justify-center py-8 opacity-40 hover:opacity-100 transition-opacity">
                                <button
                                    onClick={addSection}
                                    className="flex items-center px-6 py-3 bg-white dark:bg-slate-800 rounded-full text-slate-500 hover:text-brand-500 text-sm border-2 border-dashed border-slate-300 hover:border-brand-400 hover:shadow-md transition-all"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t.addSection || 'Voeg nieuwe sectie toe'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Split Screen Source Viewer */}
                {splitScreen && (
                    <div className="w-1/2 border-l border-gray-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex flex-col animate-in slide-in-from-right duration-300 shadow-xl z-20">
                        <div className="h-10 flex items-center justify-between px-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shrink-0">
                            <div className="flex items-center">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center mr-3">
                                    <FileText className="w-3 h-3 mr-2" /> Bron Document: Kadaster.pdf
                                </span>
                                <button
                                    onClick={() => window.open('#', '_blank')}
                                    className="p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors"
                                    title="Open in drowser"
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

                                {/* Highlighted Area */}
                                <div className="absolute top-1/4 left-10 right-10 h-24 bg-yellow-200/50 border-2 border-yellow-400 rounded flex items-center justify-center">
                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-bold shadow-sm">Gevonden Data</span>
                                </div>

                                <span className="relative z-10 font-medium text-slate-400 bg-white/80 px-4 py-2 rounded-lg backdrop-blur-sm">[ PDF Preview Mock ]</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sidebars (Absolute positioned) */}
                {sidebarMode !== 'none' && (
                    <div className="absolute top-0 right-0 bottom-0 w-80 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 shadow-2xl z-30 flex flex-col animate-in slide-in-from-right duration-300">
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
                                        <div className="text-sm font-bold text-green-800 dark:text-green-300 mb-1">Status: {progress}% Compleet</div>
                                        <div className="w-full h-1.5 bg-green-200 dark:bg-green-900 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>

                                    {sections.map(s => (
                                        <div key={s.id} className="space-y-2">
                                            <div className="flex items-center justify-between font-medium text-sm text-slate-700 dark:text-slate-200">
                                                {s.title}
                                                {s.isApproved ? <Check className="w-4 h-4 text-green-600" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div>}
                                            </div>
                                            <div className="pl-3 space-y-1 border-l-2 border-gray-100 dark:border-slate-800 ml-1">
                                                {s.placeholders.map(p => (
                                                    <div key={p.id} className="flex items-center justify-between text-xs py-1 hover:bg-gray-50 dark:hover:bg-slate-800 px-2 rounded cursor-pointer" onClick={() => setActivePlaceholderId(p.id)}>
                                                        <span className={p.isApproved ? "text-slate-500 line-through decoration-green-500" : "text-slate-600 font-medium"}>{p.label}</span>
                                                        {p.isApproved ? <Check className="w-3 h-3 text-green-500" /> : <div className="w-3 h-3 rounded-full border border-slate-300"></div>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // AI Chat Interface
                                <div className="flex flex-col h-full">
                                    <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                                                <Wand2 className="w-4 h-4 text-brand-600" />
                                            </div>
                                            <div className="bg-gray-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none text-sm text-slate-700 dark:text-slate-300 shadow-sm">
                                                Hallo! Ik heb de documenten geanalyseerd. Er lijkt een inconsistentie in de oppervlakte van het perceel tussen het kadaster en het EPC. Wil je dat ik dit controleer?
                                            </div>
                                        </div>

                                        <div className="flex gap-3 flex-row-reverse">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                                <span className="text-xs font-bold text-slate-600">ME</span>
                                            </div>
                                            <div className="bg-brand-600 text-white p-3 rounded-2xl rounded-tr-none text-sm shadow-sm">
                                                Ja, graag. Wat is het verschil?
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                                                <Wand2 className="w-4 h-4 text-brand-600" />
                                            </div>
                                            <div className="bg-gray-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none text-sm text-slate-700 dark:text-slate-300 shadow-sm">
                                                Het EPC vermeldt <span className="font-mono bg-white px-1 rounded border">145m²</span> bewoonbare oppervlakte, terwijl het kadaster <span className="font-mono bg-white px-1 rounded border">139m²</span> aangeeft. Ik heb de <span className="text-brand-600 font-medium cursor-pointer hover:underline">[sectie: Oppervlakte]</span> gemarkeerd voor controle.
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-800">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Stel een vraag of geef een opdracht..."
                                                className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-3 pr-10 text-sm bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                                            />
                                            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors">
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
