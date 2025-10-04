// Шаблон для добавления нового исследования в Notion
// Скопируйте этот файл и заполните данные исследования

const fetch = require('node-fetch');
require('dotenv').config({ path: './.env.local' });

const researchData = {
  titleOriginal: "[Оригинальное название документа]",
  titleShort: "[Краткое название]",
  authors: "[Авторы/Издатель]",
  organization: "[Организация]",
  organizationType: ["[Тип организации - Government, International Organization, University, etc.]"],
  pubType: ["[Тип публикации - Report, White Paper, Article, etc.]"],
  tags: ["[Тег1]", "[Тег2]", "[Тег3]", "[Тег4]"],
  centralInsight: "[Ключевое понимание - до 2000 символов. Краткое резюме исследования и его основных выводов]",
  detailedContent: "[Подробный контент - до 2000 символов. Структурированный анализ с ключевыми пунктами]",
  rationale: "[Обоснование важности исследования. Почему это исследование критически важно]",
  questionsLenses: `[Исследовательские вопросы и линзы анализа:
1) Вопрос 1: Описание
2) Вопрос 2: Описание
3) Вопрос 3: Описание]`,
  potentialApplicati: `[Практические применения:
1) Применение 1 → описание → усилия (H/M/L)
2) Применение 2 → описание → усилия (H/M/L)
3) Применение 3 → описание → усилия (H/M/L)]`,
  impactForecast: `[Прогноз влияния:
Область → Изменение → Win/Lose
• Область 1 → изменение → кто выигрывает/проигрывает
• Область 2 → изменение → кто выигрывает/проигрывает]`,
  risksLimitations: `[Риски и ограничения:
• Риск 1: Описание
• Риск 2: Описание
• Ограничение 1: Описание]`,
  quote: "[Ключевая цитата из исследования в кавычках]",
  referencesAPA: "[APA формат библиографической ссылки]",
  rawMarkdown: `[Структурированный markdown контент:
# Название исследования
## Ключевые концепции
- Концепция 1
- Концепция 2
## Основные выводы
- Вывод 1
- Вывод 2]`,
  doi: "[DOI если есть, иначе пустая строка]",
  isbn: "[ISBN если есть, иначе пустая строка]",
  url: "[URL документа]",
  datePublished: "YYYY-MM-DD",
  volumePages: null // или строка с номером страниц
};

async function addResearch() {
  try {
    console.log('Добавляем исследование в Notion...');
    
    const response = await fetch('http://localhost:3001/api/notion/pages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parent: { database_id: process.env.VITE_NOTION_DATABASE_ID },
        properties: {
          'TitleOriginal': { title: [{ text: { content: researchData.titleOriginal } }] },
          'Authors': { rich_text: [{ text: { content: researchData.authors } }] },
          'CentralInsight': { rich_text: [{ text: { content: researchData.centralInsight } }] },
          'DOI': { rich_text: [{ text: { content: researchData.doi } }] },
          'DatePublished': { date: { start: researchData.datePublished } },
          'DetailedContent': { rich_text: [{ text: { content: researchData.detailedContent } }] },
          'ISBN': { rich_text: [{ text: { content: researchData.isbn } }] },
          'ImpactForecast ': { rich_text: [{ text: { content: researchData.impactForecast } }] },
          'Organization': { rich_text: [{ text: { content: researchData.organization } }] },
          'OrganizationType': { multi_select: researchData.organizationType.map(ot => ({ name: ot })) },
          'PotentialApplication': { rich_text: [{ text: { content: researchData.potentialApplicati } }] },
          'PubType': { multi_select: researchData.pubType.map(pt => ({ name: pt })) },
          'QuestionsLenses': { rich_text: [{ text: { content: researchData.questionsLenses } }] },
          'Quote': { rich_text: [{ text: { content: researchData.quote } }] },
          'Rationale': { rich_text: [{ text: { content: researchData.rationale } }] },
          'RawMarkdown': { rich_text: [{ text: { content: researchData.rawMarkdown } }] },
          'ReferencesAPA': { rich_text: [{ text: { content: researchData.referencesAPA } }] },
          'RisksLimitations': { rich_text: [{ text: { content: researchData.risksLimitations } }] },
          'Tags': { multi_select: researchData.tags.map(t => ({ name: t })) },
          'TitleShort': { rich_text: [{ text: { content: researchData.titleShort } }] },
          'URL': { url: researchData.url },
          'VolumePages': { rich_text: [{ text: { content: researchData.volumePages ? researchData.volumePages.toString() : '' } }] }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Исследование успешно добавлено!');
    console.log('ID:', result.id);
    console.log('URL:', result.url);
    
  } catch (error) {
    console.error('❌ Ошибка при добавлении исследования:', error.message);
  }
}

addResearch();


