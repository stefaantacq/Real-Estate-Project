import React, { useState } from 'react';
import { Upload, FileText, X, Home, Building2, Check, AlertCircle, Wand2 } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS, MOCK_TEMPLATES } from '../constants';

interface NewCompromiseProps {
  lang: Language;
  onCancel: () => void;
  onComplete: () => void;
}

export const NewCompromise: React.FC<NewCompromiseProps> = ({ lang, onCancel, onComplete }) => {
  const t = TRANSLATIONS[lang];
  const [step, setStep] = useState(1);
  const [dossierName, setDossierName] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [remarks, setRemarks] = useState('');

  // Mock required documents
  const requiredDocs = ['EPC', 'Kadaster', 'Bodemattest', 'Elektrische Keuring'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getDocStatus = (docName: string) => {
      const found = files.some(f => f.name.toLowerCase().includes(docName.toLowerCase()));
      return found;
  };

  const renderStep1 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="mb-6">
         <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.step1Title}</h2>
         <p className="text-slate-600 dark:text-slate-400">{t.step1Desc}</p>
       </div>

       <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 space-y-6">
         {/* Name Input */}
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

         {/* Upload Area */}
         <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t.uploadTitle}
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-8 text-center hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors relative cursor-pointer">
               <input 
                 type="file" 
                 multiple 
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 onChange={handleFileChange}
               />
               <div className="flex flex-col items-center pointer-events-none">
                 <Upload className="w-10 h-10 text-slate-400 mb-4" />
                 <p className="text-slate-900 dark:text-white font-medium">{t.dropzone}</p>
                 <p className="text-slate-500 text-sm mt-1">{t.dropzoneSub}</p>
               </div>
            </div>
         </div>

         {/* Classification Visualization */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Classified List */}
             <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{t.classifiedDocs}</h4>
                <div className="space-y-2">
                    {requiredDocs.map(doc => {
                        const isPresent = getDocStatus(doc);
                        return (
                            <div key={doc} className="flex items-center justify-between text-sm">
                                <span className={isPresent ? "text-slate-900 dark:text-white" : "text-slate-400"}>{doc}</span>
                                {isPresent ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-400" />}
                            </div>
                        )
                    })}
                </div>
             </div>

             {/* Unclassified / Files List */}
             <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
                 <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{t.otherDocs}</h4>
                 <div className="space-y-2 max-h-40 overflow-y-auto">
                    {files.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700">
                             <div className="flex items-center truncate">
                                <FileText className="w-4 h-4 text-brand-500 mr-2 flex-shrink-0" />
                                <span className="text-sm truncate text-slate-700 dark:text-slate-200">{file.name}</span>
                             </div>
                             <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500 ml-2">
                                <X className="w-4 h-4" />
                             </button>
                        </div>
                    ))}
                    {files.length === 0 && <p className="text-xs text-slate-400 italic">Geen documenten geupload</p>}
                 </div>
             </div>
         </div>

         <button 
           onClick={() => setStep(2)}
           disabled={!dossierName}
           className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
         >
           {t.continue}
         </button>
       </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="flex items-center mb-6">
        <button onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white mr-4">
          <span className="text-2xl">←</span>
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.chooseTemplate}</h2>
          <p className="text-slate-600 dark:text-slate-400">{t.chooseTemplateDesc}</p>
        </div>
      </div>

      <div className="space-y-8">
          {/* AI Suggestions */}
          <div>
              <div className="flex items-center mb-4 text-brand-600 dark:text-brand-400">
                  <Wand2 className="w-5 h-5 mr-2" />
                  <h3 className="font-bold uppercase tracking-wider text-sm">{t.aiSuggestions}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MOCK_TEMPLATES.filter(t => t.isAiSuggested).map(template => (
                      <div key={template.id} onClick={onComplete} className="bg-gradient-to-br from-brand-50 to-white dark:from-brand-900/20 dark:to-slate-900 border-2 border-brand-500/30 dark:border-brand-500/30 rounded-xl p-6 cursor-pointer hover:border-brand-500 transition-all relative overflow-hidden group">
                           <div className="absolute top-0 right-0 bg-brand-500 text-white text-xs px-2 py-1 rounded-bl-lg font-medium">98% Match</div>
                           <div className="w-12 h-12 rounded-lg bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center mb-4 text-brand-600 dark:text-brand-400">
                                <Home className="w-6 h-6" />
                           </div>
                           <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{template.name}</h3>
                           <p className="text-sm text-slate-500 mb-4">{template.description}</p>
                      </div>
                  ))}
              </div>
          </div>

          {/* Other Templates */}
          <div>
              <h3 className="font-bold uppercase tracking-wider text-sm text-slate-500 mb-4">{t.otherTemplates}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {MOCK_TEMPLATES.filter(t => !t.isAiSuggested).map(template => (
                      <div key={template.id} onClick={onComplete} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 hover:border-brand-500 dark:hover:border-brand-500 transition-all cursor-pointer">
                           <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-600 dark:text-slate-400">
                                <Building2 className="w-5 h-5" />
                           </div>
                           <h3 className="text-md font-bold text-slate-900 dark:text-white mb-1">{template.name}</h3>
                           <p className="text-xs text-slate-500">{template.description}</p>
                      </div>
                  ))}
              </div>
          </div>

          {/* Remarks / Prompt */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800">
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t.remarks}
               </label>
               <textarea 
                 rows={3}
                 className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                 placeholder={t.remarksPlaceholder}
                 value={remarks}
                 onChange={(e) => setRemarks(e.target.value)}
               />
               <button 
                  onClick={onComplete}
                  className="mt-4 w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <Wand2 className="w-5 h-5 mr-2" />
                  {t.generate}
               </button>
          </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {step === 1 ? renderStep1() : renderStep2()}
    </div>
  );
};
