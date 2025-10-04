#!/usr/bin/env node

/**
 * Быстрый скрипт для добавления исследований в Notion
 * Использование: node scripts/quick-add-research.js
 */

const { Client } = require('@notionhq/client');
require('dotenv').config({ path: './.env.local' });

// Проверяем переменные окружения
const apiKey = process.env.VITE_NOTION_API_TOKEN;
const databaseId = process.env.VITE_NOTION_DATABASE_ID;

if (!apiKey || !databaseId) {
  console.error('❌ Ошибка: Не найдены переменные окружения');
  console.error('Создайте файл .env.local на основе env.template');
  process.exit(1);
}

const notion = new Client({ auth: apiKey });

// Интерактивный ввод данных
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function addResearch() {
  try {
    console.log('🚀 Быстрое добавление исследования в Notion');
    console.log('==========================================\n');

    // Собираем данные
    const titleOriginal = await question('📝 Оригинальное название: ');
    const titleShort = await question('📝 Краткое название: ');
    const authors = await question('👥 Авторы/Организация: ');
    const url = await question('🔗 URL документа: ');
    const datePublished = await question('📅 Дата публикации (YYYY-MM-DD): ');
    
    console.log('\n📋 Введите теги через запятую:');
    const tagsInput = await question('🏷️  Теги: ');
    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    console.log('\n📝 Введите краткое резюме (до 2000 символов):');
    const centralInsight = await question('💡 Ключевые выводы: ');
    
    console.log('\n📝 Введите подробный анализ (до 2000 символов):');
    const detailedContent = await question('📊 Детальный контент: ');

    // Создаем запись в Notion
    console.log('\n⏳ Добавляем в Notion...');
    
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        'TitleOriginal': { 
          title: [{ text: { content: titleOriginal } }] 
        },
        'TitleShort': { 
          rich_text: [{ text: { content: titleShort } }] 
        },
        'AuthorsOrg': { 
          rich_text: [{ text: { content: authors } }] 
        },
        'URL': { 
          url: url 
        },
        'DatePublished': { 
          date: { start: datePublished } 
        },
        'Tags': { 
          multi_select: tags.map(tag => ({ name: tag })) 
        },
        'CentralInsight': { 
          rich_text: [{ text: { content: centralInsight } }] 
        },
        'DetailedContent': { 
          rich_text: [{ text: { content: detailedContent } }] 
        },
        'PubType': { 
          select: { name: 'Report' } 
        }
      }
    });

    console.log('✅ Исследование успешно добавлено!');
    console.log('🆔 ID:', response.id);
    console.log('🔗 URL:', response.url);
    console.log('\n🌐 Теперь обновите веб-страницу, чтобы увидеть изменения');

  } catch (error) {
    console.error('❌ Ошибка при добавлении исследования:', error.message);
    
    if (error.code === 'unauthorized') {
      console.error('🔑 Проверьте правильность API ключа в .env.local');
    } else if (error.code === 'object_not_found') {
      console.error('🗄️ Проверьте правильность ID базы данных в .env.local');
    }
  } finally {
    rl.close();
  }
}

// Запускаем скрипт
addResearch();
