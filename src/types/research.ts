// Research record as provided by user (snake_case fields)
export interface ResearchRecord {
  id: string; // UUID or SERIAL as string
  title_original: string;
  title_short: string;
  authors_org: string;
  pub_type: string; // ENUM-like string: report, editorial, preprint, …
  date_published: string; // ISO-8601 date (YYYY-MM-DD)
  identifiers: {
    isbn?: string | null;
    doi?: string | null;
    url?: string | null;
  };
  volume_pages?: string | null; // volume / issue / pages free text
  rationale?: string | null;
  central_insight?: string | null; // 1–3 sentences
  detailed_content?: Record<string, unknown> | null; // { chapter_1, … }
  potential_application?: string | null;
  impact_forecast?: string | null; // 2–5 year forecast
  risks_limitations?: string | null;
  quote?: string | null;
  questions_lenses?: string[] | null;
  references_apa?: string | null;
  tags?: string[] | null; // up to 20
  created_at?: string | null; // timestamp
  updated_at?: string | null; // timestamp
  raw_markdown?: string | null; // full original markdown content for the study
}


