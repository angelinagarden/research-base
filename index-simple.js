const { Client } = require('@notionhq/client');

exports.handler = async (event) => {
    console.log('API Event:', JSON.stringify(event, null, 2));
    
    const { httpMethod, pathParameters, body } = event;
    const fileId = pathParameters ? pathParameters.fileId : null;
    let parsedBody;
    try {
        parsedBody = body ? JSON.parse(body) : {};
    } catch (e) {
        console.error('Failed to parse body:', e);
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
            },
            body: JSON.stringify({ message: 'Invalid JSON body' })
        };
    }

    switch (event.resource) {
        case '/upload':
            if (httpMethod === 'OPTIONS') {
                return handleOptions();
            }
            return handleUpload(parsedBody);
        case '/process/{fileId}':
            if (httpMethod === 'OPTIONS') {
                return handleOptions();
            }
            return handleProcess(fileId);
        case '/status/{fileId}':
            if (httpMethod === 'OPTIONS') {
                return handleOptions();
            }
            return handleStatus(fileId);
        case '/notion/create':
            if (httpMethod === 'OPTIONS') {
                return handleOptions();
            }
            return handleNotionCreate(parsedBody);
        case '/notion/query':
            if (httpMethod === 'OPTIONS') {
                return handleOptions();
            }
            return handleNotionQuery();
        case '/health':
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
                },
                body: JSON.stringify({ status: 'ok', message: 'API is healthy' })
            };
        default:
            return {
                statusCode: 404,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
                },
                body: JSON.stringify({ message: 'Not Found' })
            };
    }
};

function handleOptions() {
    console.log('Handling OPTIONS request for CORS preflight');
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: 'CORS preflight successful' })
    };
}

async function handleUpload(data) {
    console.log('Upload request:', data);
    // Для демонстрации возвращаем заглушку
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
        },
        body: JSON.stringify({
            uploadUrl: 'https://example.com/mock-upload-url',
            fileId: 'research-' + Date.now(),
            message: 'Upload URL generated (test mode)'
        })
    };
}

async function handleProcess(fileId) {
    try {
        console.log('Processing file:', fileId);
        
        // Создаем реалистичные данные на основе содержимого файла
        // В реальном приложении здесь был бы вызов AWS Textract
        
        // Имитируем извлечение данных из PDF "WEF_Rethinking_Media_Literacy_2025.pdf"
        const extractedData = {
            title: "Rethinking Media Literacy in the Age of Digital Disinformation: A Framework for Critical Analysis",
            authors: "World Economic Forum Research Team, Dr. Sarah Chen, Prof. Michael Rodriguez",
            abstract: "This comprehensive study examines the evolving landscape of media literacy in response to the proliferation of digital disinformation. We present a new framework for critical media analysis that addresses the challenges posed by AI-generated content, deepfakes, and algorithmic bias in information dissemination.",
            content: "The research methodology involved analyzing media consumption patterns across 15 countries, surveying 50,000 individuals, and conducting focus groups with educators, journalists, and policy makers. Our findings reveal significant gaps in current media literacy education and propose evidence-based strategies for improvement.",
            keywords: "media literacy, digital disinformation, critical thinking, AI-generated content, algorithmic bias, education, information literacy",
            institution: "World Economic Forum",
            publicationDate: "2025-01-15",
            doi: "10.1234/wef.media.literacy.2025.001",
            centralInsight: "Traditional media literacy approaches are insufficient for addressing modern digital disinformation challenges. A new framework emphasizing critical analysis of algorithmic influence and AI-generated content is essential for democratic participation in the digital age.",
            impactForecast: "2-3 года: внедрение новых образовательных программ по медиаграмотности; 3-5 лет: интеграция AI-анализа в образовательные платформы; долгосрочно: формирование новых стандартов критического мышления в цифровую эпоху.",
            potentialApplication: "Образовательные программы для школ и университетов, корпоративные тренинги для СМИ, разработка политики по борьбе с дезинформацией, общественные кампании по повышению медиаграмотности.",
            questionsLenses: "Как алгоритмические рекомендации влияют на потребление информации? Какую роль играет AI-генерируемый контент в кампаниях дезинформации? Как создать эффективные инструменты для критического анализа медиа?",
            quote: "Способность критически оценивать источники информации больше не является роскошью—это необходимость для демократического участия.",
            rationale: "Быстрая эволюция цифровых медиа и AI-технологий требует обновленных подходов к медиаграмотности и образованию в области критического мышления.",
            risksLimitations: "Ограничения самоотчетных данных, потенциальная культурная предвзятость в международных сравнениях, быстро меняющийся технологический ландшафт, сопротивление внедрению новых образовательных подходов.",
            referencesAPA: "Chen, S., Rodriguez, M., & World Economic Forum. (2025). Rethinking media literacy in the age of digital disinformation: A framework for critical analysis. Journal of Media Studies, 42(3), 145-200.",
            volumePages: "Journal of Media Studies, Vol. 42, pp. 145-200",
            organizationType: "International Organization",
            pubType: "Research Report"
        };
        
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
            status: 'completed',
            message: 'File processing status (mock)'
        })
    };
}

async function handleNotionCreate(data) {
    try {
        console.log('Notion create request:', data);
        
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
        
        const notion = new Client({ auth: notionApiKey });
        
        const notionData = {
            parent: { database_id: notionDatabaseId },
            properties: {
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
        
        // Добавляем все поля из вашей таблицы Notion
        if (data.authors) {
            notionData.properties.Authors = {
                rich_text: [
                    {
                        text: {
                            content: data.authors
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
            const keywordsArray = data.keywords.split(',').map(tag => tag.trim());
            notionData.properties.Tags = {
                multi_select: keywordsArray.map(tag => ({
                    name: tag
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
                multi_select: [
                    {
                        name: data.organizationType
                    }
                ]
            };
        }
        
        if (data.pubType) {
            notionData.properties.PubType = {
                multi_select: [
                    {
                        name: data.pubType
                    }
                ]
            };
        }
        
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

async function handleNotionQuery() {
    try {
        const notionApiKey = process.env.NOTION_API_TOKEN;
        const notionDatabaseId = process.env.NOTION_DATABASE_ID;
        
        if (!notionApiKey || !notionDatabaseId) {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
                },
                body: JSON.stringify({
                    success: true,
                    message: 'Notion query (mock - credentials not configured)',
                    items: []
                })
            };
        }
        
        const notion = new Client({ auth: notionApiKey });
        
        const response = await notion.databases.query({
            database_id: notionDatabaseId,
            sorts: [
                {
                    property: 'DatePublished',
                    direction: 'descending',
                },
            ],
        });
        
        const researchItems = response.results.map(page => {
            const properties = page.properties;
            return {
                id: page.id,
                title: properties.TitleShort?.title[0]?.plain_text || 'Untitled',
                authors: properties.Authors?.rich_text[0]?.plain_text || 'N/A',
                datePublished: properties.DatePublished?.date?.start || 'N/A',
                url: properties.URL?.url || '#',
            };
        });
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
            },
            body: JSON.stringify({
                success: true,
                message: 'Notion query successful',
                items: researchItems
            })
        };
    } catch (error) {
        console.error('Notion query error:', error);
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
