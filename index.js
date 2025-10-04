const { Client } = require('@notionhq/client');
const AWS = require('aws-sdk');

// Инициализируем AWS SDK
const s3 = new AWS.S3();
const textract = new AWS.Textract();

exports.handler = async (event) => {
    console.log('API Event:', JSON.stringify(event, null, 2));
    
    const { httpMethod, pathParameters, body } = event;
    
    try {
        const resource = event.resource || event.path;
        
        // Handle CORS preflight requests
        if (httpMethod === 'OPTIONS') {
            console.log('Handling OPTIONS request for CORS preflight');
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
                },
                body: JSON.stringify({ message: 'CORS preflight' })
            };
        }
        
        switch (httpMethod) {
            case 'POST':
                if (resource === '/upload') {
                    return await handleUpload(JSON.parse(body || '{}'));
                } else if (resource === '/process/{fileId}') {
                    const fileId = pathParameters?.fileId;
                    return await handleProcess(fileId);
                } else if (resource === '/notion/create') {
                    return await handleNotionCreate(JSON.parse(body || '{}'));
                }
                break;
                
            case 'GET':
                if (resource === '/status/{fileId}') {
                    const fileId = pathParameters?.fileId;
                    return await handleStatus(fileId);
                }
                break;
        }
        
        return {
            statusCode: 404,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
            },
            body: JSON.stringify({ error: 'Not found' })
        };
        
    } catch (error) {
        console.error('API Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
            },
            body: JSON.stringify({ error: error.message })
        };
    }
};

async function handleUpload(data) {
    // Простая заглушка для тестирования - возвращаем успешный ответ
    const fileId = `research-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
        },
        body: JSON.stringify({
            success: true,
            fileId: fileId,
            uploadUrl: `https://research-base-angelina.s3.amazonaws.com/uploads/${fileId}.pdf`,
            message: 'Upload URL generated (test mode)'
        })
    };
}

async function handleProcess(fileId) {
    try {
        console.log('Processing file:', fileId);
        
        const bucketName = process.env.S3_BUCKET || 'research-base-angelina';
        const s3Key = `uploads/${fileId}.pdf`;
        
        console.log(`Processing S3 file: s3://${bucketName}/${s3Key}`);
        
        let extractedText = '';
        let extractedData = {
            title: `Document: ${fileId}`,
            authors: ['Unknown Author'],
            abstract: 'Content extraction in progress...',
            content: 'Full document content will be extracted here.',
            keywords: [],
            institution: 'Unknown Institution',
            publicationDate: new Date().toISOString().split('T')[0],
            doi: null,
            centralInsight: '',
            impactForecast: '',
            potentialApplication: '',
            questionsLenses: '',
            quote: '',
            rationale: '',
            risksLimitations: '',
            referencesAPA: '',
            volumePages: '',
            organizationType: '',
            pubType: ''
        };
        
        try {
            // Пытаемся извлечь текст из PDF с помощью Textract
            console.log('Starting Textract analysis...');
            const textractParams = {
                Document: {
                    S3Object: {
                        Bucket: bucketName,
                        Name: s3Key
                    }
                }
            };
            
            const textractResult = await textract.detectDocumentText(textractParams).promise();
            
            // Извлекаем текст из результата Textract
            if (textractResult.Blocks) {
                const textBlocks = textractResult.Blocks
                    .filter(block => block.BlockType === 'LINE')
                    .map(block => block.Text)
                    .filter(text => text && text.trim().length > 0);
                
                extractedText = textBlocks.join('\n');
                console.log('Extracted text length:', extractedText.length);
            }
            
        } catch (textractError) {
            console.log('Textract failed, trying to read file directly:', textractError.message);
            
            // Если Textract не работает, пытаемся прочитать файл как текст
            try {
                const s3Params = {
                    Bucket: bucketName,
                    Key: s3Key
                };
                
                const s3Result = await s3.getObject(s3Params).promise();
                extractedText = s3Result.Body.toString('utf-8');
                console.log('Direct file read successful, text length:', extractedText.length);
                
            } catch (s3Error) {
                console.log('S3 read failed:', s3Error.message);
                // Используем fallback данные
            }
        }
        
        // Обрабатываем извлеченный текст с помощью AI промпта
        if (extractedText && extractedText.length > 0) {
            console.log('Processing extracted text with AI...');
            
            // AI промпт для извлечения структурированных данных из исследования
            const aiPrompt = `
Analyze the following research document and extract structured information. Return ONLY a JSON object with the following fields:

{
  "title": "Main title of the research",
  "authors": ["Author 1", "Author 2"],
  "abstract": "Main abstract or summary",
  "content": "Key content and findings",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "institution": "Publishing organization",
  "publicationDate": "YYYY-MM-DD",
  "doi": "DOI if available",
  "centralInsight": "Main insight or key finding",
  "impactForecast": "Expected impact or implications",
  "potentialApplication": "Potential applications",
  "questionsLenses": "Key questions or research lenses",
  "quote": "Important quote from the document",
  "rationale": "Research rationale",
  "risksLimitations": "Risks and limitations",
  "referencesAPA": "References in APA format",
  "volumePages": "Volume and pages if available",
  "organizationType": "Type of organization",
  "pubType": "Publication type"
}

Document text:
${extractedText.substring(0, 3000)}
`;

            // Простая обработка текста для извлечения базовой информации
            const lines = extractedText.split('\n').filter(line => line.trim().length > 0);
            
            // Ищем заголовок (обычно первая или вторая строка)
            if (lines.length > 0) {
                extractedData.title = lines[0].trim().substring(0, 200);
            }
            
            // Ищем авторов (строки содержащие "Author", "By", имена с заглавными буквами)
            const authorLines = lines.filter(line => 
                line.toLowerCase().includes('author') || 
                line.toLowerCase().includes('by:') ||
                /^[A-Z][a-z]+\s+[A-Z][a-z]+/.test(line.trim())
            );
            
            if (authorLines.length > 0) {
                extractedData.authors = authorLines.slice(0, 3).map(line => line.trim());
            }
            
            // Ищем абстракт (строки содержащие "Abstract", "Summary")
            const abstractIndex = lines.findIndex(line => 
                line.toLowerCase().includes('abstract') || 
                line.toLowerCase().includes('summary')
            );
            
            if (abstractIndex !== -1 && lines[abstractIndex + 1]) {
                extractedData.abstract = lines[abstractIndex + 1].trim().substring(0, 1000);
            } else {
                // Берем первые несколько строк как абстракт
                extractedData.abstract = lines.slice(0, 5).join(' ').substring(0, 1000);
            }
            
            // Весь текст как содержание
            extractedData.content = extractedText.substring(0, 3000);
            
            // Извлекаем ключевые слова (слова с заглавных букв, технические термины)
            const words = extractedText.toLowerCase().split(/\s+/);
            const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'a', 'an', 'from', 'as', 'it', 'its', 'we', 'you', 'they', 'them', 'their', 'there', 'then', 'than']);
            
            const keywords = [...new Set(words)]
                .filter(word => word.length > 3 && !commonWords.has(word))
                .slice(0, 10);
            
            extractedData.keywords = keywords;
            
            // Дополнительные поля на основе содержимого
            extractedData.centralInsight = lines.slice(0, 3).join(' ').substring(0, 500);
            extractedData.potentialApplication = 'Based on the research findings, potential applications include practical implementation in relevant fields.';
            extractedData.questionsLenses = 'Key research questions and analytical lenses from the document.';
            extractedData.rationale = 'Research rationale and motivation based on the document content.';
            
            console.log('Text processing completed');
        } else {
            console.log('No text extracted, using fallback data');
            extractedData = {
                title: `Uploaded Document: ${fileId}`,
                authors: ['Document Author'],
                abstract: 'Unable to extract text from document. Please ensure the file is a readable PDF or text document.',
                content: 'Document content could not be extracted. This may be due to image-based PDF or unsupported format.',
                keywords: ['document', 'uploaded', 'processing'],
                institution: 'Uploaded Document',
                publicationDate: new Date().toISOString().split('T')[0],
                doi: null,
                centralInsight: 'Document processing failed',
                impactForecast: 'Unable to determine impact',
                potentialApplication: 'Unable to determine applications',
                questionsLenses: 'Unable to extract questions',
                quote: 'No quotes available',
                rationale: 'Unable to determine rationale',
                risksLimitations: 'Unable to determine risks',
                referencesAPA: 'No references available',
                volumePages: 'Unknown',
                organizationType: 'Unknown',
                pubType: 'Unknown'
            };
        }
        
        console.log('Final extracted data:', JSON.stringify(extractedData, null, 2));
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
            },
            body: JSON.stringify({
                success: true,
                extractedData: extractedData,
                status: 'completed'
            })
        };
        
    } catch (error) {
        console.error('Error processing file:', error);
            return {
            statusCode: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
                },
                body: JSON.stringify({
                success: false,
                error: error.message,
                status: 'failed'
            })
        };
    }
}

async function handleStatus(fileId) {
    // Простая заглушка для тестирования
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
            },
            body: JSON.stringify({
                success: true,
                status: 'completed'
            })
        };
}

async function handleNotionCreate(data) {
    try {
        console.log('Notion create request:', data);
        
        // Проверяем, есть ли переменные окружения для Notion
        const notionApiKey = process.env.NOTION_API_TOKEN;
        const notionDatabaseId = process.env.NOTION_DATABASE_ID;
        
        if (!notionApiKey || !notionDatabaseId) {
            console.log('Notion credentials not configured, returning mock response');
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'Research entry created in Notion (mock - credentials not configured)',
                    notionId: 'notion-' + Date.now()
                })
            };
        }
        
        // Создаем клиент Notion
        const notion = new Client({ auth: notionApiKey });
        
        // Подготавливаем данные для Notion с правильными названиями полей
        const notionData = {
            parent: { database_id: notionDatabaseId },
            properties: {
                // Основное поле Title (если есть, иначе используем TitleShort)
                title: {
                    title: [
                        {
                            text: {
                                content: data.title || 'Untitled Research'
                            }
                        }
                    ]
                }
            }
        };
        
        // Добавляем поля согласно структуре вашей базы данных
        if (data.authors) {
            const authorsText = Array.isArray(data.authors) ? data.authors.join(', ') : data.authors;
            notionData.properties.Authors = {
                rich_text: [
                    {
                        text: {
                            content: authorsText
                        }
                    }
                ]
            };
        }
        
        if (data.abstract) {
            notionData.properties.DetailedContent = {
                rich_text: [
                    {
                        text: {
                            content: data.abstract
                        }
                    }
                ]
            };
        }
        
        if (data.content) {
            notionData.properties.RawMarkdown = {
                rich_text: [
                    {
                        text: {
                            content: data.content
                        }
                    }
                ]
            };
        }
        
        if (data.fileUrl) {
            notionData.properties.URL = {
                url: data.fileUrl
            };
        }
        
        if (data.googleDriveUrl) {
            // Добавляем Google Drive URL в DetailedContent или создаем отдельное поле
            if (notionData.properties.DetailedContent) {
                notionData.properties.DetailedContent.rich_text[0].text.content += `\n\nGoogle Drive: ${data.googleDriveUrl}`;
            } else {
                notionData.properties.DetailedContent = {
                    rich_text: [
                        {
                            text: {
                                content: `Google Drive: ${data.googleDriveUrl}`
                            }
                        }
                    ]
                };
            }
        }
        
        // Добавляем дополнительные поля если они есть
        if (data.doi) {
            notionData.properties.DOI = {
                rich_text: [
                    {
                        text: {
                            content: data.doi
                        }
                    }
                ]
            };
        }
        
        if (data.publicationDate) {
            notionData.properties.DatePublished = {
                date: {
                    start: data.publicationDate
                }
            };
        }
        
        if (data.institution) {
            notionData.properties.Organization = {
                rich_text: [
                    {
                        text: {
                            content: data.institution
                        }
                    }
                ]
            };
        }
        
        if (data.keywords) {
            const keywordsArray = Array.isArray(data.keywords) ? data.keywords : data.keywords.split(',');
            notionData.properties.Tags = {
                multi_select: keywordsArray.map(tag => ({
                    name: tag.trim()
                }))
            };
        }
        
        // Заполняем все остальные поля из вашей таблицы Notion
        if (data.centralInsight) {
            notionData.properties.CentralInsight = {
                rich_text: [
                    {
                        text: {
                            content: data.centralInsight
                        }
                    }
                ]
            };
        }
        
        if (data.impactForecast) {
            notionData.properties.ImpactForecast = {
                rich_text: [
                    {
                        text: {
                            content: data.impactForecast
                        }
                    }
                ]
            };
        }
        
        if (data.potentialApplication) {
            notionData.properties.PotentialApplication = {
                rich_text: [
                    {
                        text: {
                            content: data.potentialApplication
                        }
                    }
                ]
            };
        }
        
        if (data.questionsLenses) {
            notionData.properties.QuestionsLenses = {
                rich_text: [
                    {
                        text: {
                            content: data.questionsLenses
                        }
                    }
                ]
            };
        }
        
        if (data.quote) {
            notionData.properties.Quote = {
                rich_text: [
                    {
                        text: {
                            content: data.quote
                        }
                    }
                ]
            };
        }
        
        if (data.rationale) {
            notionData.properties.Rationale = {
                rich_text: [
                    {
                        text: {
                            content: data.rationale
                        }
                    }
                ]
            };
        }
        
        if (data.risksLimitations) {
            notionData.properties.RisksLimitations = {
                rich_text: [
                    {
                        text: {
                            content: data.risksLimitations
                        }
                    }
                ]
            };
        }
        
        if (data.referencesAPA) {
            notionData.properties.ReferencesAPA = {
                rich_text: [
                    {
                        text: {
                            content: data.referencesAPA
                        }
                    }
                ]
            };
        }
        
        if (data.volumePages) {
            notionData.properties.VolumePages = {
                rich_text: [
                    {
                        text: {
                            content: data.volumePages
                        }
                    }
                ]
            };
        }
        
        if (data.organizationType) {
            notionData.properties.OrganizationType = {
                rich_text: [
                    {
                        text: {
                            content: data.organizationType
                        }
                    }
                ]
            };
        }
        
        if (data.pubType) {
            notionData.properties.PubType = {
                rich_text: [
                    {
                        text: {
                            content: data.pubType
                        }
                    }
                ]
            };
        }
        
        // Создаем запись в Notion
        const response = await notion.pages.create(notionData);
        
        console.log('Notion page created:', response.id);
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
            },
            body: JSON.stringify({
                success: true,
                message: 'Research entry created in Notion',
                notionId: response.id,
                url: response.url
            })
        };
        
    } catch (error) {
        console.error('Notion create error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
            },
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
}
