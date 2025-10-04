// AI Service for processing extracted text from research papers
const axios = require('axios');

class AIService {
  constructor() {
    // Настройте ваш AI API здесь
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    this.awsBedrockRegion = process.env.AWS_BEDROCK_REGION;
  }

  /**
   * Process extracted text using AI to extract structured data
   */
  async processResearchText(extractedText) {
    try {
      // Проверяем наличие API ключа
      if (!this.openaiApiKey) {
        console.log('OpenAI API key not configured, using fallback');
        return await this.processWithFallback(extractedText);
      }

      // Выберите один из методов обработки
      const method = process.env.AI_SERVICE || 'openai'; // openai, anthropic, bedrock

      switch (method) {
        case 'openai':
          return await this.processWithOpenAI(extractedText);
        case 'anthropic':
          return await this.processWithAnthropic(extractedText);
        case 'bedrock':
          return await this.processWithBedrock(extractedText);
        default:
          return await this.processWithOpenAI(extractedText);
      }
    } catch (error) {
      console.error('AI processing error:', error);
      console.log('Falling back to simple text parsing...');
      return await this.processWithFallback(extractedText);
    }
  }

  /**
   * Process with OpenAI GPT-4
   */
  async processWithOpenAI(text) {
    try {
      const prompt = `
Проанализируй следующий текст научной публикации и извлеки структурированные данные.

Текст публикации:
${text}

Извлеки и верни в формате JSON следующие данные:
{
  "title": "полное название публикации на языке оригинала",
  "authors": ["Фамилия Имя", "Фамилия Имя"],
  "published_date": "YYYY-MM-DD (если только год, используй YYYY-12-31; если год-месяц, используй последний день месяца)",
  "venue": "журнал/издание/организация",
  "type": "одно из: article | preprint | report | chapter | book | thesis | dataset | video | webpage",
  "language": "ISO 639-1 код языка (ru, en, etc.)",
  "source_url": "URL источника если есть, иначе пустая строка",
  "doi": "DOI без префикса https (например: 10.1145/1234567.8901234)",
  "abstract": "аннотация как в PDF",
  "summary": "120-160 слов, краткое резюме для базы",
  "key_findings": ["краткий вывод 1", "краткий вывод 2", "краткий вывод 3", "краткий вывод 4"],
  "tags": ["тег1", "тег2", "тег3"],
  "impact_use": "практическая польза/как применять"
}

Жёсткие правила:
- authors: минимум 1 элемент, формат "Фамилия Имя"
- published_date: всегда полная дата YYYY-MM-DD
- type: строго из списка выше
- language: ISO 639-1 код
- key_findings: минимум 3, максимум 7 пунктов
- summary: примерно 120-160 слов
- tags: релевантные теги для области исследования

Важно: отвечай ТОЛЬКО JSON, без дополнительного текста.
`;

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Ты эксперт по анализу научных статей. Извлекаешь структурированные данные из текста.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.1
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const aiResponse = response.data.choices[0].message.content;
      const extractedData = JSON.parse(aiResponse);

      return {
        success: true,
        extractedData
      };

    } catch (error) {
      console.error('OpenAI error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process with Anthropic Claude
   */
  async processWithAnthropic(text) {
    try {
      const prompt = `
Проанализируй следующий текст научной статьи и извлеки структурированные данные.

Текст статьи:
${text}

Пожалуйста, извлеки и верни в формате JSON следующие данные:
{
  "title": "Название статьи",
  "authors": ["Автор 1", "Автор 2"],
  "abstract": "Краткое содержание статьи",
  "keywords": ["ключевое слово 1", "ключевое слово 2"],
  "publicationDate": "YYYY-MM-DD",
  "doi": "DOI если есть",
  "institution": "Учреждение/университет",
  "journal": "Журнал если есть",
  "content": "Основной текст статьи",
  "researchType": "experimental/theoretical/review",
  "field": "область исследования"
}

Важно: отвечай ТОЛЬКО JSON, без дополнительного текста.
`;

      const response = await axios.post('https://api.anthropic.com/v1/messages', {
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      }, {
        headers: {
          'x-api-key': this.anthropicApiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        }
      });

      const aiResponse = response.data.content[0].text;
      const extractedData = JSON.parse(aiResponse);

      return {
        success: true,
        extractedData
      };

    } catch (error) {
      console.error('Anthropic error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process with AWS Bedrock
   */
  async processWithBedrock(text) {
    try {
      // Этот метод потребует настройки AWS Bedrock
      // Пока возвращаем заглушку
      return {
        success: false,
        error: 'AWS Bedrock integration not implemented yet'
      };
    } catch (error) {
      console.error('Bedrock error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Fallback method - simple text parsing
   */
  async processWithFallback(text) {
    try {
      const lines = text.split('\n').filter(line => line.trim());
      
      // Простое извлечение данных без AI
      const title = lines[0] || 'Untitled Research Paper';
      const authors = lines.slice(1, 3).filter(line => line.includes('@') || line.includes('Dr.') || line.includes('Prof.'));
      
      return {
        success: true,
        extractedData: {
          title,
          authors: authors.length > 0 ? authors : ['Unknown Author'],
          published_date: new Date().toISOString().split('T')[0],
          venue: 'Unknown Venue',
          type: 'article',
          language: 'en',
          source_url: '',
          doi: '',
          abstract: lines.slice(2, 5).join(' ').substring(0, 500),
          summary: 'Research paper summary extracted from document content.',
          key_findings: [
            'Key finding 1 from the research',
            'Key finding 2 from the research',
            'Key finding 3 from the research'
          ],
          tags: ['research', 'study'],
          impact_use: 'Research findings can be applied in various contexts'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = { AIService };
