# 🚀 Research Upload System - Setup Instructions

## Обзор системы

Система позволяет загружать PDF файлы исследований, которые автоматически:
1. Загружаются в AWS S3
2. Обрабатываются для извлечения данных (заголовок, авторы, абстракт и т.д.)
3. Сохраняются в Notion базу данных
4. Дублируются в Google Drive

## 🛠️ Установка и настройка

### 1. Установка зависимостей

```bash
# Frontend зависимости (уже установлены)
cd /Users/angelinazajceva/research-base
npm install

# Backend зависимости
cd backend
npm install
```

### 2. Настройка переменных окружения

#### Frontend (.env.local)
```bash
# Notion API Configuration
VITE_NOTION_API_TOKEN=your_notion_api_token_here
VITE_NOTION_DATABASE_ID=26bb3dee574080918494dccf1c1d9da2
VITE_NOTION_PAGE_ID=26bb3dee574080918494dccf1c1d9da2

# API Endpoints
VITE_AWS_API_URL=http://localhost:3001/api/aws
VITE_GOOGLE_DRIVE_API_URL=http://localhost:3001/api/google-drive
```

#### Backend (.env)
```bash
# Server Configuration
PORT=3001

# AWS Configuration (когда настроите реальный AWS)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=research-files-bucket

# Google Drive Configuration (когда настроите реальный Google Drive API)
GOOGLE_DRIVE_CLIENT_ID=your_google_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_google_client_secret
GOOGLE_DRIVE_REFRESH_TOKEN=your_google_refresh_token

# Notion Configuration
NOTION_API_TOKEN=your_notion_api_token_here
NOTION_DATABASE_ID=26bb3dee574080918494dccf1c1d9da2
```

### 3. Запуск системы

```bash
# Терминал 1: Backend сервер
cd backend
npm start

# Терминал 2: Frontend приложение
cd /Users/angelinazajceva/research-base
npm run dev
```

## 🌐 Доступ к приложению

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001
- **Страница загрузки**: http://localhost:8080/upload

## 📁 Структура проекта

```
research-base/
├── src/
│   ├── pages/
│   │   └── UploadResearch.tsx    # Страница загрузки PDF
│   ├── services/
│   │   ├── awsService.ts         # AWS интеграция
│   │   ├── googleDriveService.ts # Google Drive интеграция
│   │   ├── notionService.ts      # Notion интеграция
│   │   └── researchWorkflowService.ts # Главный workflow
│   └── components/
│       └── Navigation.tsx        # Навигация с кнопкой "Загрузить"
├── backend/
│   ├── server.js                 # Backend сервер
│   ├── package.json              # Backend зависимости
│   └── uploads/                  # Временные файлы
└── .env.local                    # Frontend переменные окружения
```

## 🔄 Workflow процесса

1. **Пользователь загружает PDF** на странице `/upload`
2. **Файл отправляется в AWS S3** (пока симуляция)
3. **AWS обрабатывает PDF** и извлекает данные (пока симуляция)
4. **Файл сохраняется в Google Drive** (пока симуляция)
5. **Данные добавляются в Notion** базу данных
6. **Пользователь получает уведомление** об успешном завершении

## 🧪 Текущий статус

### ✅ Реализовано
- [x] Страница загрузки PDF файлов
- [x] Backend API для обработки файлов
- [x] Интеграция с Notion
- [x] Симуляция AWS и Google Drive
- [x] Полный workflow процесс
- [x] UI/UX с прогресс-баром и уведомлениями

### 🔄 В разработке (симуляция)
- [ ] Реальная интеграция с AWS S3
- [ ] Реальная интеграция с AWS Textract
- [ ] Реальная интеграция с Google Drive API
- [ ] Обработка ошибок и валидация

## 🚀 Следующие шаги для продакшена

### 1. Настройка AWS
```bash
# Создайте S3 bucket
aws s3 mb s3://research-files-bucket

# Настройте Textract для обработки PDF
aws textract create-document-classifier
```

### 2. Настройка Google Drive API
1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте проект и включите Google Drive API
3. Создайте OAuth 2.0 credentials
4. Получите refresh token для сервисного аккаунта

### 3. Обновление backend
Замените симуляции в `backend/server.js` на реальные API вызовы:
- AWS SDK для S3 и Textract
- Google Drive API для загрузки файлов
- Улучшенная обработка ошибок

## 🐛 Тестирование

### Тест загрузки файла
1. Откройте http://localhost:8080/upload
2. Выберите PDF файл
3. Нажмите "Загрузить исследование"
4. Наблюдайте за прогрессом обработки

### Проверка Notion
1. Откройте вашу Notion базу данных
2. Убедитесь, что новое исследование добавлено
3. Проверьте, что все поля заполнены

## 📞 Поддержка

При возникновении проблем:
1. Проверьте, что backend сервер запущен на порту 3001
2. Убедитесь, что Notion API токен действителен
3. Проверьте консоль браузера на ошибки
4. Проверьте логи backend сервера

---

**Система готова к тестированию! 🎉**
