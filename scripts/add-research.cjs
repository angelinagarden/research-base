#!/usr/bin/env node

/**
 * Супер-быстрый скрипт для добавления исследований
 * Использование: node scripts/add-research.js "Название" "Авторы" "URL" "2025-01-15" "тег1,тег2,тег3"
 */

const { Client } = require('@notionhq/client');
require('dotenv').config({ path: './.env.local' });

const [,, title, authors, url, date, tags] = process.argv;

if (!title || !authors || !url || !date) {
  console.log('❌ Использование: node scripts/add-research.js "Название" "Авторы" "URL" "2025-01-15" "тег1,тег2,тег3"');
  process.exit(1);
}

const apiKey = process.env.VITE_NOTION_API_TOKEN;
const databaseId = process.env.VITE_NOTION_DATABASE_ID;

if (!apiKey || !databaseId) {
  console.error('❌ Ошибка: Не найдены переменные окружения в .env.local');
  process.exit(1);
}

const notion = new Client({ auth: apiKey });
const tagList = tags ? tags.split(',').map(t => t.trim()) : [];

async function addResearch() {
  try {
    console.log('⏳ Добавляем исследование...');
    
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        'title': { 
          title: [{ text: { content: title } }] 
        },
        // Добавляем дополнительные поля, если они существуют
        // 'URL': { url: url },
        // 'DatePublished': { date: { start: date } },
        // 'Tags': { multi_select: tagList.map(tag => ({ name: tag })) }
      }
    });

    console.log('✅ Готово!');
    console.log('🆔 ID:', response.id);
    console.log('🔗 URL:', response.url);
    console.log('🌐 Обновите веб-страницу');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

addResearch();
