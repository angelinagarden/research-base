const { Client } = require('@notionhq/client');
require('dotenv').config({ path: './.env.local' });

const notion = new Client({ auth: process.env.VITE_NOTION_API_TOKEN });

async function testAdd() {
  try {
    console.log('🧪 Тестируем добавление записи...');
    
    // Пробуем добавить с минимальными полями
    const response = await notion.pages.create({
      parent: { database_id: process.env.VITE_NOTION_DATABASE_ID },
      properties: {
        'Name': { 
          title: [{ text: { content: 'Тестовая запись' } }] 
        }
      }
    });

    console.log('✅ Запись добавлена!');
    console.log('ID:', response.id);
    console.log('URL:', response.url);

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.error('Код:', error.code);
    
    // Если ошибка связана с полями, попробуем другой подход
    if (error.message.includes('property') || error.message.includes('field')) {
      console.log('\n🔍 Попробуем получить информацию о полях...');
      
      try {
        const db = await notion.databases.retrieve({ 
          database_id: process.env.VITE_NOTION_DATABASE_ID 
        });
        
        console.log('Поля в базе данных:');
        if (db.properties) {
          Object.keys(db.properties).forEach(key => {
            console.log(`- ${key}`);
          });
        }
      } catch (err) {
        console.error('Ошибка при получении полей:', err.message);
      }
    }
  }
}

testAdd();
