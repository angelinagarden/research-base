import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const OUT = resolve('data/research_items.json');

function main() {
  const buf = readFileSync(OUT, 'utf-8');
  const arr = JSON.parse(buf) as any[];
  const idx = arr.findIndex(r => typeof r.title_original === 'string' && r.title_original.includes('World health statistics 2025'));
  if (idx === -1) {
    console.error('WHO record not found');
    process.exit(1);
  }
  const r = arr[idx];
  arr[idx] = {
    ...r,
    title_original: 'World health statistics 2025: monitoring health for the SDGs, Sustainable Development Goals',
    title_short: 'World health statistics 2025',
    authors_org: 'World Health Organization (WHO)',
    pub_type: 'report',
    date_published: '2025-01-01',
    identifiers: {
      url: 'https://iris.who.int/bitstream/handle/10665/381418/9789240110496-eng.pdf?sequence=1',
      isbn: '978-92-4-011049-6 / 978-92-4-011050-2',
      doi: null,
    },
    volume_pages: '≈ 100+ pages',
    rationale: 'Системный срез SDG-здоровья и Triple Billion; где мир сошёл с трека; практические метрики (HALE, UHC, НИЗ).',
    central_insight: 'HALE упал до 61,9 (−1,5 года) в 2019–2021 из‑за COVID; UHC/защита от ЧС отстают; нужен фокус на неравенства и ARR.',
    potential_application: 'HALE-Dashboard; UHC-Leakage Map; NCD-ARR Accelerator; Immunization Equity Targeting; Road-Safety Playbook.',
    impact_forecast: 'UHC: таргетинг льгот; НИЗ: ARR-управление; Иммунизация: equity‑кампании; Дороги: −10–20% CDR.',
    risks_limitations: 'Лаги 2021–2023; смешение причин; сопоставимость стран; чувствительность ARR-прогнозов.',
    quote: 'Без своевременных, надёжных и прикладных данных угрозы остаются невидимыми…',
    questions_lenses: [
      'Где дыры в регистрах и искажения HALE/ARR?',
      'Какие SDG-индикаторы нельзя посчитать на районном уровне?',
      'COVID-реклассификация и тренды НИЗ 2019–2021?',
      'Какие ARR-цели и владельцы KPI?',
      'Какие меры быстрее всего улучшают UHC без роста OOP?'
    ],
    references_apa: 'World Health Organization. (2025). World health statistics 2025: monitoring health for the SDGs, Sustainable Development Goals. Geneva: WHO. IRIS: https://iris.who.int/',
    tags: ['health','SDG','UHC','equity'],
  };
  writeFileSync(OUT, JSON.stringify(arr, null, 2), 'utf-8');
  console.log('WHO record updated.');
}

main();


