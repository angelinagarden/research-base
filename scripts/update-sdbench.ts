import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const OUT = resolve('data/research_items.json');

const record = {
  id: 'sequential-diagnosis-with-language-models-2025-07-03',
  title_original: 'Sequential Diagnosis with Language Models',
  title_short: 'Sequential Diagnosis with Language Models',
  authors_org:
    'Harsha Nori, Mayank Daswani, Christopher Kelly, Scott Lundberg, Marco T. Ribeiro, Marc Wilson, Xiaoxuan Liu, Viknesh Sounderajah, Jonathan M. Carlson, Matthew P. Lungren, Bay Gross, Peter Hames, Mustafa Suleyman, Dominic King, Eric Horvitz — Microsoft AI',
  pub_type: 'preprint',
  date_published: '2025-07-03',
  identifiers: {
    isbn: null as null,
    doi: null as null,
    url: 'https://arxiv.org/abs/2506.22405v2',
  },
  volume_pages: '≈31 стр.',
  rationale:
    '• Представляет SDBench — первый реалистичный бенчмарк последовательной диагностики на 304 кейсах NEJM-CPC (2017–2025), где шаги врача/ИИ стоят денег и времени.\n• Предлагает MAI-DxO — оркестратор «панели врачей» (роли: гипотезы/выбор тестов/челлендж/экономия/чек-лист), который улучшает и точность, и стоимость диагностики (новая Парето-граница).\n• Содержит прямое сравнение с практикующими врачами и множеством SOTA-моделей (OpenAI, Gemini, Claude, Grok, DeepSeek, Llama).',
  central_insight:
    'Тесты «по картинкам/виньеткам» завышают оценку LLM. В клинике ценится правильный следующий шаг (вопрос → тест → диагноз) с учётом диагностической отдачи на доллар. Новый SDBench измеряет точность + стоимость, а MAI-DxO показывает, что организованная оркестрация модулями-ролями делает ИИ одновременно точнее и дешевле на разных базовых моделях.',
  detailed_content:
    '• Данные/формат: 304 последовательных кейса NEJM-CPC преобразованы в «визиты»; метрики — корректность диагноза (Judge ≥4/5) и суммарная стоимость (USD).\n• Gatekeeper: LM-«привратник» раскрывает только запрошенную информацию; для отсутствующих тестов генерирует синтетические, но согласованные результаты (ручная врачебная валидация: 508 ответов, 8 спорных).\n• Judge: LM-судья (о3) по рубрике (ядро болезни/этиология/локализация/специфика/полнота); согласие с врачами κ=0,70–0,87; порог «верно» — ≥4/5.\n• Стоимость: визит $300; тесты — по CPT и прайсам CMS (coverage матчей >98%).\n• Люди (n=21): точность 19,9%, $2 963/кейс; сред. 11,8 мин; 6,6 вопросов; 7,2 теста.\n• Модели «из коробки»: GPT-4o 49,3% при $2 745; o3 78,6% при $7 850 (дороже → чаще уместные тесты).\n• MAI-DxO (на o3): 81,9% при $4 735; бюджет-режим 79,9% при $2 396; ensemble — до 85,5% при $7 184; выигрыш сохраняется на скрытом тест-наборе (2024–2025).\n• Кейс: интоксикация — baseline-o3 «заякорился» (неверный диагноз, $3 431); MAI-DxO уточнил экспозицию (санитайзер) → точный тест → верный диагноз за $795.',
  potential_application:
    '• Agentic Dx Pilot → встроить MAI-DxO-подобную оркестрацию в триаж/приёмное отделение; KPI: $ per correct Dx, AUC, TAT.\n• Cost-Aware Test Recommender → ассистент, который ставит под сомнение дорогие исследования и предлагает эквиваленты.\n• Judge-as-a-Service → рубрика оценивания (≥4/5) для внутреннего QA по дифф-диагнозам/обучению врачей.\n• Synthetic-Findings Sandbox → тренажёр для ординаторов на синтетических находках (без утечек PHI).\n• Payer Bundle Optimizer → связать точность/стоимость с бандлами оплаты (value-based care).',
  impact_forecast:
    '• Диагностические ИИ: переход от «чат-ботов» к оркестраторам с бюджет-логикой; выигрывают провайдеры agent-frameworks, проигрывают монолитные чат-интерфейсы.\n• Клиника: ↑доля верных диагнозов при ↓затратах на тесты; выигрывают модели value-based care, проигрывает объёмная fee-for-service.\n• Образование: симуляторы «последовательного мышления» вместо статичных виньеток; выигрывают центры с ИИ-симами.\n• Регуляторика/пейеры: спрос на метрику $ per correct Dx и трассировку решений; выигрывают платформы RAI/аудита.',
  risks_limitations:
    '• NEJM-CPC — сложные «академические» кейсы; неизвестна точность/FP на повседневной популяции.\n• Цены/тарифы — US-специфика; не учтены логистика, ожидание, инвазивность.\n• Врачи работали без поиска/консилиумов (в реале доступны).\n• Синтетические находки Gatekeeper могут привносить скрытые смещения.\n• Нужны проспективные клинические испытания на исходы пациентов.',
  quote:
    '«Guided to think iteratively and act judiciously, AI can advance both diagnostic precision and cost-effectiveness in clinical care.»',
  questions_lenses: [
    '1) Generalizability: как изменится Парето-кривая при частых «банальных» кейсах и здоровых пациентах?',
    '2) Judge-Robustness: как часто расходятся врач и LM-судья на редких формулировках; нужен ли человеческий арбитр?',
    '3) Cost-Transfer: как меняется $ per correct Dx при тарифах ЕС/UK/ЛатАм и учёте инвазивности/времени?',
    '4) Safety & RAI: какие пороги эскалации/логгинг решений требуются для допуска?',
    '5) Future Fit: сохранится ли выигрыш MAI-DxO с мультимодальными on-device агентами и новыми прайс-моделями тестов?',
  ],
  references_apa:
    'Nori, H., Daswani, M., Kelly, C., Lundberg, S., Ribeiro, M. T., Wilson, M., … Horvitz, E. (2025). Sequential Diagnosis with Language Models. arXiv: 2506.22405v2 — https://arxiv.org/abs/2506.22405v2. Пример кейса NEJM-CPC из тест-набора: Hunter, M., Lopez Saubidet, I., Amerio, T., & Leone, M. V. (2025). Case 15-2025… — https://www.nejm.org/doi/full/10.1056/NEJMcpc2412526.',
  tags: [
    'ai',
    'healthcare',
    'diagnosis',
    'benchmarks',
    'sdbench',
    'mai-dxo',
    'cost_effectiveness',
    'agent_orchestration',
    'arxiv',
    'microsoft',
  ],
  created_at: '2025-09-08T20:55:00Z',
  updated_at: '2025-09-08T20:55:00Z',
  raw_markdown: null as null,
};

function main() {
  const data = JSON.parse(readFileSync(OUT, 'utf-8')) as any[];
  const idx = data.findIndex((r) => r && r.id === record.id);
  if (idx >= 0) {
    data[idx] = record as any;
  } else {
    data.push(record as any);
  }
  writeFileSync(OUT, JSON.stringify(data, null, 2), 'utf-8');
  console.log('SDBench record upserted.');
}

main();


