import React, { useState } from 'react';
import { Save, Download, FileText, Check, ChevronRight, Wand2, ArrowLeft, Eye, Undo, Redo, MoreHorizontal, Trash2, Plus, X, ListChecks, Maximize2, Split } from 'lucide-react';
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
      if(window.confirm('Are you sure you want to remove this section?')) {
        setSections(prev => prev.filter(s => s.id !== sectionId));
      }
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
      alert('Document exported!');
  };

  // Render a placeholder chip within text
  const renderPlaceholder = (section: DocumentSection, p: PlaceholderSuggestion) => {
      return (
          <span key={p.id} className="inline-block align-baseline relative group mx-1">
              <span 
                className={`cursor-pointer px-1.5 py-0.5 rounded border text-sm font-medium transition-colors
                    ${p.isApproved 
                        ? 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300' 
                        : 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-300'
                    }
                    ${activePlaceholderId === p.id ? 'ring-2 ring-brand-500' : ''}
                `}
                onClick={() => setActivePlaceholderId(p.id)}
              >
                  {p.currentValue}
              </span>
              
              {/* Tooltip / Controls (Only visible on click/hover logic could be added here, for now simpler inline) */}
              {activePlaceholderId === p.id && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 p-2 z-10 flex flex-col gap-2">
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">{p.label}</div>
                      <div className="flex gap-1">
                          <button 
                            onClick={() => handleSourceClick(p.id)}
                            className="flex-1 flex items-center justify-center px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-xs hover:bg-gray-200 dark:hover:bg-slate-600"
                            title={t.source}
                          >
                              <Eye className="w-3 h-3 mr-1" /> Source
                          </button>
                          <button 
                            onClick={() => toggleApprovePlaceholder(section.id, p.id)}
                            className={`flex-1 flex items-center justify-center px-2 py-1 rounded text-xs text-white
                                ${p.isApproved ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                            `}
                          >
                             {p.isApproved ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                          </button>
                      </div>
                  </div>
              )}
          </span>
      );
  };

  // Simplified content renderer that replaces [placeholder:id] with actual chips
  const renderContent = (section: DocumentSection) => {
      const parts = section.content.split(/(\[placeholder:[a-z_]+\])/g);
      return (
          <div className="whitespace-pre-wrap">
              {parts.map((part, i) => {
                  if (part.startsWith('[placeholder:')) {
                      // Logic to map mock placeholders. In a real app, this would use regex ID matching
                      // For this mock, we just take the next available placeholder from the list that hasn't been rendered or cycle them
                      // Simplified: We assume order matches for mock
                      const pIndex = Math.floor(i / 2); // rough approximation for mock
                      const p = section.placeholders[pIndex % section.placeholders.length]; 
                      if (p) return renderPlaceholder(section, p);
                  }
                  return <span key={i}>{part}</span>;
              })}
          </div>
      );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] animate-in fade-in duration-500">
      
      {/* Top Toolbar */}
      <div className="h-14 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0">
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
              <div className="flex items-center mr-4">
                 <div className="text-xs font-medium mr-2 text-slate-500">{progress}% Validated</div>
                 <div className="w-24 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                     <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                 </div>
              </div>

              <button 
                onClick={() => setSidebarMode(sidebarMode === 'checklist' ? 'none' : 'checklist')}
                className={`p-2 rounded transition-colors ${sidebarMode === 'checklist' ? 'bg-brand-100 text-brand-700' : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                title={t.validationChecklist}
              >
                  <ListChecks className="w-5 h-5" />
              </button>

              <button 
                onClick={() => setSidebarMode(sidebarMode === 'ai' ? 'none' : 'ai')}
                className={`p-2 rounded transition-colors ${sidebarMode === 'ai' ? 'bg-brand-100 text-brand-700' : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                title={t.aiAssistant}
              >
                  <Wand2 className="w-5 h-5" />
              </button>

              <button 
                onClick={handleExport}
                className="flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors ml-4"
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
              <div className="max-w-[800px] w-full min-h-[1000px] bg-white dark:bg-slate-900 shadow-lg p-12 text-slate-900 dark:text-slate-100 font-serif leading-relaxed">
                  <div className="text-center font-bold text-2xl uppercase border-b-2 border-slate-900 dark:border-slate-100 pb-4 mb-8">
                    Verkoopcompromis
                  </div>

                  <div className="space-y-6">
                      {sections.map(section => (
                          <div key={section.id} className="group relative border border-transparent hover:border-dashed hover:border-brand-300 rounded p-2 -m-2 transition-colors">
                              {/* Section Actions (Visible on Hover) */}
                              <div className="absolute -top-3 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-900 shadow-sm border rounded p-1">
                                  <button onClick={() => toggleApproveSection(section.id)} className={`p-1 rounded ${section.isApproved ? 'text-green-500' : 'text-slate-400 hover:text-green-500'}`}>
                                      <Check className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => removeSection(section.id)} className="p-1 text-slate-400 hover:text-red-500 rounded">
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                                  <button className="p-1 text-slate-400 hover:text-brand-500 rounded">
                                      <Wand2 className="w-4 h-4" />
                                  </button>
                              </div>

                              {/* Section Title */}
                              <div className="font-bold text-lg mb-2 uppercase flex items-center">
                                  {section.title}
                                  {section.isApproved && <Check className="w-4 h-4 text-green-500 ml-2" />}
                              </div>

                              {/* Section Content */}
                              <div className="text-base text-justify">
                                  {renderContent(section)}
                              </div>
                          </div>
                      ))}

                      {/* Add Section Button */}
                      <div className="flex justify-center py-4 opacity-50 hover:opacity-100 transition-opacity">
                          <button className="flex items-center px-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-full text-slate-500 hover:text-brand-500 text-sm border border-dashed border-slate-300">
                              <Plus className="w-4 h-4 mr-2" />
                              Voeg sectie toe
                          </button>
                      </div>
                  </div>
              </div>
          </div>

          {/* Split Screen Source Viewer */}
          {splitScreen && (
              <div className="w-1/2 border-l border-gray-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex flex-col animate-in slide-in-from-right duration-300">
                  <div className="h-10 flex items-center justify-between px-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Bron Document: Kadaster.pdf</span>
                      <button onClick={() => setSplitScreen(false)} className="text-slate-500 hover:text-slate-900">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  <div className="flex-1 p-4 flex items-center justify-center">
                      <div className="w-full h-full bg-white shadow flex items-center justify-center text-slate-400 border-2 border-dashed">
                          [ PDF Viewer Mockup ]
                          <br />
                          Highlighting relevant text...
                      </div>
                  </div>
              </div>
          )}

          {/* Sidebars (Absolute positioned) */}
          {sidebarMode !== 'none' && (
              <div className="absolute top-0 right-0 bottom-0 w-80 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 shadow-2xl z-20 flex flex-col animate-in slide-in-from-right duration-300">
                  <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-slate-800">
                      <h3 className="font-bold text-slate-900 dark:text-white">
                          {sidebarMode === 'ai' ? t.aiAssistant : t.validationChecklist}
                      </h3>
                      <button onClick={() => setSidebarMode('none')} className="text-slate-400 hover:text-slate-900">
                          <X className="w-5 h-5" />
                      </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4">
                      {sidebarMode === 'checklist' ? (
                          <div className="space-y-4">
                              {sections.map(s => (
                                  <div key={s.id} className="space-y-2">
                                      <div className="flex items-center justify-between font-medium text-sm text-slate-700 dark:text-slate-200">
                                          {s.title}
                                          {s.isApproved ? <Check className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border border-slate-300"></div>}
                                      </div>
                                      <div className="pl-4 space-y-1">
                                          {s.placeholders.map(p => (
                                              <div key={p.id} className="flex items-center justify-between text-xs text-slate-500">
                                                  <span>{p.label}</span>
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
                              <div className="flex-1 space-y-4 mb-4">
                                  <div className="bg-brand-50 dark:bg-slate-800 p-3 rounded-lg rounded-tl-none text-sm text-slate-700 dark:text-slate-300">
                                      Hallo! Ik heb de documenten geanalyseerd. Er lijkt een inconsistentie in de oppervlakte van het perceel tussen het kadaster en het EPC. Wil je dat ik dit controleer?
                                  </div>
                              </div>
                              <div className="mt-auto">
                                  <input 
                                    type="text" 
                                    placeholder="Stel een vraag..." 
                                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-slate-950 outline-none focus:ring-2 focus:ring-brand-500"
                                  />
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
