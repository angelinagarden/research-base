# Настройка интеграции с Notion

## Шаг 1: Создание интеграции в Notion

1. Перейдите на [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Нажмите "New integration"
3. Заполните форму:
   - **Name**: Research Base Integration
   - **Logo**: (опционально)
   - **Associated workspace**: выберите ваш workspace
4. Нажмите "Submit"
5. Скопируйте **Internal Integration Token** (начинается с `secret_`)

## Шаг 2: Создание базы данных в Notion

1. Создайте новую страницу в Notion
2. Добавьте базу данных (Database) с названием "Research Items"
3. Настройте следующие поля:

### Обязательные поля:

| Название поля | Тип поля | Описание |
|---------------|----------|----------|
| TitleOriginal | Title | Оригинальное название исследования |
| TitleShort | Rich text | Краткое название |
| AuthorsOrg | Rich text | Авторы или организация |
| PubType | Select | Тип публикации (report, editorial, preprint, etc.) |
| DatePublished | Date | Дата публикации |
| Tags | Multi-select | Теги для категоризации |

### Дополнительные поля:

| Название поля | Тип поля | Описание |
|---------------|----------|----------|
| ISBN | Rich text | ISBN номер |
| DOI | Rich text | DOI идентификатор |
| URL | URL | Ссылка на публикацию |
| VolumePages | Rich text | Том/страницы |
| Rationale | Rich text | Обоснование исследования |
| CentralInsight | Rich text | Ключевые выводы (1-3 предложения) |
| DetailedContent | Rich text | Детальное содержание (JSON) |
| PotentialApplication | Rich text | Потенциальное применение |
| ImpactForecast | Rich text | Прогноз влияния (2-5 лет) |
| RisksLimitations | Rich text | Риски и ограничения |
| Quote | Rich text | Цитата |
| QuestionsLenses | Multi-select | Вопросы и линзы |
| ReferencesAPA | Rich text | APA цитирования |
| RawMarkdown | Rich text | Исходный markdown |

## Шаг 3: Предоставление доступа к базе данных

1. Откройте созданную базу данных
2. Нажмите "Share" в правом верхнем углу
3. Нажмите "Add people, emails, groups, or integrations"
4. Найдите вашу интеграцию "Research Base Integration"
5. Выберите "Can edit" и нажмите "Invite"

## Шаг 4: Получение ID базы данных

1. Откройте базу данных в браузере
2. URL будет выглядеть примерно так:
   ```
   https://www.notion.so/your-workspace/DATABASE_ID?v=VIEW_ID
   ```
3. Скопируйте `DATABASE_ID` (32-символьная строка с дефисами)

## Шаг 5: Настройка переменных окружения

1. Создайте файл `.env.local` в корне проекта:
```bash
# Notion API Configuration
VITE_NOTION_API_KEY=secret_your_integration_token_here
VITE_NOTION_DATABASE_ID=your_database_id_here
```

2. Замените значения на реальные:
   - `secret_your_integration_token_here` → ваш Internal Integration Token
   - `your_database_id_here` → ID вашей базы данных

## Шаг 6: Тестирование интеграции

1. Запустите проект: `npm run dev`
2. Откройте консоль браузера (F12)
3. Проверьте, что нет ошибок загрузки данных из Notion

## Структура базы данных в Notion

После настройки ваша база данных должна содержать записи с полями, соответствующими интерфейсу `ResearchRecord`:

```typescript
interface ResearchRecord {
  id: string;
  title_original: string;
  title_short: string;
  authors_org: string;
  pub_type: string;
  date_published: string;
  identifiers: {
    isbn?: string | null;
    doi?: string | null;
    url?: string | null;
  };
  // ... остальные поля
}
```

## Устранение неполадок

### Ошибка "Unauthorized"
- Проверьте правильность Internal Integration Token
- Убедитесь, что интеграция имеет доступ к базе данных

### Ошибка "Object not found"
- Проверьте правильность Database ID
- Убедитесь, что база данных существует и доступна

### Ошибка "Property does not exist"
- Проверьте названия полей в Notion (должны точно совпадать)
- Убедитесь, что типы полей соответствуют ожидаемым

## Полезные ссылки

- [Notion API Documentation](https://developers.notion.com/)
- [Notion API Reference](https://developers.notion.com/reference)
- [Notion Integration Guide](https://developers.notion.com/docs/getting-started)
