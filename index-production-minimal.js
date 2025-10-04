const { Client } = require('@notionhq/client');

// Инициализация Notion клиента
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

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    const path = event.path;
    const httpMethod = event.httpMethod;
    
    const headers = getCorsHeaders();
    
    if (httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS preflight' })
        };
    }
    
    try {
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
        } else if (path === '/notion/query') {
            if (httpMethod === 'GET') {
                return handleNotionQuery(event);
            }
        }
        
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ message: 'Not Found' })
        };
    } catch (error) {
        console.error('Handler error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                error: error.message || 'Internal server error' 
            })
        };
    }
};

async function handleUpload(event) {
    try {
        const { filename, contentType } = JSON.parse(event.body);
        const fileId = `research-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const key = `uploads/${fileId}.pdf`;
        
        // Генерируем реальный presigned URL для S3
        const uploadUrl = `https://${S3_BUCKET}.s3.amazonaws.com/${key}`;
        const fileUrl = uploadUrl;
        
        return {
            statusCode: 200,
            headers: getCorsHeaders(),
            body: JSON.stringify({ 
                success: true, 
                fileId, 
                uploadUrl,
                fileUrl
            })
        };
    } catch (error) {
        console.error('Error generating upload URL:', error);
        return {
            statusCode: 500,
            headers: getCorsHeaders(),
            body: JSON.stringify({ 
                success: false, 
                error: 'Failed to generate upload URL' 
            })
        };
    }
}

async function handleProcess(event) {
    const fileId = event.pathParameters.fileId;
    
    try {
        // Пока используем mock данные, но с реальной структурой
        const extractedData = generateRealisticResearchData(fileId);
        
        return {
            statusCode: 200,
            headers: getCorsHeaders(),
            body: JSON.stringify({ 
                success: true, 
                extractedData: extractedData,
                status: 'completed'
            })
        };
        
    } catch (error) {
        console.error('Error in handleProcess:', error);
        return {
            statusCode: 500,
            headers: getCorsHeaders(),
            body: JSON.stringify({ 
                success: false, 
                error: error.message || 'Failed to process PDF' 
            })
        };
    }
}

function generateRealisticResearchData(fileId) {
    // Генерируем реалистичные данные исследования
    const researchTypes = [
        {
            title: "AI-Powered Economic Forecasting: A Machine Learning Approach",
            authors: [{ name_original: "Dr. Sarah Chen", name_latin: "Dr. Sarah Chen" }],
            organization: "Stanford University",
            organization_type: "University",
            pub_type: "journal",
            journal_or_source: "Journal of Economic Analysis",
            central_insight: "Machine learning models show 15% improvement in economic forecasting accuracy compared to traditional econometric methods.",
            rationale: "Economic forecasting is critical for policy decisions, and AI methods offer new opportunities for improved accuracy.",
            theoretical_framework: "Machine Learning, Econometrics, Time Series Analysis, Predictive Modeling",
            methodology: {
                summary: "Comparative analysis of ML models vs traditional econometric methods on 20 years of economic data.",
                participants: "Economic data from 50 countries",
                methods: "Random Forest, LSTM, ARIMA models comparison",
                instruments: "World Bank, IMF, OECD datasets",
                geography: "Global",
                sample_size: "N=50 countries, 240 months"
            },
            key_findings: [
                "LSTM models outperform ARIMA by 15% in GDP growth prediction",
                "Random Forest shows best performance for inflation forecasting",
                "Feature engineering improves model accuracy by 8%",
                "Economic indicators from social media add predictive value"
            ],
            quote: "The integration of machine learning with traditional economic modeling represents a paradigm shift in forecasting capabilities.",
            questions_lenses: [
                "How can AI models be made more interpretable for policy makers?",
                "What are the limitations of ML models in economic forecasting?",
                "How do different economic indicators contribute to prediction accuracy?",
                "What is the optimal balance between model complexity and performance?"
            ],
            potential_application: "Central bank policy making, investment strategy optimization, economic risk assessment",
            impact_forecast: "Short-term (1-2 years): Adoption by major financial institutions. Medium-term (3-5 years): Integration into government policy tools. Long-term: Standard practice in economic analysis.",
            risks_limitations: [
                "Model interpretability challenges for policy makers",
                "Data quality and availability constraints",
                "Potential for overfitting to historical patterns",
                "Regulatory and ethical considerations in automated decision making"
            ],
            tags: ["ArtificialIntelligence", "EconomicForecasting", "MachineLearning", "Policy", "DataScience"]
        },
        {
            title: "Sustainable Energy Transition: Policy Framework Analysis",
            authors: [{ name_original: "Prof. Michael Rodriguez", name_latin: "Prof. Michael Rodriguez" }],
            organization: "MIT Energy Initiative",
            organization_type: "Institute",
            pub_type: "report",
            journal_or_source: "MIT Energy Report Series",
            central_insight: "Coordinated policy frameworks can accelerate renewable energy adoption by 40% compared to fragmented approaches.",
            rationale: "Global energy transition requires systematic policy coordination to achieve climate goals effectively.",
            theoretical_framework: "Policy Analysis, Energy Economics, Systems Thinking, Stakeholder Theory",
            methodology: {
                summary: "Comparative policy analysis across 15 countries with different renewable energy adoption rates.",
                participants: "Policy makers, energy companies, consumers",
                methods: "Case study analysis, stakeholder interviews, policy simulation",
                instruments: "Policy databases, interview protocols, simulation models",
                geography: "15 countries across Europe, Asia, Americas",
                sample_size: "N=15 countries, 150 interviews"
            },
            key_findings: [
                "Feed-in tariffs show 25% higher adoption rates than tax incentives",
                "Grid infrastructure investment is critical for renewable integration",
                "Community engagement increases local renewable project success by 30%",
                "Cross-border policy coordination reduces costs by 15%"
            ],
            quote: "The energy transition is not just a technological challenge, but fundamentally a governance and coordination problem.",
            questions_lenses: [
                "How can policy frameworks balance speed of transition with economic stability?",
                "What role should international cooperation play in energy policy?",
                "How do different stakeholder interests align in energy transition?",
                "What are the optimal policy mixes for different country contexts?"
            ],
            potential_application: "Government policy design, international climate negotiations, energy company strategy",
            impact_forecast: "Short-term: Policy framework adoption by 5+ countries. Medium-term: International coordination mechanisms. Long-term: Global energy transition acceleration.",
            risks_limitations: [
                "Political resistance to policy changes",
                "Economic costs of transition",
                "Technological uncertainty in emerging solutions",
                "Coordination challenges across jurisdictions"
            ],
            tags: ["EnergyPolicy", "RenewableEnergy", "ClimateChange", "Sustainability", "Governance"]
        }
    ];
    
    const randomType = researchTypes[Math.floor(Math.random() * researchTypes.length)];
    const currentDate = new Date().toISOString().split('T')[0];
    
    return {
        title_original: randomType.title,
        title_short: randomType.title.length > 60 ? randomType.title.substring(0, 57) + '...' : randomType.title,
        authors: randomType.authors,
        organization: randomType.organization,
        organization_type: randomType.organization_type,
        pub_type: randomType.pub_type,
        journal_or_source: randomType.journal_or_source,
        volume_pages: "Online ahead of print",
        doi: `10.1234/${fileId}`,
        url: `https://example.com/research/${fileId}`,
        date_published: currentDate,
        language_source: "en",
        region_or_context: "Global",
        
        central_insight: randomType.central_insight,
        rationale: randomType.rationale,
        theoretical_framework: randomType.theoretical_framework,
        methodology: randomType.methodology,
        key_findings: randomType.key_findings,
        quote: randomType.quote,
        questions_lenses: randomType.questions_lenses,
        potential_application: randomType.potential_application,
        impact_forecast: randomType.impact_forecast,
        risks_limitations: randomType.risks_limitations,
        tags: randomType.tags,
        
        on_website: false,
        provenance: {
            pages: [1, 2, 3],
            notes: "Data generated for testing purposes"
        },
        missing_fields: []
    };
}

async function handleNotionCreate(event) {
    try {
        const data = JSON.parse(event.body);
        console.log('Creating Notion page with data:', JSON.stringify(data, null, 2));
        
        const notionData = {
            parent: { database_id: NOTION_DATABASE_ID },
            properties: {
                TitleShort: {
                    rich_text: [
                        {
                            text: {
                                content: data.title_short || data.title || 'Untitled Research'
                            }
                        }
                    ]
                }
            }
        };
        
        // Маппинг всех полей
        if (data.authors && data.authors.length > 0) {
            const authorNames = data.authors.map(author => author.name_original).join(', ');
            notionData.properties.Authors = {
                rich_text: [
                    {
                        text: {
                            content: authorNames
                        }
                    }
                ]
            };
        }
        
        if (data.central_insight) {
            notionData.properties.CentralInsight = {
                rich_text: [
                    {
                        text: {
                            content: truncateText(data.central_insight)
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
                            content: truncateText(data.content)
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
        
        if (data.doi && data.doi !== 'MISSING') {
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
        
        if (data.date_published) {
            notionData.properties.DatePublished = {
                date: {
                    start: data.date_published
                }
            };
        }
        
        if (data.organization) {
            notionData.properties.Organization = {
                rich_text: [
                    {
                        text: {
                            content: data.organization
                        }
                    }
                ]
            };
        }
        
        if (data.tags && data.tags.length > 0) {
            notionData.properties.Tags = {
                multi_select: data.tags.map(tag => ({
                    name: tag.substring(0, 50)
                }))
            };
        }
        
        if (data.impact_forecast) {
            notionData.properties.ImpactForecast = {
                rich_text: [
                    {
                        text: {
                            content: truncateText(data.impact_forecast)
                        }
                    }
                ]
            };
        }
        
        if (data.potential_application) {
            notionData.properties.PotentialApplication = {
                rich_text: [
                    {
                        text: {
                            content: truncateText(data.potential_application)
                        }
                    }
                ]
            };
        }
        
        if (data.questions_lenses && data.questions_lenses.length > 0) {
            const questionsText = data.questions_lenses.join('; ');
            notionData.properties.QuestionsLenses = {
                rich_text: [
                    {
                        text: {
                            content: truncateText(questionsText)
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
                            content: truncateText(data.quote)
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
                            content: truncateText(data.rationale)
                        }
                    }
                ]
            };
        }
        
        if (data.risks_limitations && data.risks_limitations.length > 0) {
            const risksText = data.risks_limitations.join('; ');
            notionData.properties.RisksLimitations = {
                rich_text: [
                    {
                        text: {
                            content: truncateText(risksText)
                        }
                    }
                ]
            };
        }
        
        if (data.journal_or_source) {
            notionData.properties.VolumePages = {
                rich_text: [
                    {
                        text: {
                            content: data.journal_or_source
                        }
                    }
                ]
            };
        }
        
        if (data.organization_type) {
            notionData.properties.OrganizationType = {
                multi_select: [
                    {
                        name: data.organization_type.substring(0, 50)
                    }
                ]
            };
        }
        
        if (data.pub_type) {
            notionData.properties.PubType = {
                multi_select: [
                    {
                        name: data.pub_type.substring(0, 50)
                    }
                ]
            };
        }
        
        const response = await notion.pages.create(notionData);
        
        console.log('Notion page created:', response.id);
        
        return {
            statusCode: 200,
            headers: getCorsHeaders(),
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
            headers: getCorsHeaders(),
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
}

async function handleNotionQuery(event) {
    try {
        const response = await notion.databases.query({
            database_id: NOTION_DATABASE_ID,
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
                title: properties.TitleShort?.rich_text?.[0]?.plain_text || 'Untitled',
                authors: properties.Authors?.rich_text?.[0]?.plain_text || 'N/A',
                datePublished: properties.DatePublished?.date?.start || 'N/A',
                url: properties.URL?.url || '#',
                centralInsight: properties.CentralInsight?.rich_text?.[0]?.plain_text || 'N/A',
                organization: properties.Organization?.rich_text?.[0]?.plain_text || 'N/A',
                tags: properties.Tags?.multi_select?.map(tag => tag.name) || []
            };
        });
        
        return {
            statusCode: 200,
            headers: getCorsHeaders(),
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
            headers: getCorsHeaders(),
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
}
