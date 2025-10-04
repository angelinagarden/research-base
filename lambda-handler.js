// AWS Lambda handler for Research Base Backend
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { TextractClient, DetectDocumentTextCommand } = require('@aws-sdk/client-textract');
const { Client: NotionClient } = require('@notionhq/client');
const crypto = require('crypto');
const axios = require('axios');

// AWS Services
const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
const textractClient = new TextractClient({ region: process.env.AWS_REGION || 'us-east-1' });
const notionClient = new NotionClient({ auth: process.env.NOTION_API_KEY });

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

// AI Service
class AIService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
  }

  async processResearchText(extractedText) {
    try {
      if (!this.openaiApiKey) {
        return await this.processWithFallback(extractedText);
      }

      const prompt = `
Проанализируй следующий текст научной публикации и извлеки структурированные данные.

Текст публикации:
${extractedText}

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
      return await this.processWithFallback(extractedText);
    }
  }

  async processWithFallback(text) {
    try {
      const lines = text.split('\n').filter(line => line.trim());
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

// Notion Service
class NotionService {
  constructor() {
    this.databaseId = process.env.NOTION_DATABASE_ID;
  }

  async createResearchEntry(aiData, fileBuffer, filename) {
    try {
      const properties = {
        "title": {
          title: [
            {
              text: {
                content: aiData.title || "Untitled Research"
              }
            }
          ]
        },
        "Authors": {
          rich_text: [
            {
              text: {
                content: Array.isArray(aiData.authors) ? aiData.authors.join(", ") : aiData.authors || "Unknown Author"
              }
            }
          ]
        },
        "CentralInsight": {
          rich_text: [
            {
              text: {
                content: aiData.summary || aiData.abstract || "No central insight available"
              }
            }
          ]
        },
        "DOI": {
          rich_text: [
            {
              text: {
                content: aiData.doi || ""
              }
            }
          ]
        },
        "DatePublished": {
          date: {
            start: aiData.published_date || new Date().toISOString().split('T')[0]
          }
        },
        "DetailedContent": {
          rich_text: [
            {
              text: {
                content: `**Abstract:**\n${aiData.abstract || "No abstract available"}\n\n**Summary:**\n${aiData.summary || "No summary available"}\n\n**Key Findings:**\n${Array.isArray(aiData.key_findings) ? aiData.key_findings.map(f => `• ${f}`).join("\n") : "No key findings available"}`
              }
            }
          ]
        },
        "PotentialApplication": {
          rich_text: [
            {
              text: {
                content: aiData.impact_use || "No potential application available"
              }
            }
          ]
        },
        "Organization": {
          rich_text: [
            {
              text: {
                content: aiData.venue || "Unknown Organization"
              }
            }
          ]
        },
        "PubType": {
          multi_select: [
            {
              name: aiData.type || "article"
            }
          ]
        },
        "Tags": {
          multi_select: (aiData.tags || []).map(tag => ({ name: tag }))
        },
        "TitleShort": {
          rich_text: [
            {
              text: {
                content: aiData.title ? aiData.title.substring(0, 100) + (aiData.title.length > 100 ? "..." : "") : "Untitled"
              }
            }
          ]
        },
        "URL": {
          url: aiData.source_url || null
        }
      };

      const response = await notionClient.pages.create({
        parent: {
          database_id: this.databaseId
        },
        properties: properties
      });

      return {
        success: true,
        pageId: response.id,
        url: response.url
      };

    } catch (error) {
      console.error('Notion creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Main Lambda handler
exports.handler = async (event, context) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'CORS preflight' })
      };
    }

    const path = event.path;
    const method = event.httpMethod;

    // Health check
    if (path === '/health' && method === 'GET') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          status: 'OK',
          timestamp: new Date().toISOString(),
          environment: 'aws-lambda'
        })
      };
    }

    // Upload endpoint
    if (path === '/api/aws/upload' && method === 'POST') {
      const aiService = new AIService();
      const notionService = new NotionService();

      // Parse multipart form data
      const contentType = event.headers['content-type'] || event.headers['Content-Type'];
      if (!contentType || !contentType.includes('multipart/form-data')) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ success: false, error: 'Invalid content type' })
        };
      }

      // For Lambda, we need to handle file upload differently
      const body = event.body;
      const isBase64Encoded = event.isBase64Encoded;
      
      if (isBase64Encoded) {
        const buffer = Buffer.from(body, 'base64');
        const filename = `research-${Date.now()}-${Math.round(Math.random() * 1E9)}.txt`;
        
        // Upload to S3
        const s3Result = await s3Client.send(new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: `research-papers/${filename}`,
          Body: buffer,
          ContentType: 'text/plain'
        }));

        // Process with AI
        const text = buffer.toString('utf8');
        const aiResult = await aiService.processResearchText(text);
        
        if (!aiResult.success) {
          return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ success: false, error: aiResult.error })
          };
        }

        // Create Notion entry
        const notionResult = await notionService.createResearchEntry(
          aiResult.extractedData, 
          buffer, 
          filename
        );

        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            extractedData: aiResult.extractedData,
            s3Url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/research-papers/${filename}`,
            notionEntry: notionResult,
            mode: 'aws-lambda'
          })
        };
      }

      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'Invalid request format' })
      };
    }

    // Notion test endpoint
    if (path === '/api/notion/test' && method === 'POST') {
      try {
        if (!process.env.NOTION_API_KEY) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({
              success: false,
              error: 'Notion API key not configured'
            })
          };
        }

        const response = await notionClient.databases.retrieve({
          database_id: process.env.NOTION_DATABASE_ID
        });

        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            message: 'Notion API configured correctly',
            databaseTitle: response.title[0]?.plain_text || "Unknown",
            databaseId: process.env.NOTION_DATABASE_ID
          })
        };
      } catch (error) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({
            success: false,
            error: error.message
          })
        };
      }
    }

    // 404 for unknown paths
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Not found' })
    };

  } catch (error) {
    console.error('Lambda error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
