# 🚀 AWS Deployment Guide for Research Base

## Обзор

Этот гайд поможет вам развернуть React frontend в AWS с использованием:
- **AWS S3** - для хостинга статических файлов
- **CloudFront CDN** - для быстрой доставки контента
- **Автоматический деплой** - через скрипты

## 🛠️ Быстрый деплой

### 1. **Один командный деплой**
```bash
# Сделать скрипт исполняемым
chmod +x scripts/deploy-frontend.sh

# Запустить полный деплой
./scripts/deploy-frontend.sh
```

### 2. **Или через npm**
```bash
# Собрать и задеплоить
npm run deploy:build

# Только деплой (если уже собрано)
npm run deploy:aws
```

## 📋 Что делает скрипт деплоя

1. **✅ Проверяет AWS credentials**
2. **✅ Собирает frontend для продакшена**
3. **✅ Создает S3 bucket для frontend**
4. **✅ Настраивает статический хостинг**
5. **✅ Загружает файлы в S3**
6. **✅ Создает CloudFront CDN (опционально)**
7. **✅ Выдает URL для доступа**

## 🌐 Результат деплоя

После успешного деплоя вы получите:

### **S3 Static Website URL:**
```
http://research-base-frontend-XXXXX.s3-website-us-east-1.amazonaws.com
```

### **CloudFront CDN URL (если включен):**
```
https://d1234567890.cloudfront.net
```

## 🔧 Ручная настройка

### 1. **Создание S3 bucket**
```bash
# Создать bucket
aws s3 mb s3://your-frontend-bucket-name

# Настроить для статического хостинга
aws s3 website s3://your-frontend-bucket-name \
  --index-document index.html \
  --error-document index.html
```

### 2. **Настройка политики доступа**
```bash
# Создать политику для публичного доступа
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-frontend-bucket-name/*"
        }
    ]
}
EOF

# Применить политику
aws s3api put-bucket-policy --bucket your-frontend-bucket-name --policy file://bucket-policy.json
```

### 3. **Загрузка файлов**
```bash
# Собрать проект
npm run build:prod

# Загрузить в S3
aws s3 sync dist/ s3://your-frontend-bucket-name --delete
```

## ☁️ CloudFront CDN (рекомендуется)

### Преимущества CloudFront:
- **🚀 Быстрая загрузка** - кэширование по всему миру
- **🔒 HTTPS** - автоматический SSL сертификат
- **📱 Мобильная оптимизация**
- **💰 Экономия** - меньше запросов к S3

### Создание CloudFront distribution:
```bash
# Создать distribution через AWS CLI
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

## 🔄 Обновление деплоя

### Быстрое обновление:
```bash
# Пересобрать и обновить
npm run build:prod
npm run deploy:update
```

### Полное переразвертывание:
```bash
# Полный деплой с нуля
./scripts/deploy-frontend.sh
```

## 🌍 Настройка домена

### 1. **Покупка домена**
- Купите домен через Route 53 или другой регистратор
- Пример: `research-base.yourdomain.com`

### 2. **Настройка DNS**
```bash
# Создать CNAME запись
your-domain.com → d1234567890.cloudfront.net
```

### 3. **SSL сертификат**
- CloudFront автоматически предоставляет SSL
- Или используйте AWS Certificate Manager

## 📊 Мониторинг и аналитика

### CloudWatch метрики:
- **Запросы** - количество обращений
- **Ошибки** - 4xx, 5xx коды
- **Латентность** - время отклика
- **Трафик** - объем данных

### Доступ к логам:
```bash
# CloudFront access logs
aws logs describe-log-groups --log-group-name-prefix "/aws/cloudfront"
```

## 💰 Стоимость

### S3 Static Website:
- **Хранение**: ~$0.023 за GB в месяц
- **Запросы**: ~$0.0004 за 1000 запросов

### CloudFront CDN:
- **Первый 1TB**: $0.085 за GB
- **Запросы**: $0.0075 за 10,000 запросов

### Примерная стоимость для 1000 пользователей/месяц:
- **S3**: ~$0.50
- **CloudFront**: ~$1.20
- **Итого**: ~$1.70/месяц

## 🔧 Устранение проблем

### Ошибка "Bucket already exists":
```bash
# Использовать уникальное имя
aws s3 mb s3://research-base-frontend-$(date +%s)
```

### Ошибка "Access Denied":
```bash
# Проверить права пользователя
aws sts get-caller-identity

# Проверить политику bucket
aws s3api get-bucket-policy --bucket your-bucket-name
```

### Ошибка "Website not loading":
```bash
# Проверить настройки website
aws s3api get-bucket-website --bucket your-bucket-name

# Проверить файлы в bucket
aws s3 ls s3://your-bucket-name
```

## 🚀 Автоматизация

### GitHub Actions (опционально):
```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build:prod
      - name: Deploy to S3
        run: aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }} --delete
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## 📞 Поддержка

### Полезные команды:
```bash
# Проверить статус деплоя
aws s3 ls s3://your-bucket-name

# Проверить CloudFront
aws cloudfront list-distributions

# Посмотреть логи
aws logs describe-log-groups
```

### Полезные ссылки:
- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [AWS Pricing Calculator](https://calculator.aws/)

---

**🎉 Готово! Ваш Research Base теперь работает в AWS!**

**URL вашего приложения будет показан после деплоя.**

