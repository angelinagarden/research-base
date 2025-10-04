# 🔧 Настройка Notion API

## 📋 Пошаговая инструкция

### 1. Создание Notion Integration

1. **Перейдите на**: https://www.notion.so/my-integrations
2. **Нажмите**: "New integration"
3. **Заполните**:
   - Name: `Research Base API`
   - Logo: (опционально)
   - Associated workspace: выберите ваш workspace
4. **Нажмите**: "Submit"
5. **Скопируйте**: "Internal Integration Token" (начинается с `secret_`)

### 2. Создание Database в Notion

1. **Откройте Notion** в браузере
2. **Создайте новую страницу** или выберите существующую
3. **Добавьте Database**:
   - Нажмите `/` и выберите "Table"
   - Или нажмите "+" и выберите "Table"
4. **Настройте колонки**:

```
Название колонки          | Тип
--------------------------|------------------
TitleOriginal             | Title
AuthorsOrg                | Rich text
CentralInsight           | Rich text
DetailedContent          | Rich text
URL                      | URL
GoogleDriveURL           | URL
PublicationDate          | Date
DOI                      | Rich text
Keywords                 | Multi-select
Institution              | Rich text
Journal                  | Rich text
ResearchType             | Select (experimental, theoretical, review)
Field                    | Rich text
```

### 3. Предоставление доступа к Database

1. **Откройте созданную Database**
2. **Нажмите на "Share"** (правый верхний угол)
3. **Нажмите "Invite"**
4. **Найдите**: `Research Base API` (ваше integration)
5. **Нажмите**: "Invite"

### 4. Получение Database ID

1. **Откройте Database** в браузере
2. **Скопируйте URL**: `https://www.notion.so/your-workspace/DATABASE_ID?v=VIEW_ID`
3. **Database ID** - это строка между последним `/` и `?v=`
   - Пример: `https://www.notion.so/myworkspace/a8aec43384f447ed84390e8e42c2e089?v=...`
   - Database ID: `a8aec43384f447ed84390e8e42c2e089`

### 5. Обновление .env файла

Замените в файле `backend/.env`:

```bash
# Notion Configuration
NOTION_API_KEY=secret_ваш_токен_здесь
NOTION_DATABASE_ID=ваш_database_id_здесь
```

### 6. Тестирование

После настройки запустите:

```bash
cd backend
npm start
```

Затем протестируйте загрузку файла через веб-интерфейс.

## 🔍 Проверка настройки

### Тест Notion API

```bash
curl -X POST http://localhost:3001/api/notion/test
```

Должен вернуть:
```json
{
  "success": true,
  "message": "Notion API configured correctly"
}
```

### Тест создания записи

```bash
curl -X POST http://localhost:3001/api/notion/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Research",
    "authors": ["Test Author"],
    "abstract": "Test abstract",
    "url": "https://example.com"
  }'
```

## 🚨 Частые ошибки

1. **"unauthorized"** - неправильный API ключ
2. **"object_not_found"** - неправильный Database ID
3. **"validation_error"** - неправильная структура колонок

## 📚 Дополнительная информация

- [Notion API Documentation](https://developers.notion.com/)
- [Database Properties](https://developers.notion.com/reference/property-object)
- [Create Page](https://developers.notion.com/reference/create-a-page)