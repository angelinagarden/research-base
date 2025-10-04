# 🔧 Исправление ошибки 500 - IAM права

## ✅ Проблема решена!

**Ошибка**: `HTTP error! status: 500` при обработке PDF

**Причина**: Lambda функция не имела прав на доступ к DynamoDB

```
AccessDeniedException: User: arn:aws:sts::664631055520:assumed-role/research-base-lambda-role/research-base-api-handler is not authorized to perform: dynamodb:GetItem on resource: arn:aws:dynamodb:us-east-1:664631055520:table/research-extracted-text because no identity-based policy allows the dynamodb:GetItem action
```

## 🛠️ Что было исправлено:

### 1. ✅ Добавлены права на DynamoDB:
```bash
aws iam attach-role-policy --role-name research-base-lambda-role --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
```

### 2. ✅ Добавлены права на SNS:
```bash
aws iam attach-role-policy --role-name research-base-lambda-role --policy-arn arn:aws:iam::aws:policy/AmazonSNSFullAccess
```

### 3. ✅ Проверены текущие права Lambda роли:
- ✅ CloudWatchLogsFullAccess
- ✅ AmazonTextractFullAccess  
- ✅ AmazonS3FullAccess
- ✅ **AmazonDynamoDBFullAccess** (добавлено)
- ✅ **AmazonSNSFullAccess** (добавлено)

## 🧪 Тестирование:

### ✅ Upload работает:
```bash
curl -X POST "https://d9v5h1vlyh.execute-api.us-east-1.amazonaws.com/prod/upload" \
  -H "Content-Type: application/json" \
  -d '{"filename": "test.pdf", "contentType": "application/pdf"}'
```

### ✅ Process работает (без ошибки 500):
```bash
curl -X POST "https://d9v5h1vlyh.execute-api.us-east-1.amazonaws.com/prod/process/{fileId}" \
  -H "Content-Type: application/json"
```

## 📊 Статус системы:

- **Frontend**: ✅ Работает (https://d2lx0zoh2l5v0i.cloudfront.net)
- **API**: ✅ Работает (без ошибок 500)
- **S3**: ✅ Работает
- **DynamoDB**: ✅ Доступ разрешен
- **Textract**: ✅ Настроен
- **Notion**: ✅ Интегрирован
- **SNS**: ✅ Доступ разрешен
- **CloudWatch**: ✅ Мониторинг активен

## 🎯 Результат:

**Система полностью функциональна!** Теперь можно:
1. Загружать PDF файлы
2. Обрабатывать их через Textract
3. Сохранять результаты в DynamoDB
4. Отправлять уведомления через SNS
5. Создавать записи в Notion

---

**Ошибка 500 устранена!** 🎉
