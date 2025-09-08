import React from 'react';
import { ExternalLink, Calendar, Building, Tag, FileText, Quote } from 'lucide-react';
import type { ResearchRecord } from '../types/research';

interface ResearchDetailProps {
  research: ResearchRecord;
}

const ResearchDetail: React.FC<ResearchDetailProps> = ({ research }) => {
  const formatDate = (iso?: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: '2-digit' });
  };

  const entries = research.detailed_content && typeof research.detailed_content === 'object'
    ? Object.entries(research.detailed_content as Record<string, unknown>)
    : [];

  const toBulletItems = (text?: string | null): string[] => {
    if (!text) return [];
    const trimmed = text.trim();
    const lineBullets = trimmed
      .split(/\r?\n/)
      .map(s => s.replace(/^([*\-•]\s+)/, '').trim())
      .filter(Boolean);
    if (lineBullets.length > 1) return lineBullets;
    const sentenceSplit = trimmed
      .split(/\.\s+(?=[A-ZА-Я])/)
      .map(s => s.replace(/[.;]$/,'').trim())
      .filter(Boolean);
    if (sentenceSplit.length > 1) return sentenceSplit;
    const delimSplit = trimmed
      .split(/\s*[;•]\s+/)
      .map(s => s.trim())
      .filter(Boolean);
    if (delimSplit.length > 1) return delimSplit;
    if (trimmed.includes(' → ')) {
      const arr = trimmed
        .split(/(?=[A-ZА-Я][^\n]*?\s→\s)/)
        .map(s => s.replace(/[.;]$/,'').trim())
        .filter(Boolean);
      if (arr.length > 1) return arr;
    }
    return [trimmed];
  };

  const renderBullets = (text?: string | null) => {
    const items = toBulletItems(text);
    if (items.length <= 1) {
      return <p className="text-sm text-muted-foreground leading-relaxed">{items[0] || ''}</p>;
    }
    return (
      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
        {items.map((it, idx) => (
          <li key={idx}>{it}</li>
        ))}
      </ul>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground leading-tight mb-3">
              {research.title_short}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                <span>{research.authors_org}</span>
              </div>
              {research.date_published && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(research.date_published)}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="capitalize">{research.pub_type}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{research.title_original}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              {(research.tags || []).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Structured metadata */}
      <div className="bg-muted/30 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-foreground mb-2">МЕТАДАННЫЕ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Организация / Авторы</div>
            <div className="text-foreground">{research.authors_org || '—'}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Тип публикации</div>
            <div className="text-foreground capitalize">{research.pub_type || '—'}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Дата</div>
            <div className="text-foreground">{research.date_published ? formatDate(research.date_published) : '—'}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Объём</div>
            <div className="text-foreground">{research.volume_pages || '—'}</div>
          </div>
          <div>
            <div className="text-muted-foreground">ISBN</div>
            <div className="text-foreground">{research.identifiers?.isbn || '—'}</div>
          </div>
          <div>
            <div className="text-muted-foreground">DOI</div>
            <div className="text-foreground">{research.identifiers?.doi || '—'}</div>
          </div>
          <div className="md:col-span-2">
            <div className="text-muted-foreground">Ссылка</div>
            {research.identifiers?.url ? (
              <a
                href={research.identifiers.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline break-all"
              >
                {research.identifiers.url}
              </a>
            ) : (
              <div className="text-foreground">—</div>
            )}
          </div>
        </div>
      </div>

      {research.central_insight && (
        <div className="bg-muted/30 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-foreground mb-2">CENTRAL INSIGHT</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{research.central_insight}</p>
        </div>
      )}

      {research.rationale && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">RATIONALE</h3>
          {renderBullets(research.rationale)}
        </div>
      )}

      {entries.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">CONTENT SUMMARY</h3>
          <ul className="space-y-2">
            {entries.map(([chapter, summary], idx) => (
              <li key={idx} className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground mr-2">{chapter}:</span>
                <span>{String(summary)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {research.potential_application && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">POTENTIAL APPLICATION</h3>
          {renderBullets(research.potential_application)}
        </div>
      )}

      {research.impact_forecast && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">IMPACT FORECAST (2–5 YEARS)</h3>
          {renderBullets(research.impact_forecast)}
        </div>
      )}

      {research.risks_limitations && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">RISKS & LIMITATIONS</h3>
          {renderBullets(research.risks_limitations)}
        </div>
      )}

      {research.quote && (
        <div className="bg-muted/30 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2"><Quote className="w-4 h-4" />QUOTE</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{research.quote}</p>
        </div>
      )}

      {(research.questions_lenses && research.questions_lenses.length > 0) && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">QUESTIONS / LENSES</h3>
          <ul className="list-disc pl-5 space-y-1">
            {research.questions_lenses!.map((q, idx) => (
              <li key={idx} className="text-sm text-muted-foreground">{q}</li>
            ))}
          </ul>
        </div>
      )}

      {research.references_apa && (
        <div className="bg-muted/30 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-foreground mb-2">CITATION (APA)</h3>
          <p className="text-sm text-muted-foreground font-mono">{research.references_apa}</p>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">IDENTIFIERS & LINKS</h3>
        <div className="flex flex-wrap gap-3">
          {research.identifiers?.url && (
            <a
              href={research.identifiers.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> Primary URL
            </a>
          )}
          {research.identifiers?.doi && (
            <a
              href={`https://doi.org/${research.identifiers.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> DOI
            </a>
          )}
        </div>
        {research.volume_pages && (
          <p className="text-xs text-muted-foreground mt-2">{research.volume_pages}</p>
        )}
      </div>

      {/* Full text intentionally omitted from the card view */}
    </div>
  );
};

export default ResearchDetail;
