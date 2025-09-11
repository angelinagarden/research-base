// Скрипт для настройки полей в базе данных Notion
import { Client } from '@notionhq/client';
import { NOTION_CONFIG } from '../config/notion';

const client = new Client({ auth: NOTION_CONFIG.API_KEY });

// Определение полей, которые нужно добавить в базу данных
const requiredFields = [
  // Основные поля
  { name: 'TitleOriginal', type: 'title' },
  { name: 'TitleShort', type: 'rich_text' },
  { name: 'AuthorsOrg', type: 'rich_text' },
  { name: 'PubType', type: 'select', options: ['report', 'editorial', 'preprint', 'journal', 'book', 'conference', 'other'] },
  { name: 'DatePublished', type: 'date' },
  { name: 'Tags', type: 'multi_select' },
  
  // Идентификаторы
  { name: 'ISBN', type: 'rich_text' },
  { name: 'DOI', type: 'rich_text' },
  { name: 'URL', type: 'url' },
  
  // Контент
  { name: 'VolumePages', type: 'rich_text' },
  { name: 'Rationale', type: 'rich_text' },
  { name: 'CentralInsight', type: 'rich_text' },
  { name: 'DetailedContent', type: 'rich_text' },
  { name: 'PotentialApplication', type: 'rich_text' },
  { name: 'ImpactForecast', type: 'rich_text' },
  { name: 'RisksLimitations', type: 'rich_text' },
  { name: 'Quote', type: 'rich_text' },
  { name: 'QuestionsLenses', type: 'multi_select' },
  { name: 'ReferencesAPA', type: 'rich_text' },
  { name: 'RawMarkdown', type: 'rich_text' },
];

export const setupNotionDatabase = async () => {
  try {
    console.log('🔍 Проверяем подключение к базе данных...');
    
    // Получаем информацию о базе данных
    const database = await client.databases.retrieve({
      database_id: NOTION_CONFIG.DATABASE_ID
    });
    
    console.log('✅ Подключение успешно!');
    console.log('📊 База данных:', database.title[0]?.plain_text || 'Без названия');
    console.log('🆔 ID:', database.id);
    
    // Получаем существующие свойства
    const existingProperties = Object.keys(database.properties);
    console.log('📝 Существующие поля:', existingProperties);
    
    // Проверяем, какие поля нужно добавить
    const missingFields = requiredFields.filter(field => 
      !existingProperties.includes(field.name)
    );
    
    if (missingFields.length === 0) {
      console.log('✅ Все необходимые поля уже существуют!');
      return { success: true, message: 'База данных уже настроена' };
    }
    
    console.log('⚠️ Отсутствующие поля:', missingFields.map(f => f.name));
    console.log('\n📋 Инструкция по добавлению полей:');
    console.log('1. Откройте базу данных в Notion');
    console.log('2. Нажмите на "+" рядом с заголовками колонок');
    console.log('3. Добавьте следующие поля:');
    
    missingFields.forEach(field => {
      console.log(`\n   ${field.name}:`);
      console.log(`   - Тип: ${field.type}`);
      if (field.options) {
        console.log(`   - Опции: ${field.options.join(', ')}`);
      }
    });
    
    return { 
      success: false, 
      message: 'Нужно добавить поля вручную',
      missingFields 
    };
    
  } catch (error: any) {
    console.error('❌ Ошибка при настройке базы данных:', error.message);
    
    if (error.code === 'unauthorized') {
      console.error('🔑 Проверьте правильность API ключа');
    } else if (error.code === 'object_not_found') {
      console.error('🗄️ Проверьте правильность ID базы данных');
    }
    
    return { 
      success: false, 
      error: error.message,
      code: error.code 
    };
  }
};

// Функция для тестирования в браузере
export const testNotionSetup = async () => {
  console.log('🚀 Тестирование настройки Notion...');
  const result = await setupNotionDatabase();
  
  if (result.success) {
    console.log('🎉 Настройка завершена успешно!');
  } else {
    console.log('⚠️ Требуется дополнительная настройка');
  }
  
  return result;
};

// Добавляем функцию в глобальный объект для тестирования в браузере
if (typeof window !== 'undefined') {
  (window as any).testNotionSetup = testNotionSetup;
}
