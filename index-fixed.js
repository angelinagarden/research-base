const { Client } = require('@notionhq/client');
const AWS = require('aws-sdk');

// Инициализация AWS сервисов
const s3 = new AWS.S3();
const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const S3_BUCKET = process.env.S3_BUCKET;

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

// Простая функция для обработки PDF (заглушка)
async function processPDF(fileId) {
    // В реальной реализации здесь будет Textract и AI обработка
    // Пока возвращаем заглушку
    return {
        success: true,
        extractedText: "Это тестовый текст для демонстрации работы системы. В реальной реализации здесь будет извлеченный из PDF текст, обработанный AI.",
        aiAnalysis: {
            title_original: "Тестовая научная статья",
            title_short: "Тестовая статья",
            authors: [{ name_original: "Исследователь", name_latin: "Researcher" }],
            organization: "Тестовый институт",
            organization_type: "Institute",
            pub_type: "journal",
            journal_or_source: "Тестовый журнал",
            volume_pages: "Том 1, стр. 1-10",
            doi: "MISSING",
            url: "https://example.com",
            date_published: "2024-01-01",
            language_source: "ru",
            region_or_context: "Глобальный",
            central_insight: "Это тестовая статья для демонстрации работы системы",
            rationale: "Цель - показать как работает система обработки PDF",
            theoretical_framework: "Тестовая теоретическая база",
            methodology: {
                summary: "Тестовый метод исследования",
                participants: "N=1",
                methods: "Анализ документов",
                instruments: "Система тестирования",
                geography: "Глобально",
                sample_size: "N=1"
            },
            key_findings: [
                "Система работает корректно",
                "AI обработка функционирует",
                "Интеграция с Notion успешна"
            ],
            quote: "Это тестовая цитата из документа",
            questions_lenses: ["Как работает система?"],
            potential_application: "Демонстрация возможностей",
            impact_forecast: "Положительное влияние на производительность",
            risks_limitations: ["Требует дополнительного тестирования"],
            tags: ["тест", "демо", "система"],
            on_website: false,
            provenance: {
                pages: [1],
                notes: "Тестовые данные"
            },
            missing_fields: ["doi"]
        }
    };
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
        console.log('Processing file:', fileId);
        
        const result = await processPDF(fileId);
        
        if (result.success) {
            // Автоматически создаем страницу в Notion с базовыми полями
            try {
                const notionResponse = await notion.pages.create({
                    parent: { database_id: NOTION_DATABASE_ID },
                    properties: {
                        "Title": { 
                            title: [{ text: { content: result.aiAnalysis.title_original || "Untitled Research" } }] 
                        },
                        "Authors": { 
                            rich_text: [{ text: { content: (result.aiAnalysis.authors || []).map(a => a.name_original).join(', ') } }] 
                        },
                        "Organization": { 
                            rich_text: [{ text: { content: result.aiAnalysis.organization || "" } }] 
                        },
                        "Date Published": { 
                            date: result.aiAnalysis.date_published ? { start: result.aiAnalysis.date_published } : null 
                        },
                        "DOI": { 
                            rich_text: [{ text: { content: result.aiAnalysis.doi !== 'MISSING' ? result.aiAnalysis.doi : "" } }] 
                        },
                        "URL": { 
                            url: result.aiAnalysis.url !== 'MISSING' ? result.aiAnalysis.url : null 
                        },
                        "Central Insight": { 
                            rich_text: [{ text: { content: truncateText(result.aiAnalysis.central_insight, 1900) || "" } }] 
                        },
                        "Key Findings": { 
                            rich_text: [{ text: { content: truncateText((result.aiAnalysis.key_findings || []).join(' • '), 1900) || "" } }] 
                        },
                        "Tags": { 
                            multi_select: (result.aiAnalysis.tags || []).map(tag => ({ name: tag })) 
                        },
                        "Content": { 
                            rich_text: [{ text: { content: truncateText(result.extractedText, 1900) || "" } }] 
                        },
                        "File URL": { 
                            url: `https://${S3_BUCKET}.s3.amazonaws.com/uploads/${fileId}.pdf` 
                        }
                    },
                });
                
                console.log('Notion page created successfully:', notionResponse.id);
                
                return {
                    statusCode: 200,
                    headers: getCorsHeaders(),
                    body: JSON.stringify({
                        message: 'PDF processed and Notion page created successfully',
                        fileId: fileId,
                        notionPageId: notionResponse.id,
                        extractedData: result.aiAnalysis
                    })
                };
                
            } catch (notionError) {
                console.error('Failed to create Notion page:', notionError);
                return {
                    statusCode: 500,
                    headers: getCorsHeaders(),
                    body: JSON.stringify({ error: 'Failed to create Notion page: ' + notionError.message })
                };
            }
        } else {
            return {
                statusCode: 500,
                headers: getCorsHeaders(),
                body: JSON.stringify({ error: 'Failed to process PDF' })
            };
        }
    } catch (error) {
        console.error('Error in handleProcess:', error);
        return {
            statusCode: 500,
            headers: getCorsHeaders(),
            body: JSON.stringify({ error: error.message })
        };
    }
}

async function handleNotionCreate(event) {
    try {
        const body = JSON.parse(event.body);
        console.log('Creating Notion page with data:', JSON.stringify(body, null, 2));
        
        const notionResponse = await notion.pages.create({
            parent: { database_id: NOTION_DATABASE_ID },
            properties: {
                "Title": { 
                    title: [{ text: { content: body.title_original || "Untitled Research" } }] 
                },
                "Authors": { 
                    rich_text: [{ text: { content: (body.authors || []).map(a => a.name_original).join(', ') } }] 
                },
                "Organization": { 
                    rich_text: [{ text: { content: body.organization || "" } }] 
                },
                "Date Published": { 
                    date: body.date_published ? { start: body.date_published } : null 
                },
                "DOI": { 
                    rich_text: [{ text: { content: body.doi !== 'MISSING' ? body.doi : "" } }] 
                },
                "URL": { 
                    url: body.url !== 'MISSING' ? body.url : null 
                },
                "Central Insight": { 
                    rich_text: [{ text: { content: truncateText(body.central_insight, 1900) || "" } }] 
                },
                "Key Findings": { 
                    rich_text: [{ text: { content: truncateText((body.key_findings || []).join(' • '), 1900) || "" } }] 
                },
                "Tags": { 
                    multi_select: (body.tags || []).map(tag => ({ name: tag })) 
                },
                "Content": { 
                    rich_text: [{ text: { content: truncateText(body.content, 1900) || "" } }] 
                },
                "File URL": { 
                    url: body.fileUrl || "" 
                }
            },
        });
        
        console.log('Notion page created successfully:', notionResponse.id);
        
        return {
            statusCode: 200,
            headers: getCorsHeaders(),
            body: JSON.stringify({
                message: 'Notion page created successfully',
                pageId: notionResponse.id
            })
        };
    } catch (error) {
        console.error('Error in handleNotionCreate:', error);
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
        } else if (path === '/notion/create') {
            if (httpMethod === 'POST') {
                return handleNotionCreate(event);
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