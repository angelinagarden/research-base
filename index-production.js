const { Client } = require('@notionhq/client');
const AWS = require('aws-sdk');

// Инициализация AWS сервисов
const s3 = new AWS.S3();
const textract = new AWS.Textract();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const S3_BUCKET = process.env.S3_BUCKET;
const DYNAMODB_TABLE = 'research-extracted-text';

function getCorsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Content-Type': 'application/json'
    };
}

function truncateText(text, maxLength = 2000) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Реальная функция для генерации presigned URL
async function generatePresignedUrl(filename) {
    const fileId = `research-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const key = `uploads/${fileId}.pdf`;
    
    try {
        const presignedUrl = await s3.getSignedUrlPromise('putObject', {
            Bucket: S3_BUCKET,
            Key: key,
            ContentType: 'application/pdf',
            Expires: 3600 // 1 час
        });
        
        return {
            uploadUrl: presignedUrl,
            fileId: fileId,
            key: key
        };
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        throw error;
    }
}

// Функция для извлечения текста с помощью Textract
async function extractTextWithTextract(s3Key) {
    try {
        console.log('Starting Textract processing for:', s3Key);
        
        // Запускаем асинхронную обработку
        const startResult = await textract.startDocumentTextDetection({
            DocumentLocation: {
                S3Object: {
                    Bucket: S3_BUCKET,
                    Name: s3Key
                }
            }
        }).promise();
        
        const jobId = startResult.JobId;
        console.log('Textract job started:', jobId);
        
        // Ждем завершения обработки
        let jobComplete = false;
        let attempts = 0;
        const maxAttempts = 30; // 5 минут максимум
        
        while (!jobComplete && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // ждем 10 секунд
            
            const result = await textract.getDocumentTextDetection({
                JobId: jobId
            }).promise();
            
            if (result.JobStatus === 'SUCCEEDED') {
                jobComplete = true;
                
                // Извлекаем текст из результатов
                let extractedText = '';
                if (result.Blocks) {
                    const textBlocks = result.Blocks.filter(block => block.BlockType === 'LINE');
                    extractedText = textBlocks.map(block => block.Text).join('\n');
                }
                
                console.log('Textract completed successfully. Extracted text length:', extractedText.length);
                return {
                    success: true,
                    text: extractedText,
                    jobId: jobId
                };
            } else if (result.JobStatus === 'FAILED') {
                throw new Error(`Textract job failed: ${result.StatusMessage}`);
            }
            
            attempts++;
        }
        
        throw new Error('Textract job timeout');
        
    } catch (error) {
        console.error('Error in extractTextWithTextract:', error);
        throw error;
    }
}

// Функция для AI обработки с OpenAI
async function processWithAI(text, fileId) {
    const prompt = `Роль и цель

Ты — строгий экстрактор знаний из академических PDF.

Вход: один PDF (статья, отчёт, препринт, диссертация).

Выход: и JSON-карточка по жёсткой схеме, и одна строка для таблички (Markdown-таблица и сырой TSV).

Язык и стиль
4) Все краткие формулировки и резюме — на русском. Цитаты — на языке источника.
5) Пиши ёмко, без воды. Не превышай указанные лимиты.

Жёсткая схема (ничего не optional!)
6) Сформируй объект record со следующими полями (все обязательны, если нет данных — поставь строку "MISSING" и добавь поле missing_fields со списком таких ключей):

{
  "title_original": string,              // исходный заголовок из PDF
  "title_short": string,                 // ≤ 60 символов, смысловой синоним
  "authors": [                           // минимум один
    {
      "name_original": string,           // как в публикации
      "name_latin": string               // латиницей (если оригинал не латиницей), иначе повтори оригинал
    }
  ],
  "organization": string,                // ведущая орг. автора/проекта (если указана)
  "organization_type": string,           // University / Institute / NGO / Company / Gov / Consortium / Other
  "pub_type": string,                    // journal / conference / report / thesis / book / preprint / other
  "journal_or_source": string,           // название журнала/сборника/издателя
  "volume_pages": string,                // том/выпуск/страницы или "online ahead of print"
  "doi": string,                         // canonical https://doi.org/… (если нет DOI — "MISSING")
  "url": string,                         // ссылка на страницу публикации или DOI-URL
  "date_published": string,              // YYYY-MM-DD (если известен только год — YYYY-01-01)
  "language_source": string,             // язык исходного текста: ru/en/…
  "region_or_context": string,           // географический фокус исследования (страна/регион) или "MISSING"

  "central_insight": string,             // 1–2 предложения: главный смысл
  "rationale": string,                   // 1–3 предложения: зачем и про что кейс
  "theoretical_framework": string,       // 1–4 пункта или короткий абзац
  "methodology": {                       // коротко + структура
    "summary": string,                   // 1–3 предложения
    "participants": string,              // кто и сколько (если есть)
    "methods": string,                   // интервью/эксперимент/анализ и т.п.
    "instruments": string,               // дневники/анкеты/сенсоры/корпуса и т.п. или "MISSING"
    "geography": string,                 // где проводилось
    "sample_size": string                // числовой обзор (N=…), если нет — "MISSING"
  },
  "key_findings": [string, string, string], // 3–6 маркеров (краткие выводы, по 1 строке)
  "quote": string,                           // дословная цитата ≤ 40 слов с кавычками
  "questions_lenses": [string],              // 3–6 исследовательских вопросов/линз
  "potential_application": string,           // 1–3 строки: как это применить на практике
  "impact_forecast": string,                 // горизонты 2–3/3–5/long-term — одним абзацем
  "risks_limitations": [string],             // 3–5 ограничений/рисков
  "tags": [string],                          // 5–12 тегов-однословников

  "on_website": boolean,                 // размещено ли уже на вашем сайте
  "provenance": {
    "pages": [integer],                  // страницы, где найдено каждое ключевое поле (если можешь определить)
    "notes": string                      // любые оговорки по извлечению
  },
  "missing_fields": [string]             // заполни автоматически, если где-то "MISSING"
}

Нормализация и проверка качества
7) Нормализуй:
– DOI: приведи к https://doi.org/… (без пробелов/префиксов).
– Дату: ISO YYYY-MM-DD.
– Имена: если оригинал кириллицей — добавь латинскую транслитерацию (при её отсутствии — аккуратная машинная транслитерация).
– Оставляй исходный регистр в цитатах.
8) В key_findings не дублируй central_insight. Удаляй повторяющиеся формулировки.
9) Если поле не найдено, поставь "MISSING" и перечисли его в missing_fields. Не оставляй пустых значений.
10) Проверка длины: title_short ≤ 60 символов, quote ≤ 40 слов.

Форматы вывода (сначала JSON, затем таблица, затем TSV)
11) Сначала напечатай JSON record (валидный, без комментариев).
12) Затем выведи Markdown-таблицу с этими колонками и в таком порядке (ровно 16 штук):

| title_short | authors | pub_type | date_published | doi | url | central_insight | key_findings | methodology | theoretical_framework | potential_application | impact_forecast | risks_limitations | tags | journal_or_source | region_or_context |

— где:

authors = список фамилия+имя через запятую, авторы через ;

key_findings, risks_limitations, tags — объединяй в одну строку через •

methodology = краткий one-liner: участники; методы; география; N=…

Третьим блоком выведи сырой TSV (одна строка соответствующих 16 полей, разделитель — таб \\t, без экранирования).

Никаких пояснений, только три блока вывода подряд.

---
**Входной текст для анализа:**
${text}
---`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2,
                max_tokens: 4000
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('OpenAI API error:', response.status, errorBody);
            throw new Error(`OpenAI API error: ${response.status} - ${errorBody}`);
        }

        const data = await response.json();
        const aiResponseContent = data.choices[0].message.content;

        // Извлекаем JSON из ответа - пробуем разные форматы
        let extractedJson = {};
        
        // Пробуем найти JSON в разных форматах
        let jsonMatch = aiResponseContent.match(/```json\\n([\\s\\S]*?)\\n```/);
        if (!jsonMatch) {
            jsonMatch = aiResponseContent.match(/```\\n([\\s\\S]*?)\\n```/);
        }
        if (!jsonMatch) {
            // Ищем JSON без блоков кода
            const jsonStart = aiResponseContent.indexOf('{');
            const jsonEnd = aiResponseContent.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                jsonMatch = [null, aiResponseContent.substring(jsonStart, jsonEnd + 1)];
            }
        }
        
        if (jsonMatch && jsonMatch[1]) {
            try {
                extractedJson = JSON.parse(jsonMatch[1]);
                console.log('Successfully parsed JSON from AI response');
            } catch (jsonError) {
                console.error('Failed to parse JSON from AI response:', jsonError);
                console.error('Raw JSON string:', jsonMatch[1]);
                // Fallback к простой структуре
                extractedJson = {
                    title_original: 'Failed to parse AI response',
                    title_short: 'Parse Error',
                    authors: [{ name_original: 'Unknown', name_latin: 'Unknown' }],
                    central_insight: 'Ошибка при обработке AI',
                    missing_fields: ['ai_processing_failed']
                };
            }
        } else {
            console.error('No JSON found in AI response');
            console.error('AI response content:', aiResponseContent.substring(0, 500));
            extractedJson = {
                title_original: 'No JSON in AI response',
                title_short: 'No JSON',
                authors: [{ name_original: 'Unknown', name_latin: 'Unknown' }],
                central_insight: 'AI не вернул структурированный ответ',
                missing_fields: ['ai_no_json']
            };
        }

        console.log('AI processing completed, extracted data:', JSON.stringify(extractedJson, null, 2));
        return extractedJson;

    } catch (error) {
        console.error('Error in processWithAI:', error);
        
        // Fallback к простой структуре при ошибке
        return {
            title_original: 'AI Processing Failed',
            title_short: 'AI Error',
            authors: [{ name_original: 'Unknown', name_latin: 'Unknown' }],
            organization: 'MISSING',
            organization_type: 'Other',
            pub_type: 'other',
            journal_or_source: 'MISSING',
            volume_pages: 'MISSING',
            doi: 'MISSING',
            url: 'MISSING',
            date_published: new Date().toISOString().split('T')[0],
            language_source: 'en',
            region_or_context: 'MISSING',
            central_insight: 'Ошибка при обработке AI: ' + error.message,
            rationale: 'AI обработка не удалась',
            theoretical_framework: 'MISSING',
            methodology: {
                summary: 'MISSING',
                participants: 'MISSING',
                methods: 'MISSING',
                instruments: 'MISSING',
                geography: 'MISSING',
                sample_size: 'MISSING'
            },
            key_findings: ['Ошибка AI обработки'],
            quote: 'MISSING',
            questions_lenses: ['Ошибка AI'],
            potential_application: 'MISSING',
            impact_forecast: 'MISSING',
            risks_limitations: ['AI processing failed'],
            tags: ['error', 'ai-failed'],
            on_website: false,
            provenance: {
                pages: [1],
                notes: 'AI processing failed: ' + error.message
            },
            missing_fields: ['ai_error']
        };
    }
}

// Функция для сохранения в DynamoDB
async function saveToDynamoDB(fileId, extractedText, aiAnalysis, notionPageId = null) {
    try {
        const item = {
            fileId: fileId,
            extractedText: extractedText,
            aiAnalysis: aiAnalysis,
            notionPageId: notionPageId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await dynamodb.put({
            TableName: DYNAMODB_TABLE,
            Item: item
        }).promise();

        console.log('Data saved to DynamoDB for fileId:', fileId);
        return true;
    } catch (error) {
        console.error('Error saving to DynamoDB:', error);
        throw error;
    }
}

// Обработчик для S3 триггера
async function handleS3Trigger(event) {
    console.log('S3 trigger event:', JSON.stringify(event, null, 2));
    
    try {
        for (const record of event.Records) {
            if (record.eventName.startsWith('ObjectCreated')) {
                const bucket = record.s3.bucket.name;
                const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
                
                console.log('Processing new file:', key);
                
                // Извлекаем fileId из ключа
                const fileId = key.split('/').pop().replace('.pdf', '');
                
                // 1. Извлекаем текст с помощью Textract
                const textractResult = await extractTextWithTextract(key);
                
                if (!textractResult.success) {
                    throw new Error('Textract extraction failed');
                }
                
                // 2. Обрабатываем текст с помощью AI
                const aiAnalysis = await processWithAI(textractResult.text, fileId);
                
                // 3. Создаем страницу в Notion
                let notionPageId = null;
                try {
                    const notionResponse = await notion.pages.create({
                        parent: { database_id: NOTION_DATABASE_ID },
                        properties: {
                            "TitleOriginal": { 
                                title: [{ text: { content: aiAnalysis.title_original || "Untitled Research" } }] 
                            },
                            "Authors": { 
                                rich_text: [{ text: { content: (aiAnalysis.authors || []).map(a => a.name_original).join(', ') } }] 
                            },
                            "Organization": { 
                                rich_text: [{ text: { content: aiAnalysis.organization || "" } }] 
                            },
                            "DatePublished": { 
                                date: aiAnalysis.date_published ? { start: aiAnalysis.date_published } : null 
                            },
                            "DOI": { 
                                rich_text: [{ text: { content: aiAnalysis.doi && aiAnalysis.doi !== 'MISSING' ? aiAnalysis.doi : "MISSING" } }] 
                            },
                            "URL": { 
                                url: aiAnalysis.url !== 'MISSING' ? aiAnalysis.url : null 
                            },
                            "CentralInsight": { 
                                rich_text: [{ text: { content: truncateText(aiAnalysis.central_insight, 1900) || "" } }] 
                            },
                            "Tags": { 
                                multi_select: (aiAnalysis.tags || []).map(tag => ({ name: tag })) 
                            },
                            "DetailedContent": { 
                                rich_text: [{ text: { content: truncateText(textractResult.text, 1900) || "" } }] 
                            },
                            "File": { 
                                files: [{ 
                                    name: `${fileId}.pdf`,
                                    external: { url: `https://${S3_BUCKET}.s3.amazonaws.com/${key}` }
                                }]
                            }
                        },
                    });
                    
                    notionPageId = notionResponse.id;
                    console.log('Notion page created:', notionPageId);
                    
                } catch (notionError) {
                    console.error('Failed to create Notion page:', notionError);
                    // Продолжаем выполнение даже если Notion не удался
                }
                
                // 4. Сохраняем все в DynamoDB
                await saveToDynamoDB(fileId, textractResult.text, aiAnalysis, notionPageId);
                
                console.log('Processing completed successfully for:', fileId);
            }
        }
        
        return { statusCode: 200, body: 'Processing completed' };
        
    } catch (error) {
        console.error('Error in handleS3Trigger:', error);
        throw error;
    }
}

async function handleUpload(event) {
    try {
        const body = JSON.parse(event.body);
        const { filename } = body;
        
        console.log('Generating presigned URL for:', filename);
        
        const { uploadUrl, fileId, key } = await generatePresignedUrl(filename);
        
        return {
            statusCode: 200,
            headers: getCorsHeaders(),
            body: JSON.stringify({
                message: 'Upload URL generated successfully',
                uploadUrl: uploadUrl,
                fileId: fileId,
                key: key
            })
        };
    } catch (error) {
        console.error('Error in handleUpload:', error);
        return {
            statusCode: 500,
            headers: getCorsHeaders(),
            body: JSON.stringify({ error: error.message })
        };
    }
}

async function handleProcess(event) {
    try {
        const fileId = event.path.split('/').pop();
        console.log('Manual processing triggered for file:', fileId);
        
        // Проверяем, есть ли уже данные в DynamoDB
        try {
            const existingData = await dynamodb.get({
                TableName: DYNAMODB_TABLE,
                Key: { fileId: fileId }
            }).promise();
            
            if (existingData.Item) {
                console.log('Data already exists in DynamoDB for:', fileId);
                return {
                    statusCode: 200,
                    headers: getCorsHeaders(),
                    body: JSON.stringify({
                        message: 'File already processed',
                        fileId: fileId,
                        notionPageId: existingData.Item.notionPageId,
                        extractedData: existingData.Item.aiAnalysis
                    })
                };
            }
        } catch (dbError) {
            console.log('No existing data found, proceeding with processing');
        }
        
        // Если данных нет, запускаем обработку
        const key = `uploads/${fileId}.pdf`;
        const textractResult = await extractTextWithTextract(key);
        
        if (!textractResult.success) {
            throw new Error('Textract extraction failed');
        }
        
        const aiAnalysis = await processWithAI(textractResult.text, fileId);
        
        // Создаем страницу в Notion
        let notionPageId = null;
        try {
            const notionResponse = await notion.pages.create({
                parent: { database_id: NOTION_DATABASE_ID },
                properties: {
                    "TitleOriginal": { 
                        title: [{ text: { content: aiAnalysis.title_original || "Untitled Research" } }] 
                    },
                    "Authors": { 
                        rich_text: [{ text: { content: (aiAnalysis.authors || []).map(a => a.name_original).join(', ') } }] 
                    },
                    "Organization": { 
                        rich_text: [{ text: { content: aiAnalysis.organization || "" } }] 
                    },
                    "DatePublished": { 
                        date: aiAnalysis.date_published ? { start: aiAnalysis.date_published } : null 
                    },
                    "DOI": { 
                        rich_text: [{ text: { content: aiAnalysis.doi && aiAnalysis.doi !== 'MISSING' ? aiAnalysis.doi : "MISSING" } }] 
                    },
                    "URL": { 
                        url: aiAnalysis.url !== 'MISSING' ? aiAnalysis.url : null 
                    },
                    "CentralInsight": { 
                        rich_text: [{ text: { content: truncateText(aiAnalysis.central_insight, 1900) || "" } }] 
                    },
                    "Tags": { 
                        multi_select: (aiAnalysis.tags || []).map(tag => ({ name: tag })) 
                    },
                    "DetailedContent": { 
                        rich_text: [{ text: { content: truncateText(textractResult.text, 1900) || "" } }] 
                    },
                    "File": { 
                        files: [{ 
                            name: `${fileId}.pdf`,
                            external: { url: `https://${S3_BUCKET}.s3.amazonaws.com/${key}` }
                        }]
                    }
                },
            });
            
            notionPageId = notionResponse.id;
            console.log('Notion page created:', notionPageId);
            
        } catch (notionError) {
            console.error('Failed to create Notion page:', notionError);
        }
        
        // Сохраняем в DynamoDB
        await saveToDynamoDB(fileId, textractResult.text, aiAnalysis, notionPageId);
        
        return {
            statusCode: 200,
            headers: getCorsHeaders(),
            body: JSON.stringify({
                message: 'PDF processed successfully',
                fileId: fileId,
                notionPageId: notionPageId,
                extractedData: aiAnalysis
            })
        };
        
    } catch (error) {
        console.error('Error in handleProcess:', error);
        return {
            statusCode: 500,
            headers: getCorsHeaders(),
            body: JSON.stringify({ error: error.message })
        };
    }
}

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    try {
        // Проверяем, это S3 триггер или API Gateway
        if (event.Records && event.Records[0] && event.Records[0].eventSource === 'aws:s3') {
            return await handleS3Trigger(event);
        }
        
        // API Gateway события
        const path = event.path;
        const httpMethod = event.httpMethod;
        
        if (httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: getCorsHeaders(),
                body: JSON.stringify({ message: 'CORS preflight' })
            };
        }
        
        if (path === '/upload') {
            if (httpMethod === 'POST') {
                return handleUpload(event);
            }
        } else if (path.startsWith('/process/')) {
            if (httpMethod === 'POST') {
                return handleProcess(event);
            }
        }
        
        return {
            statusCode: 404,
            headers: getCorsHeaders(),
            body: JSON.stringify({ message: 'Not found' })
        };
        
    } catch (error) {
        console.error('Error in handler:', error);
        return {
            statusCode: 500,
            headers: getCorsHeaders(),
            body: JSON.stringify({ error: error.message })
        };
    }
};