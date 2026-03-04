import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
    ArrowLeft, GitCompare, RefreshCw, FileText,
    ChevronDown, CheckCircle, AlertCircle, Minus, Plus,
    Eye, Columns, ListFilter, ArrowUpDown, Info
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { api } from '../services/api';
import * as diff from 'diff';

interface CompareProps {
    lang: Language;
    onBack: () => void;
}

interface VersionOption {
    id: string;
    number: string;
    source: string;
    originalDate: string;
    agreementName: string;
    label: string;
    hasPlaceholderSnapshot: boolean;
}

interface SectionDiff {
    title: string;
    parts: diff.Change[];
    addedCount: number;
    removedCount: number;
    hasChanges: boolean;
}

// Extracts readable plain text from sections (replaces placeholder tags with resolved values)
const getSectionTexts = (sections: any[]): { title: string; text: string }[] => {
    return sections.map(s => {
        let contentCopy = s.content || s.tekst_inhoud || '';
        (s.placeholders || []).forEach((p: any) => {
            const tag1 = `[[${p.id}]]`;
            const tag2 = `[placeholder:${p.id}]`;
            const val = p.currentValue ? `${p.currentValue}` : '_____';
            contentCopy = contentCopy.split(tag1).join(val).split(tag2).join(val);
        });

        // Convert HTML to readable text
        const tempDiv = document.createElement('div');
        const htmlWithNewlines = contentCopy
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>/gi, '\n')
            .replace(/<\/div>/gi, '\n')
            .replace(/<\/li>/gi, '\n');
        tempDiv.innerHTML = htmlWithNewlines;
        const text = (tempDiv.textContent || tempDiv.innerText || '').trim();
        return { title: s.title || s.titel || 'Sectie', text };
    });
};

// Count changed words in a diff result
const countChanges = (parts: diff.Change[]) => {
    let added = 0;
    let removed = 0;
    parts.forEach(p => {
        if (p.added) added += p.value.trim().split(/\s+/).filter(Boolean).length;
        if (p.removed) removed += p.value.trim().split(/\s+/).filter(Boolean).length;
    });
    return { added, removed };
};

export const Compare: React.FC<CompareProps> = ({ lang, onBack }) => {
    const t = TRANSLATIONS[lang] as any;
    const { id: dossierId } = useParams<{ id: string }>();

    const [isLoading, setIsLoading] = useState(true);
    const [availableVersions, setAvailableVersions] = useState<VersionOption[]>([]);
    const [version1Id, setVersion1Id] = useState('');
    const [version2Id, setVersion2Id] = useState('');
    const [isDiffing, setIsDiffing] = useState(false);
    const [sectionDiffs, setSectionDiffs] = useState<SectionDiff[]>([]);
    const [activeSectionIdx, setActiveSectionIdx] = useState(0);
    const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [version1Label, setVersion1Label] = useState('');
    const [version2Label, setVersion2Label] = useState('');
    const [v1HasSnapshot, setV1HasSnapshot] = useState(true);
    const [v2HasSnapshot, setV2HasSnapshot] = useState(true);
    const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Load available versions
    useEffect(() => {
        const fetchDossier = async () => {
            if (!dossierId) return;
            try {
                const data: any = await api.getDossierById(dossierId);
                const versionsList: VersionOption[] = [];
                if (data.agreements) {
                    data.agreements.forEach((agg: any) => {
                        const aggName = agg.templateName || t.customAgreement;
                        agg.versions.forEach((v: any) => {
                            versionsList.push({
                                id: v.id,
                                number: v.number,
                                source: v.source,
                                originalDate: v.date,
                                agreementName: aggName,
                                label: `${aggName} — v${v.number} (${v.source})`,
                                hasPlaceholderSnapshot: v.hasPlaceholderSnapshot ?? false
                            });
                        });
                    });
                }
                versionsList.reverse();
                setAvailableVersions(versionsList);

                if (versionsList.length >= 2) {
                    setVersion1Id(versionsList[1].id);
                    setVersion2Id(versionsList[0].id);
                } else if (versionsList.length === 1) {
                    setVersion1Id(versionsList[0].id);
                    setVersion2Id(versionsList[0].id);
                }
            } catch (err) {
                console.error('Failed to fetch dossier', err);
                setErrorMsg(t.compareLoadError);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDossier();
    }, [dossierId]);

    // Compute diff when versions change
    useEffect(() => {
        if (!version1Id || !version2Id || version1Id === version2Id) {
            setSectionDiffs([]);
            return;
        }
        const compute = async () => {
            setIsDiffing(true);
            setErrorMsg(null);
            try {
                const [v1, v2] = await Promise.all([
                    api.getVersion(version1Id),
                    api.getVersion(version2Id)
                ]);

                const v1o = v1 as any;
                const v2o = v2 as any;
                setVersion1Label(availableVersions.find(v => v.id === version1Id)?.label || version1Id);
                setVersion2Label(availableVersions.find(v => v.id === version2Id)?.label || version2Id);
                setV1HasSnapshot(v1o.hasPlaceholderSnapshot ?? false);
                setV2HasSnapshot(v2o.hasPlaceholderSnapshot ?? false);

                const sections1 = getSectionTexts(v1o.sections || []);
                const sections2 = getSectionTexts(v2o.sections || []);

                // Merge section lists by title, keeping order
                const allTitles = [
                    ...sections1.map(s => s.title),
                    ...sections2.filter(s2 => !sections1.find(s1 => s1.title === s2.title)).map(s => s.title)
                ];

                const diffs: SectionDiff[] = allTitles.map(title => {
                    const s1 = sections1.find(s => s.title === title)?.text || '';
                    const s2 = sections2.find(s => s.title === title)?.text || '';

                    // Use diffWords for natural word-level diffs; gives clean readable output
                    const parts = diff.diffWords(s1, s2);
                    const { added, removed } = countChanges(parts);
                    return {
                        title,
                        parts,
                        addedCount: added,
                        removedCount: removed,
                        hasChanges: added > 0 || removed > 0
                    };
                });

                setSectionDiffs(diffs);
                setActiveSectionIdx(0);
            } catch (err: any) {
                console.error('Diff failed', err);
                setErrorMsg(`${t.compareDiffError}: ${err.message || ''}`);
            } finally {
                setIsDiffing(false);
            }
        };
        compute();
    }, [version1Id, version2Id]);

    const totalAdded = sectionDiffs.reduce((a, s) => a + s.addedCount, 0);
    const totalRemoved = sectionDiffs.reduce((a, s) => a + s.removedCount, 0);
    const changedSections = sectionDiffs.filter(s => s.hasChanges).length;

    const scrollToSection = (idx: number) => {
        setActiveSectionIdx(idx);
        sectionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const renderUnifiedDiff = (parts: diff.Change[]) => (
        <div className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-slate-800 dark:text-slate-200">
            {parts.map((part, i) => {
                if (part.added) {
                    return (
                        <mark key={i} className="bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200 rounded-sm not-italic font-normal">
                            {part.value}
                        </mark>
                    );
                }
                if (part.removed) {
                    return (
                        <span key={i} className="bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 rounded-sm" style={{ textDecoration: 'line-through', textDecorationColor: '#f87171' }}>
                            {part.value}
                        </span>
                    );
                }
                return <span key={i} className="text-slate-700 dark:text-slate-300">{part.value}</span>;
            })}
        </div>
    );

    const renderSplitDiff = (parts: diff.Change[]) => {
        // Build left (old) and right (new) token lists
        const leftParts: diff.Change[] = [];
        const rightParts: diff.Change[] = [];
        parts.forEach(p => {
            if (p.removed) leftParts.push(p);
            else if (p.added) rightParts.push(p);
            else {
                leftParts.push(p);
                rightParts.push(p);
            }
        });

        const renderSide = (items: diff.Change[], side: 'left' | 'right') => (
            <div className="whitespace-pre-wrap font-serif text-sm leading-relaxed">
                {items.map((part, i) => {
                    if (part.removed && side === 'left') {
                        return <mark key={i} className="bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 rounded-sm not-italic font-normal">{part.value}</mark>;
                    }
                    if (part.added && side === 'right') {
                        return <mark key={i} className="bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200 rounded-sm not-italic font-normal">{part.value}</mark>;
                    }
                    return <span key={i} className="text-slate-700 dark:text-slate-300">{part.value}</span>;
                })}
            </div>
        );

        return (
            <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-700">
                <div className="p-4 bg-red-50/30 dark:bg-red-950/10">{renderSide(leftParts, 'left')}</div>
                <div className="p-4 bg-emerald-50/30 dark:bg-emerald-950/10">{renderSide(rightParts, 'right')}</div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-slate-500 text-sm">{t.compareLoading}</p>
                </div>
            </div>
        );
    }

    const isSameVersion = version1Id === version2Id;

    return (
        <div
            className="flex flex-col bg-slate-50 dark:bg-slate-950"
            style={{ height: 'calc(100vh - 6rem)' }}
        >
            {/* ── Top bar ── */}
            <div className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-10">
                {/* Row 1: back + title + view toggle */}
                <div className="flex items-center justify-between px-6 h-14 gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-2">
                            <GitCompare className="w-5 h-5 text-indigo-500" />
                            <h1 className="text-base font-bold text-slate-900 dark:text-white">
                                {t.compareTitle}
                            </h1>
                        </div>
                    </div>

                    {/* View mode toggle */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('unified')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'unified'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <Eye className="w-3.5 h-3.5" />
                            {t.compareUnified}
                        </button>
                        <button
                            onClick={() => setViewMode('split')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'split'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <Columns className="w-3.5 h-3.5" />
                            {t.compareSplit}
                        </button>
                    </div>
                </div>

                {/* Row 2: version selectors + stats */}
                <div className="flex items-center gap-4 px-6 pb-3 flex-wrap">
                    {/* Version 1 (Old) */}
                    <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-xl px-3 py-2 min-w-0 flex-1 max-w-xs">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 shrink-0 leading-none">{t.compareOld}</span>
                        <div className="relative min-w-0 flex-1 flex items-center">
                            <select
                                value={version1Id}
                                onChange={e => setVersion1Id(e.target.value)}
                                className="w-full bg-transparent text-xs font-semibold text-red-800 dark:text-red-300 outline-none cursor-pointer truncate appearance-none pr-4 leading-none py-0"
                            >
                                {availableVersions.map(v => (
                                    <option key={v.id} value={v.id}>{v.hasPlaceholderSnapshot ? '' : '⚠ '}{v.label} — {v.originalDate}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-3 h-3 text-red-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />

                    {/* Version 2 (New) */}
                    <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl px-3 py-2 min-w-0 flex-1 max-w-xs">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 shrink-0 leading-none">{t.compareNew}</span>
                        <div className="relative min-w-0 flex-1 flex items-center">
                            <select
                                value={version2Id}
                                onChange={e => setVersion2Id(e.target.value)}
                                className="w-full bg-transparent text-xs font-semibold text-emerald-800 dark:text-emerald-300 outline-none cursor-pointer truncate appearance-none pr-4 leading-none py-0"
                            >
                                {availableVersions.map(v => (
                                    <option key={v.id} value={v.id}>{v.hasPlaceholderSnapshot ? '' : '⚠ '}{v.label} — {v.originalDate}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-3 h-3 text-emerald-500 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    {/* Stats pills */}
                    {!isSameVersion && !isDiffing && sectionDiffs.length > 0 && (
                        <div className="flex items-center gap-3 ml-auto shrink-0">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800/30">
                                <Plus className="w-3 h-3 text-emerald-600" />
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{totalAdded} {t.compareWords}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/30">
                                <Minus className="w-3 h-3 text-red-500" />
                                <span className="text-xs font-bold text-red-600 dark:text-red-400">{totalRemoved} {t.compareWords}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/30">
                                <ListFilter className="w-3 h-3 text-amber-600" />
                                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{changedSections}/{sectionDiffs.length} {t.compareSectionsChanged}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Legend bar ── */}
            {!isSameVersion && !isDiffing && sectionDiffs.length > 0 && (
                <div className="shrink-0 flex items-center gap-6 px-6 py-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block w-4 h-3 rounded-sm bg-emerald-100 dark:bg-emerald-900/40" />
                        {t.compareAdded}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block w-4 h-3 rounded-sm bg-red-100 dark:bg-red-900/40" style={{ textDecoration: 'line-through' }} />
                        {t.compareRemoved}
                    </span>
                    {viewMode === 'split' && (
                        <>
                            <span className="flex items-center gap-1.5 ml-4 text-red-400 font-semibold">{t.compareSplitOld}</span>
                            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">{t.compareSplitNew}</span>
                        </>
                    )}
                </div>
            )}

            {/* ── Snapshot warning banner ── */}
            {!isSameVersion && (!v1HasSnapshot || !v2HasSnapshot) && (
                <div className="shrink-0 flex items-start gap-3 px-6 py-3 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800/40">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-800 dark:text-amber-200">
                        <strong>Beperkte vergelijking:</strong> {
                            !v1HasSnapshot && !v2HasSnapshot
                                ? 'Beide versies hebben geen historische placeholder-snapshot. Placeholders tonen huidige waarden.'
                                : !v1HasSnapshot
                                    ? 'De linker (oude) versie heeft geen historische placeholder-snapshot — placeholders tonen de huidige waarden i.p.v. de waarden van toen die versie werd aangemaakt.'
                                    : 'De rechter (nieuwe) versie heeft geen historische placeholder-snapshot.'
                        }{' '}
                        <span className="opacity-70">Versies aangemaakt vóór de snapshot-functie bevatten geen historische placeholder data.</span>
                    </div>
                </div>
            )}

            {/* ── Main content ── */}
            <div className="flex flex-1 min-h-0 relative">
                {/* Section sidebar */}
                {!isSameVersion && !isDiffing && sectionDiffs.length > 0 && (
                    <aside className="w-60 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
                        <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t.compareSections}</p>
                        </div>
                        <nav className="p-2 space-y-0.5">
                            {sectionDiffs.map((s, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => scrollToSection(idx)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-start gap-2 ${activeSectionIdx === idx
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="mt-0.5 shrink-0">
                                        {s.hasChanges ? (
                                            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                        ) : (
                                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                        )}
                                    </span>
                                    <span className="leading-snug">{s.title}</span>
                                    {s.hasChanges && (
                                        <span className="ml-auto shrink-0 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                                            {s.addedCount + s.removedCount}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </aside>
                )}

                {/* Diff document area */}
                <main className="flex-1 overflow-y-auto">
                    {/* Loading overlay */}
                    {isDiffing && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm">
                            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
                            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{t.compareDiffing}</p>
                        </div>
                    )}

                    {/* Error */}
                    {errorMsg && (
                        <div className="m-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
                            {errorMsg}
                        </div>
                    )}

                    {/* Same version selected */}
                    {!isDiffing && !errorMsg && isSameVersion && (
                        <div className="flex flex-col items-center justify-center h-full text-center px-8">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                <Info className="w-8 h-8 text-slate-400" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{t.compareSelectTwo}</h2>
                            <p className="text-slate-500 text-sm max-w-xs">{t.compareSelectTwoDesc}</p>
                        </div>
                    )}

                    {/* Not enough versions */}
                    {!isDiffing && !errorMsg && !isSameVersion && availableVersions.length < 2 && (
                        <div className="flex flex-col items-center justify-center h-full text-center px-8">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                <FileText className="w-8 h-8 text-slate-400" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{t.compareNotEnough}</h2>
                            <p className="text-slate-500 text-sm max-w-xs">{t.compareNotEnoughDesc}</p>
                        </div>
                    )}

                    {/* Diff sections */}
                    {!isDiffing && !errorMsg && !isSameVersion && sectionDiffs.length > 0 && (
                        <div className="max-w-5xl mx-auto py-8 px-6 space-y-6">
                            {/* Column headers for split view */}
                            {viewMode === 'split' && (
                                <div className="grid grid-cols-2 gap-0 text-xs font-bold text-center">
                                    <div className="py-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-tl-xl border border-red-200 dark:border-red-800/40 truncate px-4">
                                        {version1Label}
                                    </div>
                                    <div className="py-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-tr-xl border border-emerald-200 dark:border-emerald-800/40 border-l-0 truncate px-4">
                                        {version2Label}
                                    </div>
                                </div>
                            )}

                            {sectionDiffs.map((section, idx) => (
                                <div
                                    key={idx}
                                    ref={el => { sectionRefs.current[idx] = el; }}
                                    className={`rounded-2xl border overflow-hidden shadow-sm transition-all ${section.hasChanges
                                        ? 'border-amber-200 dark:border-amber-800/40'
                                        : 'border-slate-200 dark:border-slate-700'
                                        }`}
                                >
                                    {/* Section header */}
                                    <div className={`flex items-center justify-between px-5 py-3 ${section.hasChanges
                                        ? 'bg-amber-50 dark:bg-amber-950/20'
                                        : 'bg-slate-50 dark:bg-slate-800/50'
                                        }`}>
                                        <div className="flex items-center gap-2">
                                            {section.hasChanges ? (
                                                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                            )}
                                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{section.title}</h3>
                                        </div>
                                        {section.hasChanges ? (
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="flex items-center gap-1 text-red-500 dark:text-red-400 font-semibold">
                                                    <Minus className="w-3 h-3" />{section.removedCount}
                                                </span>
                                                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                                    <Plus className="w-3 h-3" />{section.addedCount}
                                                </span>
                                                <span className="text-amber-600 dark:text-amber-400 font-bold ml-1">{t.compareChanged}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{t.compareUnchanged}</span>
                                        )}
                                    </div>

                                    {/* Diff content */}
                                    <div className="bg-white dark:bg-slate-900">
                                        {viewMode === 'unified' ? (
                                            <div className="p-6">{renderUnifiedDiff(section.parts)}</div>
                                        ) : (
                                            renderSplitDiff(section.parts)
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Footer summary */}
                            <div className="mt-6 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500">
                                <span>
                                    <strong className="text-slate-800 dark:text-white">{changedSections}</strong> {t.compareSummary} <strong className="text-slate-800 dark:text-white">{sectionDiffs.length}</strong> {t.compareSummary2}
                                </span>
                                <div className="flex items-center gap-4">
                                    <span className="text-emerald-600 font-semibold">+{totalAdded} {t.compareWordsAdded}</span>
                                    <span className="text-red-500 font-semibold">−{totalRemoved} {t.compareWordsRemoved}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};
