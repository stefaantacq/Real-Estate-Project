import React, { useState } from 'react';
import { Save, Download, FileText, Check, ChevronRight, Wand2, ArrowLeft, Eye } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS, MOCK_SUGGESTIONS } from '../constants';

interface EditorProps {
  lang: Language;
  onBack: () => void;
}

export const Editor: React.FC<EditorProps> = ({ lang, onBack }) => {
  const t = TRANSLATIONS[lang];
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);
  const [approvedSections, setApprovedSections] = useState<string[]>([]);
  
  // Mock Placeholder State
  const [placeholders, setPlaceholders] = useState({
    sellerName: '[PLACEHOLDER: Naam verkoper]',
    sellerAddress: '[PLACEHOLDER: Adres verkoper]',
    propertyAddress: '[PLACEHOLDER: Adres pand]',
    epcLabel: '[PLACEHOLDER: EPC Label]'
  });

  const applySuggestion = (key: string, value: string, id: string) => {
    setPlaceholders(prev => ({ ...prev, [key]: value }));
    setApprovedSections(prev => [...prev, id]);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 animate-in fade-in duration-500">
      
      {/* Main Toolbar & Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Compromis - Draft</h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {t.editing}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button className="flex items-center px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700">
              <Save className="w-4 h-4 mr-2" />
              {t.save}
            </button>
            <button className="flex items-center px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700">
              <Download className="w-4 h-4 mr-2" />
              {t.exportPdf}
            </button>
          </div>
        </div>

        {/* Document View (Mock WYSIWYG) */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-y-auto p-8 font-serif text-slate-900 dark:text-slate-100 leading-relaxed">
           <div className="max-w-3xl mx-auto space-y-8">
             <div className="text-center font-bold text-2xl uppercase border-b-2 border-slate-900 dark:border-slate-100 pb-4 mb-8">
               Verkoopcompromis
             </div>

             {/* Section 1 */}
             <div className="relative group border-l-4 border-transparent hover:border-brand-500 pl-4 transition-colors">
               <h3 className="font-bold text-lg mb-2 uppercase">Artikel 1: Partijen</h3>
               <p className="mb-4">Tussen ondergetekenden:</p>
               
               <div className="space-y-4">
                 <p className="font-bold underline">VERKOPER(S):</p>
                 <div>
                   Naam: <span className={`${placeholders.sellerName.includes('[') ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'} px-1 rounded`}>{placeholders.sellerName}</span>
                 </div>
                 <div>
                   Adres: <span className={`${placeholders.sellerAddress.includes('[') ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'} px-1 rounded`}>{placeholders.sellerAddress}</span>
                 </div>
               </div>

               {/* Section Hover Actions */}
               <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                 <button className="p-1 bg-green-500 text-white rounded hover:bg-green-600" title={t.sectionApprove}>
                   <Check className="w-4 h-4" />
                 </button>
               </div>
             </div>

             {/* Section 2 */}
             <div className="relative group border-l-4 border-transparent hover:border-brand-500 pl-4 transition-colors">
               <h3 className="font-bold text-lg mb-2 uppercase">Artikel 2: Object</h3>
               <p>De verkoper verklaart te verkopen aan de koper, die aanvaardt:</p>
               <p className="mt-2">
                 Een woonhuis gelegen te <span className={`${placeholders.propertyAddress.includes('[') ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'} px-1 rounded`}>{placeholders.propertyAddress}</span>.
               </p>
               <p className="mt-2">
                 EPC Score: <span className={`${placeholders.epcLabel.includes('[') ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'} px-1 rounded`}>{placeholders.epcLabel}</span>.
               </p>
             </div>
           </div>
        </div>
      </div>

      {/* AI Sidebar */}
      <div className="w-80 flex-shrink-0 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col">
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center">
          <Wand2 className="w-5 h-5 text-brand-600 mr-2" />
          <h3 className="font-bold text-slate-900 dark:text-white">{t.aiAssistant}</h3>
        </div>
        
        <div className="p-4 bg-blue-50 dark:bg-slate-800/50">
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.aiDesc}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
             <FileText className="w-3 h-3 mr-1" />
             {t.suggestions}
          </h4>

          {/* Suggestion Card 1 */}
          <div className={`p-4 rounded-lg border transition-all ${approvedSections.includes('s1') ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm'}`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-slate-500">Naam verkoper</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-medium">
                {t.highCertainty}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">Jan Janssens</p>
            <div className="flex items-center justify-between mt-3">
               <button className="text-xs flex items-center text-slate-500 hover:text-slate-900 dark:hover:text-white">
                 <Eye className="w-3 h-3 mr-1" />
                 Kadaster.pdf
               </button>
               {!approvedSections.includes('s1') ? (
                 <button 
                  onClick={() => applySuggestion('sellerName', 'Jan Janssens', 's1')}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center"
                 >
                   <Check className="w-3 h-3 mr-1" />
                   {t.apply}
                 </button>
               ) : (
                  <span className="text-green-600 text-xs flex items-center"><Check className="w-3 h-3 mr-1"/> Applied</span>
               )}
            </div>
          </div>

          {/* Suggestion Card 2 */}
           <div className={`p-4 rounded-lg border transition-all ${approvedSections.includes('s2') ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm'}`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-slate-500">Adres pand</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-medium">
                {t.highCertainty}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">Kerkstraat 123, 1000 Brussel</p>
            <div className="flex items-center justify-between mt-3">
               <button className="text-xs flex items-center text-slate-500 hover:text-slate-900 dark:hover:text-white">
                 <Eye className="w-3 h-3 mr-1" />
                 EPC.pdf
               </button>
               {!approvedSections.includes('s2') ? (
                 <button 
                  onClick={() => applySuggestion('propertyAddress', 'Kerkstraat 123, 1000 Brussel', 's2')}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center"
                 >
                   <Check className="w-3 h-3 mr-1" />
                   {t.apply}
                 </button>
               ) : (
                  <span className="text-green-600 text-xs flex items-center"><Check className="w-3 h-3 mr-1"/> Applied</span>
               )}
            </div>
          </div>

          {/* Suggestion Card 3 */}
           <div className={`p-4 rounded-lg border transition-all ${approvedSections.includes('s3') ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm'}`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-slate-500">EPC Label</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-medium">
                {t.highCertainty}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">B</p>
            <div className="flex items-center justify-between mt-3">
               <button className="text-xs flex items-center text-slate-500 hover:text-slate-900 dark:hover:text-white">
                 <Eye className="w-3 h-3 mr-1" />
                 EPC.pdf - Pag 1
               </button>
               {!approvedSections.includes('s3') ? (
                 <button 
                  onClick={() => applySuggestion('epcLabel', 'B', 's3')}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center"
                 >
                   <Check className="w-3 h-3 mr-1" />
                   {t.apply}
                 </button>
               ) : (
                  <span className="text-green-600 text-xs flex items-center"><Check className="w-3 h-3 mr-1"/> Applied</span>
               )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};