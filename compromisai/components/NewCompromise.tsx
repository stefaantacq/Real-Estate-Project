
import React, { useState } from 'react';
import { Upload, FileText, X, Home, Building2, Check, AlertCircle, Wand2, ArrowRight, ChevronDown, ChevronRight } from 'lucide-react';
import { Language, Dossier, DossierStatus } from '../types';
import { TRANSLATIONS, getTemplates } from '../constants';
import { ExtractionLoading } from './ExtractionLoading';
import { DossierService } from '../services/dossierService';
import { getDocumentChecklist } from '../documentChecklist';

interface NewCompromiseProps {
  lang: Language;
  onCancel: () => void;
  onComplete: (id: string) => void;
}

export const NewCompromise: React.FC<NewCompromiseProps> = ({ lang, onCancel, onComplete }) => {
  const t = TRANSLATIONS[lang];
  const [isExtracting, setIsExtracting] = useState(false);
  const [dossierName, setDossierName] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [remarks, setRemarks] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Get translated document checklist
  const requiredDocs = getDocumentChecklist(lang);

  // Get the translated "Mandatory certificates" category name for default expansion
  const mandatoryCertsCategoryName = requiredDocs.find(doc => doc.id === 'epc')?.category || '';
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set([mandatoryCertsCategoryName]));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getDocStatus = (docDef: { id: string, synonyms: string[] }) => {
    // Check if any uploaded file matches any synonym
    return files.some(f => {
      const fname = f.name.toLowerCase();
      return docDef.synonyms.some(s => fname.includes(s));
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const getDocsByCategory = () => {
    const categories: { [key: string]: typeof requiredDocs } = {};
    requiredDocs.forEach(doc => {
      if (!categories[doc.category]) {
        categories[doc.category] = [];
      }
      categories[doc.category].push(doc);
    });
    return categories;
  };

  const handleGenerate = () => {
    if (!dossierName || !selectedTemplateId) return;
    setIsExtracting(true);
  };

  const handleExtractionComplete = React.useCallback(() => {
    // Create new Persistent Dossier
    const newId = (Math.floor(Math.random() * 10000) + 100).toString();
    const newDossier: Dossier = {
      id: newId,
      name: dossierName,
      address: 'Nieuw Pand, Onbekende Straat 1', // Mock for now
      date: new Date().toLocaleDateString('nl-BE'),
      creationDate: new Date().toLocaleDateString('nl-BE'),
      documentCount: files.length,
      status: DossierStatus.DRAFT,
      timeline: [
        {
          id: 'ev-1',
          date: t.justNow,
          title: t.dossierCreated,
          description: t.dossierInitialized,
          user: t.you
        }
      ],
      type: 'House'
    };

    DossierService.init();
    DossierService.add(newDossier);

    onComplete(newId);
  }, [dossierName, files.length, t, onComplete]);

  if (isExtracting) {
    return <ExtractionLoading lang={lang} onComplete={handleExtractionComplete} />;
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t.newCompromis}</h1>
        <p className="text-slate-600 dark:text-slate-400">{t.uploadSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Main Column: Form */}
        <div className="lg:col-span-8 space-y-8">

          {/* 1. Basic Info & Upload */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">1</div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.step1Title}</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t.compName}
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder={t.compNamePlaceholder}
                  value={dossierName}
                  onChange={(e) => setDossierName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t.uploadTitle}
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-8 text-center hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors relative cursor-pointer group">
                  <input
                    type="file"
                    multiple
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col items-center pointer-events-none group-hover:scale-105 transition-transform">
                    <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center mb-4 text-brand-500">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-slate-900 dark:text-white font-medium text-lg">{t.dropzone}</p>
                    <p className="text-slate-500 text-sm mt-1">{t.dropzoneSub}</p>
                  </div>
                </div>
              </div>

              {/* File Lists */}
              {files.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t.uploadedFiles}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
                        <div className="flex items-center overflow-hidden">
                          <FileText className="w-4 h-4 text-brand-500 mr-2 flex-shrink-0" />
                          <span className="text-sm truncate text-slate-700 dark:text-slate-300">{file.name}</span>
                        </div>
                        <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500 ml-2 p-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Template Selection */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">2</div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.chooseTemplate}</h2>
            </div>

            {/* Classification Status - Inline feedback */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 flex items-start">
              <Wand2 className="w-5 h-5 text-brand-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {t.aiSuggestionText} <strong>Standaard Verkoopsovereenkomst (Vlaanderen)</strong> {t.aiSuggestionTextEnd}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {getTemplates(lang).map(template => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`
                                  relative rounded-xl p-6 cursor-pointer border-2 transition-all
                                  ${selectedTemplateId === template.id
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/10'
                      : 'border-transparent bg-gray-50 dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600'
                    }
                              `}
                >
                  {template.isAiSuggested && (
                    <div className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] px-2 py-1 rounded-bl-lg rounded-tr-lg font-bold tracking-wide">
                      {t.recommended}
                    </div>
                  )}

                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${selectedTemplateId === template.id ? 'bg-brand-100 text-brand-600' : 'bg-white dark:bg-slate-700 text-slate-500'}`}>
                    {template.id.includes('vlaanderen') ? <Home className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                  </div>

                  <h3 className={`font-bold mb-1 ${selectedTemplateId === template.id ? 'text-brand-700 dark:text-brand-400' : 'text-slate-900 dark:text-white'}`}>
                    {template.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {template.description}
                  </p>

                  {selectedTemplateId === template.id && (
                    <div className="absolute bottom-4 right-4 text-brand-600">
                      <Check className="w-5 h-5" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t.remarks} <span className="text-slate-400 font-normal">({t.optional})</span>
              </label>
              <textarea
                rows={3}
                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm resize-none"
                placeholder={t.remarksPlaceholder}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>

        </div>

        {/* Right Column: Status & Action */}
        <div className="lg:col-span-4 space-y-8">

          {/* Document Checklist Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm sticky top-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center">
              <Check className="w-5 h-5 mr-2 text-green-500" />
              {t.documentChecklist}
            </h3>

            <div className="space-y-2 mb-8 max-h-[500px] overflow-y-auto pr-2">
              {Object.entries(getDocsByCategory()).map(([category, docs]) => {
                const isExpanded = expandedCategories.has(category);
                const presentCount = docs.filter(doc => getDocStatus(doc)).length;
                const totalCount = docs.length;
                const allPresent = presentCount === totalCount;

                return (
                  <div key={category} className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        )}
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${allPresent && presentCount > 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-500'}`}>
                          {presentCount}/{totalCount}
                        </span>
                        {allPresent && presentCount > 0 && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </button>

                    {/* Category Documents */}
                    {isExpanded && (
                      <div className="bg-white dark:bg-slate-900 p-2">
                        {docs.map(doc => {
                          const isPresent = getDocStatus(doc);
                          return (
                            <div key={doc.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                              <div className="flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-3 ${isPresent ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'}`}></div>
                                <span className={`text-xs ${isPresent ? 'text-slate-700 dark:text-slate-200 font-medium' : 'text-slate-400'}`}>
                                  {doc.label}
                                </span>
                              </div>
                              {isPresent && <Check className="w-3 h-3 text-green-500" />}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="border-t border-gray-100 dark:border-slate-800 pt-6">
              <button
                onClick={handleGenerate}
                disabled={!dossierName || !selectedTemplateId}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 transition-all flex items-center justify-center group"
              >
                {t.generate}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-xs text-center text-slate-400 mt-3 px-4">
                {t.generateDescription}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
