# Research Base - AI-Powered PDF Analysis System

Система для автоматического анализа научных PDF документов с интеграцией в Notion и использованием AWS сервисов.

## 🚀 Функциональность

- **Загрузка PDF**: Прямая загрузка файлов в AWS S3
- **Извлечение текста**: Использование AWS Textract для OCR
- **AI анализ**: Структурированное извлечение данных из научных статей
- **Интеграция с Notion**: Автоматическое создание карточек в базе данных
- **Современный UI**: React + TypeScript фронтенд

## 🏗️ Архитектура

```
Frontend (React) → API Gateway → Lambda → Notion API
                ↓
              S3 (PDF Storage)
                ↓
            Textract (OCR)
```

## 📋 Требования

- AWS Account с настроенными сервисами
- Notion API Token
- Node.js 18+
- AWS CLI настроен

## 🛠️ Установка и настройка

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd research-base
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Настройка AWS
```bash
# Настройка AWS CLI
aws configure

# Создание S3 bucket
aws s3 mb s3://research-base-angelina

# Настройка Lambda функции
aws lambda create-function --function-name research-base-api-handler \
  --runtime nodejs18.x \
  --role arn:aws:iam::ACCOUNT:role/research-base-lambda-role \
  --handler index-minimal-working.handler \
  --zip-file fileb://lambda-minimal-working.zip
```

### 4. Настройка переменных окружения
```bash
# В Lambda функции установить:
NOTION_API_TOKEN=your_notion_token
NOTION_DATABASE_ID=your_database_id
S3_BUCKET=research-base-angelina
```

### 5. Сборка и деплой фронтенда
```bash
npm run build
aws s3 sync dist/ s3://research-base-angelina/
```

## 📊 Структура данных Notion

Система создает карточки со следующими полями:

- **TitleOriginal**: Оригинальный заголовок
- **TitleShort**: Краткий заголовок (≤60 символов)
- **Authors**: Авторы исследования
- **Organization**: Организация
- **OrganizationType**: Тип организации (University/Institute/NGO/etc.)
- **PubType**: Тип публикации (journal/conference/report/etc.)
- **CentralInsight**: Ключевая идея исследования
- **Rationale**: Обоснование и цель
- **TheoreticalFramework**: Теоретическая база
- **Methodology**: Методология исследования
- **KeyFindings**: Ключевые выводы
- **Quote**: Важная цитата
- **QuestionsLenses**: Исследовательские вопросы
- **PotentialApplication**: Практическое применение
- **ImpactForecast**: Прогноз влияния
- **RisksLimitations**: Риски и ограничения
- **Tags**: Теги для категоризации

## 🔧 API Endpoints

- `POST /prod/upload` - Загрузка PDF файла
- `POST /prod/process/{fileId}` - Обработка PDF с AI анализом
- `POST /prod/notion/create` - Создание записи в Notion
- `GET /prod/notion/query` - Получение всех записей из Notion

## 🎯 Использование

1. Откройте фронтенд приложение
2. Выберите PDF файл для анализа
3. Дождитесь завершения обработки
4. Проверьте созданную карточку в Notion

## 🔍 AI Анализ

Система использует профессиональный промпт для извлечения структурированных данных из научных статей:

- Анализ заголовков и авторов
- Извлечение методологии
- Определение ключевых выводов
- Классификация по тегам
- Оценка практического применения

## 🚨 Устранение неполадок

### Lambda не может найти модули
```bash
# Пересоздать zip с зависимостями
zip -r lambda-with-deps.zip index.js node_modules/
```

### CORS ошибки
- Проверить настройки API Gateway
- Убедиться, что все endpoints имеют OPTIONS методы

### Notion API ошибки
- Проверить токен доступа
- Убедиться, что база данных существует и доступна

## 📝 Логи и мониторинг

```bash
# Просмотр логов Lambda
aws logs tail /aws/lambda/research-base-api-handler --follow

# Проверка статуса API Gateway
aws apigateway get-rest-apis
```

## 🔒 Безопасность

- API токены хранятся в переменных окружения Lambda
- S3 bucket настроен с правильными правами доступа
- CORS настроен для безопасного взаимодействия

## 📈 Производительность

- Lambda timeout: 60 секунд
- Memory: 256 MB
- Поддержка файлов до 10MB
- Кэширование через CloudFront

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License

## 📞 Поддержка

При возникновении проблем создайте issue в репозитории или обратитесь к документации AWS/Notion API.

---

**Статус проекта**: ✅ Завершен и готов к использованию