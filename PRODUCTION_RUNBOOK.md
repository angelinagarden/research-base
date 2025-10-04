# Research Base Production Runbook

## Система мониторинга

### Архитектура E2E пайплайна:
```
Frontend → API Gateway → Lambda → возвращает presigned URL
Frontend → S3 (presigned URL) → файл загружается  
S3 → триггер → Lambda → Textract → извлекает текст
Lambda → DynamoDB → сохраняет извлеченный текст
Lambda → OpenAI API → отправляет текст в ChatGPT
Lambda → получает ответ от ChatGPT
Lambda → Notion → создает страницу с результатами
```

### CloudWatch Алармы:
- `research-lambda-errors`: Ошибки в Lambda функции
- `research-lambda-duration`: Длительность выполнения Lambda > 10 минут
- `research-lambda-invocations`: Мониторинг вызовов Lambda

### SNS Топик:
- `research-processing-alerts`: Уведомления о проблемах

## Диагностика проблем

### 1. Проблемы с S3 Upload (403 Forbidden)
**Симптомы:** Frontend получает 403 при загрузке файлов
**Решение:** 
- Проверить Lambda функцию: `aws lambda get-function --function-name research-base-api-handler`
- Проверить переменные окружения
- Проверить IAM роли Lambda

### 2. Проблемы с Textract
**Симптомы:** "Failed to extract text from PDF"
**Решение:**
- Проверить логи Lambda: `aws logs describe-log-streams --log-group-name /aws/lambda/research-base-api-handler`
- Проверить размер файла (Textract имеет ограничения)
- Проверить формат файла (должен быть PDF)

### 3. Проблемы с OpenAI API
**Симптомы:** "AI Processing Failed"
**Решение:**
- Проверить API ключ в переменных окружения
- Проверить баланс OpenAI аккаунта
- Проверить лимиты API

### 4. Проблемы с Notion
**Симптомы:** "Failed to create Notion page"
**Решение:**
- Проверить Notion API токен
- Проверить права доступа к базе данных
- Проверить схему базы данных

## Команды для диагностики

### Проверить статус Lambda:
```bash
aws lambda get-function --function-name research-base-api-handler
```

### Посмотреть логи Lambda:
```bash
aws logs describe-log-streams --log-group-name /aws/lambda/research-base-api-handler --order-by LastEventTime --descending
aws logs get-log-events --log-group-name /aws/lambda/research-base-api-handler --log-stream-name [STREAM_NAME]
```

### Проверить DynamoDB таблицу:
```bash
aws dynamodb scan --table-name research-extracted-text --limit 10
```

### Проверить S3 триггеры:
```bash
aws s3api get-bucket-notification-configuration --bucket research-base-angelina
```

### Проверить CloudWatch метрики:
```bash
aws cloudwatch get-metric-statistics --namespace AWS/Lambda --metric-name Errors --dimensions Name=FunctionName,Value=research-base-api-handler --start-time 2025-10-04T00:00:00Z --end-time 2025-10-04T23:59:59Z --period 300 --statistics Sum
```

## Переменные окружения Lambda:
- `S3_BUCKET`: research-base-angelina
- `NOTION_DATABASE_ID`: [YOUR_NOTION_DATABASE_ID]
- `NOTION_API_TOKEN`: [YOUR_NOTION_API_TOKEN]
- `OPENAI_API_KEY`: [YOUR_OPENAI_API_KEY]

## IAM Роли и политики:
- Lambda роль: `research-base-lambda-role`
- Необходимые политики:
  - `AmazonS3FullAccess`
  - `AmazonTextractFullAccess`
  - `AmazonDynamoDBFullAccess`
  - `AmazonSNSFullAccess`

## Эндпоинты API:
- Upload: `POST /upload`
- Process: `POST /process/{fileId}`
- Frontend: `https://d2lx0zoh2l5v0i.cloudfront.net`

## Процедуры восстановления:

### Перезапуск Lambda:
```bash
aws lambda update-function-code --function-name research-base-api-handler --zip-file fileb://lambda-minimal.zip
```

### Обновление переменных окружения:
```bash
aws lambda update-function-configuration --function-name research-base-api-handler --environment Variables='{...}'
```

### Проверка состояния системы:
1. Проверить CloudWatch алармы
2. Проверить логи Lambda
3. Проверить DynamoDB на наличие данных
4. Протестировать upload через frontend