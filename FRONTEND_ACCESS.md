# 🌐 Доступ к фронтенду Research Base

## ✅ Рабочие ссылки:

### Основной фронтенд:
**https://d2lx0zoh2l5v0i.cloudfront.net**

### Альтернативная ссылка:
**https://d1ncrpqpcdm6kp.cloudfront.net**

## 🔧 API Endpoints:

### Основной API:
**https://d9v5h1vlyh.execute-api.us-east-1.amazonaws.com/prod**

### Доступные эндпоинты:
- `POST /upload` - Получение presigned URL для загрузки PDF
- `POST /process/{fileId}` - Запуск обработки PDF
- `GET /status/{fileId}` - Проверка статуса обработки
- `POST /notion/create` - Создание записи в Notion

## 📊 Статус системы:

### ✅ Работает:
- ✅ Frontend (React + Vite)
- ✅ API Gateway
- ✅ Lambda функции
- ✅ S3 bucket
- ✅ DynamoDB
- ✅ Textract
- ✅ Notion интеграция
- ✅ SNS уведомления
- ✅ CloudWatch мониторинг

### 🔄 Процесс обработки:
1. Пользователь загружает PDF через фронтенд
2. Файл загружается в S3 через presigned URL
3. S3 триггер запускает Lambda
4. Lambda запускает Textract для извлечения текста
5. Извлеченный текст сохраняется в DynamoDB
6. AI анализирует текст и структурирует данные
7. Результат записывается в Notion
8. Отправляются уведомления через SNS

## 🚨 Устранение неполадок:

### Если фронтенд не загружается:
1. Проверить статус CloudFront:
   ```bash
   aws cloudfront get-distribution --id E2S4RI7OV6TJD6
   ```

2. Инвалидировать кеш:
   ```bash
   aws cloudfront create-invalidation --distribution-id E2S4RI7OV6TJD6 --paths "/*"
   ```

3. Пересобрать и задеплоить:
   ```bash
   npm run build
   aws s3 sync dist/ s3://research-base-angelina --delete
   ```

### Если API не отвечает:
1. Проверить статус Lambda:
   ```bash
   aws lambda get-function --function-name research-base-api-handler
   ```

2. Проверить логи:
   ```bash
   aws logs describe-log-streams --log-group-name "/aws/lambda/research-base-api-handler" --order-by LastEventTime --descending --max-items 1
   ```

## 📝 Последнее обновление:
- **Дата**: 2024-10-04
- **Версия**: 2.0
- **Статус**: Полностью функциональная E2E система

---

**Готово к использованию!** 🎉
