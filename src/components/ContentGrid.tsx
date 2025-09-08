import React, { useMemo, useState } from 'react';
import Modal from './ui/modal';
import ResearchDetail from './ResearchDetail';
import type { ResearchRecord } from '../types/research';
import researchItemsRaw from '../../data/research_items.json';

const ContentGrid = () => {
  const [openCardId, setOpenCardId] = useState<string | null>(null);

  const researchItems: ResearchRecord[] = useMemo(() => {
    return (researchItemsRaw as unknown) as ResearchRecord[];
  }, []);

  const handleCardClick = (itemId: string) => {
    setOpenCardId(itemId);
  };

  const handleCloseModal = () => {
    setOpenCardId(null);
  };

  const selectedResearch = researchItems.find(item => item.id === openCardId) || null;

  const formatMonth = (iso?: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' });
  };

  return (
    <main className="flex-1 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {researchItems.map((item) => (
          <div 
            key={item.id} 
            className="border border-grid-border bg-card hover:bg-hover-subtle transition-colors cursor-pointer group"
            onClick={() => handleCardClick(item.id)}
          >
            <div className="aspect-[4/3] bg-accent flex items-center justify-center relative overflow-hidden p-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2">
                  {(item.tags || []).slice(0, 2).join(', ')}
                </div>
                <div className="text-sm text-foreground font-mono">
                  {item.pub_type}
                </div>
              </div>
            </div>
            <div className="p-4 font-mono space-y-2">
              <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-tight">
                {item.title_short}
              </h3>
              <p className="text-xs text-nav-active font-medium">{item.authors_org}</p>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {item.central_insight || item.rationale || ''}
              </p>
              <p className="text-xs text-muted-foreground pt-2">{formatMonth(item.date_published)}</p>
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={!!openCardId} 
        onClose={handleCloseModal}
        title={selectedResearch?.title_short || undefined}
      >
        {selectedResearch && <ResearchDetail research={selectedResearch} />}
      </Modal>
    </main>
  );
};

export default ContentGrid;