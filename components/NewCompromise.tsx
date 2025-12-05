import React, { useState } from 'react';
import { Upload, FileText, X, Home, Building2, ChevronRight, File } from 'lucide-react';
import { Language, Template } from '../types';
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

  // Simulate file handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
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
            <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-8 text-center hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors relative">
               <input 
                 type="file" 
                 multiple 
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 onChange={handleFileChange}
               />
               <div className="flex flex-col items-center">
                 <Upload className="w-10 h-10 text-slate-400 mb-4" />
                 <p className="text-slate-900 dark:text-white font-medium">{t.dropzone}</p>
                 <p className="text-slate-500 text-sm mt-1">{t.dropzoneSub}</p>
               </div>
            </div>
         </div>

         {/* File List (Classified Mock) */}
         {files.length > 0 && (
           <div className="space-y-3">
             <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Geclassificeerde Documenten</h4>
             {files.map((file, i) => (
               <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                 <div className="flex items-center">
                   <FileText className="w-5 h-5 text-brand-500 mr-3" />
                   <div>
                     <p className="text-sm font-medium text-slate-900 dark:text-white">{file.name}</p>
                     <p className="text-xs text-slate-500">
                        {/* Mock Classification logic */}
                        {file.name.toLowerCase().includes('epc') ? 'Energieprestatie' : 
                         file.name.toLowerCase().includes('kadaster') ? 'Kadastrale Gegevens' : 'Andere documenten'}
                     </p>
                   </div>
                 </div>
                 <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500">
                   <X className="w-5 h-5" />
                 </button>
               </div>
             ))}
           </div>
         )}

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

      {/* Tabs Mock */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg w-fit mb-6">
        <button className="px-4 py-2 rounded-md bg-white dark:bg-slate-700 shadow-sm text-sm font-medium text-slate-900 dark:text-white">
          {t.cibTemplates}
        </button>
        <button className="px-4 py-2 rounded-md text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white">
          {t.ownTemplates}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_TEMPLATES.map((template) => (
          <div key={template.id} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 hover:border-brand-500 dark:hover:border-brand-500 transition-all cursor-pointer group">
             <div className="w-12 h-12 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mb-4 text-brand-600 dark:text-brand-400">
                {template.type === 'House' ? <Home className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
             </div>
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{template.name}</h3>
             <p className="text-sm text-slate-500 mb-4">{template.description}</p>
             
             <div className="flex items-center text-xs text-slate-400 mb-6">
               <File className="w-4 h-4 mr-1" />
               Type: {template.type}
             </div>

             <button 
               onClick={onComplete}
               className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg group-hover:bg-brand-600 group-hover:text-white transition-colors font-medium text-sm"
             >
               {t.useTemplate}
             </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      {step === 1 ? renderStep1() : renderStep2()}
    </div>
  );
};