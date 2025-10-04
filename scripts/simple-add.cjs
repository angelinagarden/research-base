const { Client } = require('@notionhq/client');
require('dotenv').config({ path: './.env.local' });

const notion = new Client({ auth: process.env.VITE_NOTION_API_TOKEN });

async function simpleAdd() {
  try {
    console.log('🚀 Пробуем добавить запись с разными полями...');
    
    // Пробуем разные варианты названий полей
    const fieldVariants = [
      'Title',
      'Name', 
      'title',
      'name',
      'TitleOriginal',
      'title_original',
      'Research Title',
      'Research Title Original'
    ];
    
    for (const fieldName of fieldVariants) {
      try {
        console.log(`\n🧪 Пробуем поле: ${fieldName}`);
        
        const response = await notion.pages.create({
          parent: { database_id: process.env.VITE_NOTION_DATABASE_ID },
          properties: {
            [fieldName]: { 
              title: [{ text: { content: `Тест с полем ${fieldName}` } }] 
            }
          }
        });

        console.log(`✅ Успех с полем: ${fieldName}`);
        console.log('ID:', response.id);
        console.log('URL:', response.url);
        return; // Если успешно, выходим
        
      } catch (error) {
        console.log(`❌ ${fieldName}: ${error.message}`);
      }
    }
    
    console.log('\n❌ Ни одно поле не подошло. Возможно, нужно настроить права доступа.');
    
  } catch (error) {
    console.error('❌ Общая ошибка:', error.message);
  }
}

simpleAdd();
