# 🚀 Быстрая настройка Notion API

## 📋 Что нужно сделать:

### 1. Создать Notion Integration
1. Перейдите: https://www.notion.so/my-integrations
2. Нажмите "New integration"
3. Название: `Research Base API`
4. Скопируйте токен (начинается с `secret_`)

### 2. Поделиться Database
1. Откройте вашу таблицу: https://www.notion.so/26bb3dee574080918494dccf1c1d9da2
2. Нажмите "Share" (правый верхний угол)
3. Найдите `Research Base API`
4. Нажмите "Invite"

### 3. Обновить .env файл
Замените в `backend/.env`:
```bash
NOTION_API_KEY=secret_ваш_токен_здесь
```

Database ID уже настроен: `26bb3dee574080918494dccf1c1d9da2`

### 4. Тестирование
```bash
# Тест Notion API
curl -X POST http://localhost:3001/api/notion/test

# Тест полного workflow
curl -X POST http://localhost:3001/api/aws/process/file-1759505722917-147797089.txt
```

## 🎯 После настройки:
- AI будет извлекать данные по вашему протоколу
- Файлы будут загружаться в S3
- Записи будут создаваться в Notion с файлами
- Все поля будут заполняться автоматически

## 🔧 Структура полей в Notion:
- `title` - название публикации
- `authors` - авторы
- `published_date` - дата публикации
- `venue` - журнал/издание
- `type` - тип (article, preprint, etc.)
- `language` - язык (ISO 639-1)
- `source_url` - URL источника
- `doi` - DOI
- `abstract` - аннотация
- `summary` - краткое резюме (120-160 слов)
- `key_findings` - ключевые выводы (3-7 пунктов)
- `tags` - теги
- `impact_use` - практическая польза
- `status` - статус (New)
- `added_by` - автор импорта
- `added_at` - дата добавления
- `attachments` - файл (PDF)
