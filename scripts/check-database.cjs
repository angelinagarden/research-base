const { Client } = require('@notionhq/client');
require('dotenv').config({ path: './.env.local' });

const notion = new Client({ auth: process.env.VITE_NOTION_API_TOKEN });

async function checkDatabase() {
  try {
    console.log('🔍 Проверяем базу данных...');
    console.log('API Key:', process.env.VITE_NOTION_API_TOKEN ? '✅ Найден' : '❌ Не найден');
    console.log('Database ID:', process.env.VITE_NOTION_DATABASE_ID);
    
    const db = await notion.databases.retrieve({ 
      database_id: process.env.VITE_NOTION_DATABASE_ID 
    });
    
    console.log('\n📊 База данных:', db.title[0]?.plain_text || 'Без названия');
    console.log('🆔 ID:', db.id);
    
    console.log('\n📝 Поля в базе данных:');
    console.log('====================');
    
    if (db.properties) {
      Object.entries(db.properties).forEach(([key, prop]) => {
        console.log(`${key}: ${prop.type}`);
      });
    } else {
      console.log('❌ Свойства не найдены');
    }
    
    // Попробуем получить записи
    console.log('\n🔍 Проверяем записи...');
    const query = await notion.databases.query({ 
      database_id: process.env.VITE_NOTION_DATABASE_ID,
      page_size: 1 
    });
    
    console.log('Количество записей:', query.results.length);
    if (query.results.length > 0) {
      console.log('Поля в первой записи:');
      Object.keys(query.results[0].properties).forEach(key => {
        console.log(`- ${key}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.error('Код ошибки:', error.code);
  }
}

checkDatabase();
