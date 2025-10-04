import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { v4 as uuidv4 } from 'uuid';

interface ResearchRecord {
  id: string;
  title_original: string;
  title_short: string;
  authors_org: string;
  pub_type: string;
  date_published: string;
  identifiers: { isbn?: string | null; doi?: string | null; url?: string | null };
  volume_pages?: string | null;
  rationale?: string | null;
  central_insight?: string | null;
  detailed_content?: Record<string, unknown> | null;
  potential_application?: string | null;
  impact_forecast?: string | null;
  risks_limitations?: string | null;
  quote?: string | null;
  questions_lenses?: string[] | null;
  references_apa?: string | null;
  tags?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
  raw_markdown?: string | null;
}

// Very lightweight importer: split by top-level headings that start with '# ' followed by an index and a dot.
// Preserve the full markdown chunk in raw_markdown. Best-effort extraction of title_short from first line.

function importMarkdown(mdPath: string): ResearchRecord[] {
  const abs = resolve(mdPath);
  const md = readFileSync(abs, 'utf-8');

  const chunks = md
    .split(/\n(?=#\s*\d+\.|#\s)/g) // split when a new # N. section appears
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const nowIso = new Date().toISOString();

  const records: ResearchRecord[] = chunks.map((chunk) => {
    const firstLine = chunk.split('\n')[0] || '';
    // Extract between asterisks if present: "# 1. *Title*" → Title
    const m = firstLine.match(/\*([^*]+)\*/);
    const inferredTitle = m ? m[1].trim() : firstLine.replace(/^#\s*\d+\.?\s*/, '').replace(/^#\s*/, '').trim();

    const rec: ResearchRecord = {
      id: uuidv4(),
      title_original: inferredTitle || 'Untitled',
      title_short: inferredTitle?.slice(0, 120) || 'Untitled',
      authors_org: '',
      pub_type: 'report',
      date_published: '',
      identifiers: { url: null, isbn: null, doi: null },
      volume_pages: null,
      rationale: null,
      central_insight: null,
      detailed_content: null,
      potential_application: null,
      impact_forecast: null,
      risks_limitations: null,
      quote: null,
      questions_lenses: null,
      references_apa: null,
      tags: null,
      created_at: nowIso,
      updated_at: nowIso,
      raw_markdown: chunk,
    };

    return rec;
  });

  return records;
}

function main() {
  const mdArg = process.argv[2];
  const outArg = process.argv[3] || 'data/research_items.json';
  if (!mdArg) {
    console.error('Usage: tsx scripts/import-md-to-json.ts <path-to-markdown> [output-json]');
    process.exit(1);
  }
  const records = importMarkdown(mdArg);
  const outPath = resolve(outArg);
  writeFileSync(outPath, JSON.stringify(records, null, 2), 'utf-8');
  console.log(`Wrote ${records.length} records to ${outPath}`);
}

main();



