import React from 'react';
import { ExternalLink, Calendar, Building, Tag, Star, FileText } from 'lucide-react';

interface ResearchItem {
  id: string;
  title: string;
  institution: string;
  summary: string;
  domain: string[];
  focus: string[];
  timeAgo: string;
  publishedAt?: string | null;
  publicationType: string;
  source: {
    titleOriginal: string;
    authorsOrOrg: string;
    year: number;
    doiOrHandle?: string | null;
    url: string;
    pdfUrl?: string | null;
    language?: string | null;
    license?: string | null;
    pages?: number | null;
  };
  body: {
    lede: string;
    analysis: string;
    keyFindings: string[];
    limitations: string[];
    applications: string[];
    impactHorizon?: string | null;
  };
  metadata: {
    methods: string[];
    metrics: string[];
    geography: string[];
    sectors: string[];
    personas: string[];
    keywords: string[];
  };
  visual: {
    coverImage?: string | null;
    alt?: string | null;
  };
  links: Array<{label: string, url: string}>;
  citationAPA: string;
  tags: string[];
  rating: {
    evidenceStrength: number;
    actionability: number;
  };
  notes?: string | null;
}

interface ResearchDetailProps {
  research: ResearchItem;
}

const ResearchDetail: React.FC<ResearchDetailProps> = ({ research }) => {
  const renderRating = (value: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < value ? 'text-yellow-500 fill-current' : 'text-muted-foreground'
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">({value}/5)</span>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground leading-tight mb-3">
              {research.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                <span>{research.institution}</span>
              </div>
              {research.publishedAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{research.publishedAt}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="capitalize">{research.publicationType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tags and Rating */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              {research.domain.map((domain, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20"
                >
                  {domain}
                </span>
              ))}
              {research.focus.map((focus, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-accent/10 text-accent-foreground text-xs rounded-full border border-accent/20"
                >
                  {focus}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Evidence Strength:</span>
            {renderRating(research.rating.evidenceStrength)}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Actionability:</span>
            {renderRating(research.rating.actionability)}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-muted/30 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-foreground mb-2">SUMMARY</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{research.summary}</p>
      </div>

      {/* Key Insights */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">KEY INSIGHTS</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{research.body.lede}</p>
      </div>

      {/* Analysis */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">ANALYSIS</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{research.body.analysis}</p>
      </div>

      {/* Key Findings */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">KEY FINDINGS</h3>
        <ul className="space-y-2">
          {research.body.keyFindings.map((finding, idx) => (
            <li key={idx} className="text-sm text-muted-foreground flex items-start">
              <span className="text-primary mr-3 mt-1">•</span>
              <span>{finding}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Applications */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">APPLICATIONS</h3>
        <ul className="space-y-2">
          {research.body.applications.map((app, idx) => (
            <li key={idx} className="text-sm text-muted-foreground flex items-start">
              <span className="text-primary mr-3 mt-1">•</span>
              <span>{app}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Limitations */}
      {research.body.limitations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">LIMITATIONS</h3>
          <ul className="space-y-2">
            {research.body.limitations.map((limitation, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start">
                <span className="text-muted-foreground mr-3 mt-1">⚠</span>
                <span>{limitation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Impact Horizon */}
      {research.body.impactHorizon && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">IMPACT HORIZON</h3>
          <p className="text-sm text-muted-foreground">{research.body.impactHorizon}</p>
        </div>
      )}

      {/* Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">METHODS</h3>
          <div className="flex flex-wrap gap-2">
            {research.metadata.methods.map((method, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded"
              >
                {method}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">SECTORS</h3>
          <div className="flex flex-wrap gap-2">
            {research.metadata.sectors.map((sector, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded"
              >
                {sector}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">GEOGRAPHY</h3>
          <div className="flex flex-wrap gap-2">
            {research.metadata.geography.map((geo, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded"
              >
                {geo}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">PERSONAS</h3>
          <div className="flex flex-wrap gap-2">
            {research.metadata.personas.map((persona, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded"
              >
                {persona}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Links */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">LINKS & RESOURCES</h3>
        <div className="flex flex-wrap gap-3">
          {research.links.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* Citation */}
      <div className="bg-muted/30 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-foreground mb-2">CITATION (APA)</h3>
        <p className="text-sm text-muted-foreground font-mono">{research.citationAPA}</p>
      </div>

      {/* Notes */}
      {research.notes && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-foreground mb-2">NOTES</h3>
          <p className="text-sm text-muted-foreground">{research.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ResearchDetail;
