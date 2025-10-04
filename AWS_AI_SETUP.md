# 🚀 AWS + AI Integration Setup Guide

## Обзор системы

Теперь система поддерживает:
1. **Реальную загрузку в AWS S3**
2. **Извлечение текста через AWS Textract**
3. **AI обработку текста** (OpenAI GPT-4, Anthropic Claude, или AWS Bedrock)
4. **Автоматическое создание записей в Notion**

## 🔧 Настройка AWS

### 1. Создание AWS аккаунта и настройка IAM

```bash
# 1. Создайте AWS аккаунт на https://aws.amazon.com
# 2. Создайте IAM пользователя с правами:
```

**Необходимые права для IAM пользователя:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::your-research-bucket/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "textract:StartDocumentTextDetection",
                "textract:GetDocumentTextDetection"
            ],
            "Resource": "*"
        }
    ]
}
```

### 2. Создание S3 Bucket

```bash
# Создайте S3 bucket для хранения PDF файлов
aws s3 mb s3://your-research-bucket-name

# Настройте публичный доступ (опционально)
aws s3api put-bucket-cors --bucket your-research-bucket-name --cors-configuration '{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedHeaders": ["*"]
    }
  ]
}'
```

### 3. Настройка переменных окружения

Создайте файл `backend/.env`:

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-research-bucket-name

# AI Service Configuration
AI_SERVICE=openai  # openai, anthropic, bedrock

# OpenAI Configuration (если используете OpenAI)
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic Configuration (если используете Claude)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# AWS Bedrock Configuration (если используете Bedrock)
AWS_BEDROCK_REGION=us-east-1

# Notion Configuration
NOTION_API_TOKEN=your_notion_api_token_here
NOTION_DATABASE_ID=your_notion_database_id_here

# Server Configuration
PORT=3001
```

## 🤖 Настройка AI сервисов

### Вариант 1: OpenAI GPT-4 (Рекомендуется)

```bash
# 1. Создайте аккаунт на https://platform.openai.com
# 2. Получите API ключ
# 3. Добавьте в .env файл:
OPENAI_API_KEY=sk-your-api-key-here
AI_SERVICE=openai
```

**Преимущества OpenAI:**
- ✅ Отличное понимание научных текстов
- ✅ Быстрая обработка
- ✅ Стабильный API
- ✅ Хорошее извлечение структурированных данных

### Вариант 2: Anthropic Claude

```bash
# 1. Создайте аккаунт на https://console.anthropic.com
# 2. Получите API ключ
# 3. Добавьте в .env файл:
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
AI_SERVICE=anthropic
```

**Преимущества Claude:**
- ✅ Очень точное извлечение данных
- ✅ Отлично работает с научными текстами
- ✅ Длинный контекст
- ✅ Высокое качество анализа

### Вариант 3: AWS Bedrock (если хотите все в AWS)

```bash
# 1. Включите Bedrock в AWS Console
# 2. Запросите доступ к моделям (Claude, Llama)
# 3. Добавьте в .env файл:
AWS_BEDROCK_REGION=us-east-1
AI_SERVICE=bedrock
```

## 🧪 Тестирование интеграции

### 1. Проверка AWS подключения

```bash
cd backend
node -e "
const { AWSService } = require('./aws-config');
const aws = new AWSService();
console.log('AWS Service initialized successfully');
"
```

### 2. Тестирование загрузки файла

```bash
# Загрузите тестовый PDF файл
curl -X POST -F "file=@test.pdf" http://localhost:3001/api/aws/upload
```

### 3. Тестирование обработки

```bash
# Обработайте загруженный файл
curl -X POST http://localhost:3001/api/aws/process/YOUR_FILE_ID
```

## 📊 Workflow с реальными сервисами

### Полный процесс:

1. **Пользователь загружает PDF** → Frontend
2. **Файл отправляется в AWS S3** → Real AWS
3. **AWS Textract извлекает текст** → Real AWS
4. **AI обрабатывает текст** → OpenAI/Claude/Bedrock
5. **Данные сохраняются в Notion** → Real Notion
6. **Файл дублируется в Google Drive** → Real Google Drive

### Логи процесса:

```bash
# В backend консоли вы увидите:
🚀 Backend server running on http://localhost:3001
File uploaded to AWS S3: research-paper.pdf -> research-1234567890-research-paper.pdf
Starting real processing for file: research-1234567890-research-paper.pdf
Text extracted successfully, length: 15420
AI processing completed successfully
Created Notion entry: { id: 'notion-1234567890', ... }
```

## 💰 Стоимость использования

### AWS:
- **S3**: ~$0.023 за GB в месяц
- **Textract**: ~$1.50 за 1000 страниц

### AI сервисы:
- **OpenAI GPT-4**: ~$0.03 за 1K токенов
- **Anthropic Claude**: ~$0.015 за 1K токенов
- **AWS Bedrock**: ~$0.008 за 1K токенов

### Примерная стоимость обработки одной статьи:
- **S3**: $0.001
- **Textract**: $0.015
- **AI**: $0.05-0.15
- **Итого**: ~$0.07-0.17 за статью

## 🔧 Устранение проблем

### Ошибка AWS credentials:
```bash
Error: AWS credentials not configured
```
**Решение**: Проверьте AWS_ACCESS_KEY_ID и AWS_SECRET_ACCESS_KEY в .env

### Ошибка S3 bucket:
```bash
Error: The specified bucket does not exist
```
**Решение**: Создайте bucket или проверьте название в AWS_S3_BUCKET

### Ошибка AI API:
```bash
Error: AI processing failed
```
**Решение**: Проверьте API ключ и баланс аккаунта

### Fallback режим:
Если AI недоступен, система автоматически переключится на простое извлечение данных без потери функциональности.

## 🚀 Готово к продакшену!

После настройки всех сервисов ваша система будет:
- ✅ Загружать файлы в реальный AWS S3
- ✅ Извлекать текст через AWS Textract
- ✅ Обрабатывать текст с помощью AI
- ✅ Автоматически создавать записи в Notion
- ✅ Сохранять файлы в Google Drive

**Система готова к полноценному использованию! 🎉**
