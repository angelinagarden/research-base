// Утилита для тестирования подключения к Notion
import { Client } from '@notionhq/client';

export const testNotionConnection = async (apiKey: string, databaseId: string) => {
  try {
    const client = new Client({ auth: apiKey });
    
    // Проверяем доступ к базе данных
    const response = await client.databases.retrieve({ database_id: databaseId });
    
    console.log('✅ Успешное подключение к Notion!');
    console.log('📊 База данных:', response.title[0]?.plain_text || 'Без названия');
    console.log('🆔 ID базы данных:', response.id);
    console.log('📝 Свойства базы данных:', Object.keys(response.properties));
    
    return {
      success: true,
      database: {
        id: response.id,
        title: response.title[0]?.plain_text || 'Без названия',
        properties: Object.keys(response.properties)
      }
    };
  } catch (error: any) {
    console.error('❌ Ошибка подключения к Notion:', error.message);
    
    if (error.code === 'unauthorized') {
      console.error('🔑 Проверьте правильность API ключа');
    } else if (error.code === 'object_not_found') {
      console.error('🗄️ Проверьте правильность ID базы данных');
    } else if (error.code === 'validation_error') {
      console.error('📋 Проверьте структуру базы данных');
    }
    
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
};

// Функция для тестирования в браузере
export const testNotionInBrowser = () => {
  const apiKey = import.meta.env.VITE_NOTION_API_KEY;
  const databaseId = import.meta.env.VITE_NOTION_DATABASE_ID;
  
  if (!apiKey || apiKey === 'your_notion_integration_token_here') {
    console.warn('⚠️ VITE_NOTION_API_KEY не настроен');
    return;
  }
  
  if (!databaseId || databaseId === 'your_database_id_here') {
    console.warn('⚠️ VITE_NOTION_DATABASE_ID не настроен');
    return;
  }
  
  testNotionConnection(apiKey, databaseId);
};
