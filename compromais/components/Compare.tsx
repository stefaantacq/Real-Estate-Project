
import React from 'react';
import { ArrowLeft, ArrowRight, GitCompare, CheckCircle, XCircle } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface CompareProps {
    lang: Language;
    onBack: () => void;
}

export const Compare: React.FC<CompareProps> = ({ lang, onBack }) => {
    const t = TRANSLATIONS[lang];

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] animate-in fade-in duration-500">

            {/* Header */}
            <div className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center">
                    <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                            <GitCompare className="w-5 h-5 mr-2 text-brand-600" />
                            Versie Vergelijking
                        </h1>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                            <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-red-400 mr-1"></div> Draft 1.1</span>
                            <ArrowRight className="w-3 h-3" />
                            <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-green-400 mr-1"></div> Draft 1.2 (Huidig)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comparison View */}
            <div className="flex-1 overflow-y-auto p-8 bg-gray-100 dark:bg-slate-950 flex justify-center">
                <div className="max-w-4xl w-full bg-white dark:bg-slate-900 shadow-lg p-12 text-slate-900 dark:text-slate-100 font-serif leading-relaxed text-justify">

                    <h3 className="font-bold text-lg mb-4 uppercase text-center border-b pb-4">Verkoopcompromis</h3>

                    <div className="space-y-4">
                        <p>
                            De verkoper verklaart hierbij te verkopen aan de koper, die aanvaardt, het hierna beschreven onroerend goed.
                        </p>

                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-400 rounded-r relative group">
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"><CheckCircle className="w-4 h-4" /></button>
                                <button className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"><XCircle className="w-4 h-4" /></button>
                            </div>
                            <p className="text-sm text-slate-500 mb-1 font-sans font-bold uppercase tracking-wider">Wijziging gedetecteerd</p>
                            <div className="line-through text-red-400 opacity-70 mb-1">
                                De prijs voor het onroerend goed is vastgesteld op <span className="font-mono">€450.000</span> (vierhonderdvijftigduizend euro).
                            </div>
                            <div className="text-green-600 font-medium">
                                De prijs voor het onroerend goed is vastgesteld op <span className="font-mono">€455.000</span> (vierhonderdvijfenvijftigduizend euro), inclusief roerende goederen.
                            </div>
                        </div>

                        <p>
                            Het eigendom is belast met een <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-1 rounded mx-1 font-medium">recht van doorgang</span> ten voordele van het achterliggende perceel, zoals beschreven in de notariële akte verleden voor notaris X op datum Y.
                        </p>

                        <p>
                            De koper zal het genot hebben van het goed vanaf de datum van het verlijden van de authentieke akte, <span className="line-through text-red-400 dark:text-red-400/70 bg-red-50 dark:bg-red-900/10 decoration-2">op voorwaarde van betaling van de volledige koopsom</span>. Vanaf die datum zijn ook alle belastingen en taksen ten laste van de koper.
                        </p>
                    </div>

                </div>
            </div>

        </div>
    );
};
