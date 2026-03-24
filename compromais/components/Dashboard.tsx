import React, { useState } from 'react';
import { Search, Clock, Archive, ChevronRight, MapPin, LayoutGrid } from 'lucide-react';
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
import { Tabs, TabsList, TabsTrigger } from './ui/Tabs';
import { Badge } from './ui/Badge';
import { Input } from './ui/Input';

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
          id: d.id,
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

  const getStatusFromContainer = (container: string): DossierStatus => {
    switch (container) {
      case 'concept': return DossierStatus.DRAFT;
      case 'archief': return DossierStatus.ARCHIVED;
      default: return DossierStatus.ACTIVE;
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    setDossiers((items) => {
      const activeIndex = items.findIndex((i) => i.id === activeId);
      if (activeIndex === -1) return items;

      const overIndex = items.findIndex((i) => i.id === overId);
      const isOverContainer = ['concept', 'inBehandeling', 'archief'].includes(overId as string);

      let targetStatus = items[activeIndex].status;
      if (isOverContainer) {
        targetStatus = getStatusFromContainer(overId as string);
      } else if (overIndex !== -1) {
        targetStatus = items[overIndex].status;
      }

      if (items[activeIndex].status !== targetStatus) {
        const newItems = [...items];
        newItems[activeIndex] = { ...newItems[activeIndex], status: targetStatus };
        if (overIndex !== -1) {
          return arrayMove(newItems, activeIndex, overIndex);
        }
        return newItems;
      }
      
      if (overIndex !== -1 && activeIndex !== overIndex) {
         return arrayMove(items, activeIndex, overIndex);
      }
      return items;
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setDossiers((items) => {
        let finalItems = [...items];
        if (over && active.id !== over.id) {
           const activeIndex = items.findIndex(i => i.id === active.id);
           const overIndex = items.findIndex(i => i.id === over.id);
           if (activeIndex !== -1 && overIndex !== -1) {
              finalItems = arrayMove(finalItems, activeIndex, overIndex);
           }
        }
        
        const orders = finalItems.map((d, index) => ({
          id: d.id,
          order: index,
          status: d.status
        }));
        
        api.reorderDossiers(orders).catch(console.error);

        return finalItems;
    });
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
    if (!window.confirm(t.deleteConfirmation)) return;
    try {
      await api.deleteDossier(id);
      setDossiers(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error("Failed to delete dossier", err);
      alert(t.deleteDossierError);
    }
  };

  const renderSectionHeader = (title: string, count: number) => (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</h2>
      <Badge variant="secondary" className="text-[10px]">{count}</Badge>
    </div>
  );

  return (
    <div className="space-y-8">

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <Tabs>
          <TabsList>
            <TabsTrigger
              active={sortMode === 'manual'}
              onClick={() => setSortMode('manual')}
            >
              <LayoutGrid className="w-4 h-4" />
              {t.myDivision}
            </TabsTrigger>
            <TabsTrigger
              active={sortMode === 'recent'}
              onClick={() => setSortMode('recent')}
            >
              <Clock className="w-4 h-4" />
              {t.recent}
            </TabsTrigger>
            <TabsTrigger
              active={sortMode === 'archived'}
              onClick={() => setSortMode('archived')}
            >
              <Archive className="w-4 h-4" />
              {t.archive}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search */}
        <div className="w-full md:w-80">
          <Input
            icon={<Search className="w-4 h-4" />}
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-full"
          />
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
              {renderSectionHeader(t.draft, conceptDossiers.length)}

              <SectionContainer id="concept">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                      <div className="col-span-full py-8 text-center text-sm text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                        {t.dragToConcept}
                      </div>
                    )}
                  </SortableContext>

                  {/* Quick Add Card */}
                  <div
                    onClick={onNewDossier}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-150 cursor-pointer h-full min-h-[120px] group"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-all duration-150 mb-2">
                      <span className="text-xl font-light">+</span>
                    </div>
                    <span className="text-xs font-medium text-slate-400 group-hover:text-blue-500 transition-colors">{t.newCompromis}</span>
                  </div>
                </div>
              </SectionContainer>
            </div>

            {/* Section 2: In Behandeling */}
            <div>
              {renderSectionHeader(t.incomplete, inBehandelingDossiers.length)}
              <SectionContainer id="inBehandeling">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                      <div className="col-span-full py-8 text-center text-sm text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 min-h-24">
                        {t.dragToActive}
                      </div>
                    )}
                  </SortableContext>
                </div>
              </SectionContainer>
            </div>

            {/* Section 3: Archive */}
            <div>
              {renderSectionHeader(t.archive, archivedDossiers.length)}
              <SectionContainer id="archief">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                      <div className="col-span-full py-8 text-center text-sm text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                        {t.dragToArchive}
                      </div>
                    )}
                  </SortableContext>
                </div>
              </SectionContainer>
            </div>
          </>
        ) : sortMode === 'recent' ? (
          <div>
            {renderSectionHeader(t.recentlyOpened, dossiers.length)}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
          <div>
            {renderSectionHeader(t.archived, dossiers.filter(d => d.status === DossierStatus.ARCHIVED).length)}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                <div className="col-span-full py-12 text-center text-sm text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                  {t.noArchivedFound}
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
          lang={lang}
        />
      )}
    </div>
  );
};