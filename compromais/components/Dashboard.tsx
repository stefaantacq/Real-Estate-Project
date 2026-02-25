import React, { useState } from 'react';
import { Search, Clock, CheckCircle, FileText, Archive, ChevronRight, MapPin, LayoutGrid } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  useDroppable
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { Language, Dossier, DossierStatus } from '../types';
import { TRANSLATIONS } from '../constants';
import { api } from '../services/api';
import { SortableDossierCard } from './SortableDossierCard';
import { ContextMenu } from './ContextMenu';

interface DashboardProps {
  lang: Language;
  onNewDossier: () => void;
  onOpenDossier: (id: string) => void;
}

const SectionContainer: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const { setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef} className="min-h-[100px]">{children}</div>;
};

export const Dashboard: React.FC<DashboardProps> = ({ lang, onNewDossier, onOpenDossier }) => {
  const t = TRANSLATIONS[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [sortMode, setSortMode] = useState<'manual' | 'recent' | 'archived'>(() => {
    const saved = sessionStorage.getItem('dashboardSortMode');
    return (saved === 'recent' || saved === 'manual' || saved === 'archived') ? saved : 'manual';
  });

  // Save sortMode to sessionStorage whenever it changes
  React.useEffect(() => {
    sessionStorage.setItem('dashboardSortMode', sortMode);
  }, [sortMode]);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, id: string, status: DossierStatus } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load dossiers from API
  React.useEffect(() => {
    const fetchDossiers = async () => {
      try {
        const data = await api.getDossiers();
        const mappedDossiers = data.map((d: any) => ({
          id: d.id, // API already returns 'id' as 'ui_id'
          name: d.name,
          address: d.address,
          date: new Date(d.date).toLocaleDateString('nl-BE'),
          status: d.status as DossierStatus,
          type: d.type
        }));
        setDossiers(mappedDossiers);
      } catch (err) {
        console.error("Failed to load dossiers", err);
      }
    };
    fetchDossiers();
  }, []);

  // Section Filters
  const conceptDossiers = dossiers.filter(d =>
    d.status === DossierStatus.DRAFT &&
    (d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const inBehandelingDossiers = dossiers.filter(d =>
    (d.status === DossierStatus.ACTIVE || d.status === DossierStatus.COMPLETED) &&
    (d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const archivedDossiers = dossiers.filter(d =>
    d.status === DossierStatus.ARCHIVED &&
    (d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the containers
    const activeDossier = dossiers.find(d => d.id === activeId);
    if (!activeDossier) return;

    // Is 'over' a dossier or a container?
    // In our simplified setup, we'll check if overId matches any container name or item id
    const containers = ['concept', 'inBehandeling', 'archief'];
    const overContainer = containers.find(c => c === overId) ||
      (dossiers.find(d => d.id === overId)?.status === DossierStatus.DRAFT ? 'concept' :
        dossiers.find(d => d.id === overId)?.status === DossierStatus.ARCHIVED ? 'archief' : 'inBehandeling');

    if (activeDossier.status !== getStatusFromContainer(overContainer)) {
      setDossiers(prev => {
        const newDossiers = [...prev];
        const index = newDossiers.findIndex(d => d.id === activeId);
        if (index !== -1) {
          newDossiers[index] = { ...newDossiers[index], status: getStatusFromContainer(overContainer) };
        }
        return newDossiers;
      });
    }
  };

  const getStatusFromContainer = (container: string): DossierStatus => {
    switch (container) {
      case 'concept': return DossierStatus.DRAFT;
      case 'archief': return DossierStatus.ARCHIVED;
      default: return DossierStatus.ACTIVE;
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeId = active.id;
      const overId = over.id;

      setDossiers((items) => {
        const oldIndex = items.findIndex((i) => i.id === activeId);
        const overIndex = items.findIndex((i) => i.id === overId);

        // If dropping onto a container header or empty space (if we added Droppable spots)
        // for now we assume overId is an item id.

        let newDossiers = [...items];
        if (overIndex !== -1) {
          newDossiers = arrayMove(items, oldIndex, overIndex);
        }

        // Final sync with API
        // Map all dossiers to their sequence and status
        const orders = newDossiers.map((d, index) => ({
          id: d.id,
          order: index,
          status: d.status
        }));

        api.reorderDossiers(orders).catch(err => {
          console.error("Failed to sync reorder", err);
        });

        return newDossiers;
      });
    } else if (over && active.id === over.id) {
      // Just sync if status changed (even if order didn't change much in global list)
      // (handleDragOver already updated the status in state)
      const orders = dossiers.map((d, index) => ({
        id: d.id,
        order: index,
        status: d.status
      }));
      api.reorderDossiers(orders).catch(err => {
        console.error("Failed to sync reorder", err);
      });
    }
  };

  const handleContextMenu = (e: React.MouseEvent, id: string, status: DossierStatus) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, id, status });
  };

  const handleMoveTo = async (id: string, newStatus: DossierStatus) => {
    setDossiers(prev => {
      const newDossiers = [...prev];
      const index = newDossiers.findIndex(d => d.id === id);
      if (index !== -1) {
        newDossiers[index] = { ...newDossiers[index], status: newStatus };
      }

      // Sync with API
      const orders = newDossiers.map((d, index) => ({
        id: d.id,
        order: index,
        status: d.status
      }));

      api.reorderDossiers(orders).catch(err => {
        console.error("Failed to sync status move", err);
      });

      return newDossiers;
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Ben je zeker dat je dit dossier wilt verwijderen?')) return;
    try {
      await api.deleteDossier(id);
      setDossiers(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error("Failed to delete dossier", err);
      alert("Kon dossier niet verwijderen.");
    }
  };

  const renderCard = (dossier: Dossier) => (
    <div
      key={dossier.id}
      onClick={() => onOpenDossier(dossier.id)}
      className="flex flex-col bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-500 hover:shadow-lg transition-all cursor-pointer group min-w-[280px] h-full min-h-[120px]"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center min-w-0 flex-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{dossier.name}</h3>
        </div>
      </div>

      <div className="space-y-1 mt-auto">
        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 truncate">
          <MapPin className="w-3 h-3 mr-1" />
          {dossier.address}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {dossier.date}</span>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500">

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* View Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
          <button
            onClick={() => setSortMode('manual')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${sortMode === 'manual'
              ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Mijn opdeling
          </button>
          <button
            onClick={() => setSortMode('recent')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${sortMode === 'recent'
              ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
          >
            <Clock className="w-4 h-4" />
            Recent
          </button>
          <button
            onClick={() => setSortMode('archived')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${sortMode === 'archived'
              ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
          >
            <Archive className="w-4 h-4" />
            Archief
          </button>
        </div>

        {/* Top Right Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-full pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none shadow-sm"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {sortMode === 'manual' ? (
          <>
            {/* Section 1: Concept */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 pl-1 flex items-center justify-between">
                <span>Concept</span>
                <span className="text-xs font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{conceptDossiers.length}</span>
              </h2>

              <SectionContainer id="concept">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <SortableContext
                    items={conceptDossiers.map(d => d.id)}
                    strategy={rectSortingStrategy}
                    disabled={searchTerm.length > 0}
                  >
                    {conceptDossiers.length > 0 ? conceptDossiers.map((dossier) => (
                      <SortableDossierCard
                        key={dossier.id}
                        dossier={dossier}
                        lang={lang}
                        onOpenDossier={onOpenDossier}
                        onContextMenu={handleContextMenu}
                      />
                    )) : (
                      <div className="col-span-full py-8 text-center text-slate-400 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
                        Sleep hier dossiers naartoe om ze naar Concept te verplaatsen
                      </div>
                    )}
                  </SortableContext>

                  {/* Quick Add Card Placeholder */}
                  <div
                    onClick={onNewDossier}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-500 hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-all cursor-pointer h-full min-h-[120px] group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/30 flex items-center justify-center text-slate-400 group-hover:text-brand-600 transition-colors mb-2">
                      <span className="text-xl font-light">+</span>
                    </div>
                    <span className="text-xs font-medium text-slate-500 group-hover:text-brand-600 transition-colors">{t.newCompromis}</span>
                  </div>
                </div>
              </SectionContainer>
            </div>

            {/* Section 2: In Behandeling */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 pl-1 flex items-center justify-between">
                <span>In Behandeling</span>
                <span className="text-xs font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{inBehandelingDossiers.length}</span>
              </h2>
              <SectionContainer id="inBehandeling">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <SortableContext
                    items={inBehandelingDossiers.map(d => d.id)}
                    strategy={rectSortingStrategy}
                    disabled={searchTerm.length > 0}
                  >
                    {inBehandelingDossiers.length > 0 ? inBehandelingDossiers.map((dossier) => (
                      <SortableDossierCard
                        key={dossier.id}
                        dossier={dossier}
                        lang={lang}
                        onOpenDossier={onOpenDossier}
                        onContextMenu={handleContextMenu}
                      />
                    )) : (
                      <div className="col-span-full py-8 text-center text-slate-400 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
                        Sleep hier dossiers naartoe om ze naar In Behandeling te verplaatsen
                      </div>
                    )}
                  </SortableContext>
                </div>
              </SectionContainer>
            </div>

            {/* Section 3: Archive */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 pl-1 flex items-center justify-between">
                <span>{t.archive}</span>
                <span className="text-xs font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{archivedDossiers.length}</span>
              </h2>
              <SectionContainer id="archief">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <SortableContext
                    items={archivedDossiers.map(d => d.id)}
                    strategy={rectSortingStrategy}
                    disabled={searchTerm.length > 0}
                  >
                    {archivedDossiers.length > 0 ? archivedDossiers.map((dossier) => (
                      <SortableDossierCard
                        key={dossier.id}
                        dossier={dossier}
                        lang={lang}
                        onOpenDossier={onOpenDossier}
                        onContextMenu={handleContextMenu}
                      />
                    )) : (
                      <div className="col-span-full py-8 text-center text-slate-400 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
                        Sleep hier dossiers naartoe om te archiveren
                      </div>
                    )}
                  </SortableContext>
                </div>
              </SectionContainer>
            </div>
          </>
        ) : sortMode === 'recent' ? (
          /* Recent view: All dossiers sorted by last opened */
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 pl-1 flex items-center justify-between">
              <span>Recent gebruikt</span>
              <span className="text-xs font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {dossiers.length}
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...dossiers]
                .sort((a, b) => {
                  const dateA = a.lastOpened ? new Date(a.lastOpened).getTime() : 0;
                  const dateB = b.lastOpened ? new Date(b.lastOpened).getTime() : 0;
                  return dateB - dateA;
                })
                .map(dossier => (
                  <SortableDossierCard
                    key={dossier.id}
                    dossier={dossier}
                    lang={lang}
                    onOpenDossier={onOpenDossier}
                    onContextMenu={handleContextMenu}
                  />
                ))}
            </div>
          </div>
        ) : (
          /* Archived view: Only archived dossiers */
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 pl-1 flex items-center justify-between">
              <span>Gearchiveerd</span>
              <span className="text-xs font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {dossiers.filter(d => d.status === DossierStatus.ARCHIVED).length}
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {dossiers
                .filter(d => d.status === DossierStatus.ARCHIVED)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(dossier => (
                  <SortableDossierCard
                    key={dossier.id}
                    dossier={dossier}
                    lang={lang}
                    onOpenDossier={onOpenDossier}
                    onContextMenu={handleContextMenu}
                  />
                ))}
              {dossiers.filter(d => d.status === DossierStatus.ARCHIVED).length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800">
                  Geen gearchiveerde dossiers gevonden.
                </div>
              )}
            </div>
          </div>
        )}
      </DndContext>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          currentStatus={contextMenu.status}
          onClose={() => setContextMenu(null)}
          onMove={(newStatus) => handleMoveTo(contextMenu.id, newStatus)}
          onDelete={() => handleDelete(contextMenu.id)}
        />
      )}
    </div>
  );
};