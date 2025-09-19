# 🚀 Быстрый Workflow для добавления исследований

## Ежедневная задача: Добавить исследование в Notion

### Шаг 1: Подключение к репозиторию
```bash
cd /Users/angelinazajceva/research-base
git pull origin develop
```

### Шаг 2: Настройка переменных окружения (один раз)
1. Скопируйте `env.template` в `.env.local`:
   ```bash
   cp env.template .env.local
   ```

2. Отредактируйте `.env.local` и укажите:
   - `VITE_NOTION_API_KEY` - ваш API токен от Notion
   - `VITE_NOTION_DATABASE_ID` - ID базы данных `research_base_master_dg`

### Шаг 3: Добавление исследования

#### Вариант A: Интерактивный (рекомендуется)
```bash
node scripts/quick-add-research.cjs
```
Скрипт задаст вопросы и добавит исследование.

#### Вариант B: Быстрый (одной командой)
```bash
node scripts/add-research.cjs "Название исследования" "Авторы" "https://url.com" "2025-01-15" "тег1,тег2,тег3"
```

### Шаг 4: Проверка в веб-интерфейсе
1. Запустите веб-приложение:
   ```bash
   npm run dev
   ```

2. Откройте http://localhost:5173
3. Переключите на "Notion" в интерфейсе
4. Проверьте, что исследование появилось

### Шаг 5: Сохранение изменений
```bash
git add .
git commit -m "Add new research: [название]"
git push origin develop
```

## 🔧 Устранение проблем

### Ошибка "Unauthorized"
- Проверьте API ключ в `.env.local`
- Убедитесь, что интеграция имеет доступ к базе данных

### Ошибка "Object not found"
- Проверьте ID базы данных в `.env.local`
- Убедитесь, что база данных `research_base_master_dg` существует

### Исследование не появляется в веб-интерфейсе
- Проверьте, что переключились на "Notion" в интерфейсе
- Обновите страницу (F5)
- Проверьте консоль браузера на ошибки

## 📝 Структура базы данных

Убедитесь, что в Notion есть следующие поля:
- `TitleOriginal` (Title)
- `TitleShort` (Rich text)
- `AuthorsOrg` (Rich text)
- `URL` (URL)
- `DatePublished` (Date)
- `Tags` (Multi-select)
- `CentralInsight` (Rich text)
- `DetailedContent` (Rich text)
- `PubType` (Select)

## ⚡ Быстрые команды

```bash
# Добавить исследование интерактивно
node scripts/quick-add-research.cjs

# Добавить исследование быстро
node scripts/add-research.cjs "Название" "Авторы" "URL" "2025-01-15" "теги"

# Запустить веб-приложение
npm run dev

# Обновить репозиторий
git pull origin develop

# Сохранить изменения
git add . && git commit -m "Add research" && git push origin develop
```
