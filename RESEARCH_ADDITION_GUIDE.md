# Инструкция по добавлению исследований в Notion

## Обзор процесса

Эта инструкция описывает пошаговый процесс добавления новых исследований в базу данных Notion через программируемый API.

## Предварительные требования

- ✅ Notion API настроен и работает
- ✅ Proxy server запущен на `http://localhost:3001`
- ✅ База данных создана и доступна
- ✅ Переменные окружения настроены в `.env.local`

## Шаг 1: Анализ предоставленного исследования

### 1.1 Извлечение метаданных
Из предоставленного текста извлечь:
- **Название документа** (оригинальное и краткое)
- **Авторы/Издатель**
- **Тип документа** (Report, White Paper, Article, etc.)
- **Дата публикации**
- **Организация**
- **URL/DOI/ISBN**
- **Ключевые теги**

### 1.2 Структурирование контента
Разбить анализ на стандартные поля:
- **CentralInsight** - краткое резюме (до 2000 символов)
- **DetailedContent** - подробный анализ (до 2000 символов)
- **Rationale** - обоснование важности
- **QuestionsLenses** - исследовательские вопросы
- **PotentialApplication** - практические применения
- **ImpactForecast** - прогноз влияния
- **RisksLimitations** - риски и ограничения
- **Quote** - ключевая цитата
- **ReferencesAPA** - библиографическая ссылка
- **RawMarkdown** - структурированный контент

## Шаг 2: Создание скрипта добавления

### 2.1 Создать файл скрипта
```bash
# Создать файл с именем add-[research-topic]-[year].cjs
# Например: add-ai-ethics-2025.cjs
```

### 2.2 Структура скрипта
```javascript
const fetch = require('node-fetch');
require('dotenv').config({ path: './.env.local' });

const researchData = {
  // Все поля исследования
};

async function addResearch() {
  try {
    console.log('Добавляем исследование в Notion...');
    
    const response = await fetch('http://localhost:3001/api/notion/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parent: { database_id: process.env.VITE_NOTION_DATABASE_ID },
        properties: {
          // Маппинг полей на Notion API формат
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
```

## Шаг 3: Маппинг полей на Notion API

### 3.1 Обязательные поля
```javascript
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
```

### 3.2 Типы полей в Notion
- **title** → `{ title: [{ text: { content: "..." } }] }`
- **rich_text** → `{ rich_text: [{ text: { content: "..." } }] }`
- **multi_select** → `{ multi_select: [{ name: "..." }] }`
- **date** → `{ date: { start: "YYYY-MM-DD" } }`
- **url** → `{ url: "https://..." }`

## Шаг 4: Выполнение скрипта

### 4.1 Запуск скрипта
```bash
node add-[research-topic]-[year].cjs
```

### 4.2 Проверка результата
```bash
# Проверить добавление
curl -s http://localhost:3001/api/notion/query -X POST -H "Content-Type: application/json" -d '{"filter":{"property":"TitleOriginal","title":{"contains":"[название]"}}}' | jq '.results[] | {title: .properties.TitleOriginal.title[0].text.content, id: .id}'
```

## Шаг 5: Обработка ошибок

### 5.1 Типичные ошибки и решения

**Ошибка: DetailedContent превышает 2000 символов**
```javascript
// Решение: сократить контент до 2000 символов
detailedContent: researchData.detailedContent.substring(0, 2000)
```

**Ошибка: TitleOriginal validation failed**
```javascript
// Решение: убедиться в правильном формате
'TitleOriginal': { title: [{ text: { content: researchData.titleOriginal } }] }
```

**Ошибка: VolumePages is expected to be rich_text**
```javascript
// Решение: конвертировать в строку
'VolumePages': { rich_text: [{ text: { content: researchData.volumePages ? researchData.volumePages.toString() : '' } }] }
```

## Шаг 6: Валидация данных

### 6.1 Проверка длины полей
- **DetailedContent**: ≤ 2000 символов
- **CentralInsight**: ≤ 2000 символов
- **Все rich_text поля**: проверить на пустые значения

### 6.2 Проверка типов данных
- **OrganizationType, PubType, Tags**: массивы строк
- **DatePublished**: формат YYYY-MM-DD
- **URL**: валидный URL
- **VolumePages**: строка или null

## Шаблон для быстрого создания

### research-template.cjs
```javascript
const fetch = require('node-fetch');
require('dotenv').config({ path: './.env.local' });

const researchData = {
  titleOriginal: "[Оригинальное название]",
  titleShort: "[Краткое название]",
  authors: "[Авторы]",
  organization: "[Организация]",
  organizationType: ["[Тип организации]"],
  pubType: ["[Тип публикации]"],
  tags: ["[Тег1]", "[Тег2]", "[Тег3]"],
  centralInsight: "[Ключевое понимание - до 2000 символов]",
  detailedContent: "[Подробный контент - до 2000 символов]",
  rationale: "[Обоснование важности]",
  questionsLenses: "[Исследовательские вопросы]",
  potentialApplicati: "[Практические применения]",
  impactForecast: "[Прогноз влияния]",
  risksLimitations: "[Риски и ограничения]",
  quote: "[Ключевая цитата]",
  referencesAPA: "[APA ссылка]",
  rawMarkdown: "[Markdown контент]",
  doi: "",
  isbn: "",
  url: "[URL документа]",
  datePublished: "YYYY-MM-DD",
  volumePages: null
};

// [Остальной код скрипта...]
```

## Чек-лист для каждого исследования

- [ ] Извлечены все метаданные
- [ ] Контент структурирован по полям
- [ ] Проверена длина DetailedContent (≤ 2000)
- [ ] Проверена длина CentralInsight (≤ 2000)
- [ ] Создан скрипт .cjs
- [ ] Выполнен маппинг полей
- [ ] Запущен скрипт
- [ ] Проверен результат
- [ ] Обработаны ошибки (если есть)
- [ ] Исследование отображается в веб-интерфейсе

## Полезные команды

```bash
# Проверить статус proxy server
curl http://localhost:3001/health

# Посмотреть все исследования
curl -s http://localhost:3001/api/notion/query -X POST -H "Content-Type: application/json" -d '{}' | jq '.results | length'

# Найти исследование по названию
curl -s http://localhost:3001/api/notion/query -X POST -H "Content-Type: application/json" -d '{"filter":{"property":"TitleOriginal","title":{"contains":"[название]"}}}' | jq '.results[] | {title: .properties.TitleOriginal.title[0].text.content, id: .id}'
```

## Заключение

Эта инструкция обеспечивает стандартизированный процесс добавления исследований в Notion, минимизируя ошибки и ускоряя работу. Следуйте этому процессу для каждого нового исследования.


