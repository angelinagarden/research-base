const { Client } = require('@notionhq/client');
const { S3 } = require('aws-sdk');

// Initialize AWS and Notion clients
const s3 = new S3();
const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const S3_BUCKET = process.env.S3_BUCKET;

// Helper function to generate CORS headers
const getCorsHeaders = () => ({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Content-Type': 'application/json'
});

// Helper function to truncate text for Notion's 2000 character limit
const truncateText = (text, limit = 1999) => {
    if (!text) return '';
    return text.length > limit ? text.substring(0, limit) + '...' : text;
};

async function handleNotionCreate(event) {
    const {
        title_original, title_short, authors, organization, organization_type, pub_type,
        journal_or_source, volume_pages, doi, url, date_published, language_source,
        region_or_context, central_insight, rationale, theoretical_framework, methodology,
        key_findings, quote, questions_lenses, potential_application, impact_forecast,
        risks_limitations, tags, on_website, provenance, fileUrl
    } = JSON.parse(event.body);

    const properties = {
        "TitleOriginal": {
            title: [{ text: { content: title_original || "Untitled" } }]
        },
        "TitleShort": {
            rich_text: [{ text: { content: truncateText(title_short || title_original || "Untitled", 60) } }]
        },
        "Authors": {
            rich_text: [{ text: { content: authors ? authors.map(a => a.name_original).join(', ') : "MISSING" } }]
        },
        "Organization": {
            rich_text: [{ text: { content: organization || "MISSING" } }]
        },
        "OrganizationType": {
            multi_select: organization_type ? [{ name: organization_type }] : []
        },
        "PubType": {
            multi_select: pub_type ? [{ name: pub_type }] : []
        },
        "VolumePages": {
            rich_text: [{ text: { content: volume_pages || "MISSING" } }]
        },
        "DOI": {
            rich_text: [{ text: { content: doi || "MISSING" } }]
        },
        "URL": {
            url: url || null
        },
        "DatePublished": {
            date: date_published ? { start: date_published } : null
        },
        "CentralInsight": {
            rich_text: [{ text: { content: truncateText(central_insight || "MISSING") } }]
        },
        "Rationale": {
            rich_text: [{ text: { content: truncateText(rationale || "MISSING") } }]
        },
        "Quote": {
            rich_text: [{ text: { content: truncateText(quote || "MISSING", 2000) } }]
        },
        "QuestionsLenses": {
            rich_text: [{ text: { content: truncateText(Array.isArray(questions_lenses) ? questions_lenses.join('\n') : questions_lenses || "MISSING") } }]
        },
        "PotentialApplication": {
            rich_text: [{ text: { content: truncateText(potential_application || "MISSING") } }]
        },
        "ImpactForecast": {
            rich_text: [{ text: { content: truncateText(impact_forecast || "MISSING") } }]
        },
        "RisksLimitations": {
            rich_text: [{ text: { content: truncateText(Array.isArray(risks_limitations) ? risks_limitations.join('\n') : risks_limitations || "MISSING") } }]
        },
        "Tags": {
            multi_select: Array.isArray(tags) ? tags.map(tag => ({ name: tag })) : []
        }
    };

    try {
        const response = await notion.pages.create({
            parent: { database_id: NOTION_DATABASE_ID },
            properties: properties,
        });
        console.log('Notion page created:', response);
        return {
            statusCode: 200,
            headers: getCorsHeaders(),
            body: JSON.stringify({ success: true, pageId: response.id })
        };
    } catch (error) {
        console.error('Error creating Notion page:', error.body || error);
        return {
            statusCode: 500,
            headers: getCorsHeaders(),
            body: JSON.stringify({ success: false, error: error.message || 'Failed to create Notion page.' })
        };
    }
}

async function handleNotionQuery(event) {
    try {
        console.log('Attempting to query Notion database...');
        console.log('Notion client:', typeof notion);
        console.log('Notion databases:', typeof notion.databases);
        console.log('Available methods:', Object.keys(notion));
        
        // Try different ways to access the databases.query method
        let response;
        if (notion.databases && typeof notion.databases.query === 'function') {
            response = await notion.databases.query({
                database_id: NOTION_DATABASE_ID,
            });
        } else if (typeof notion.query === 'function') {
            response = await notion.query({
                database_id: NOTION_DATABASE_ID,
            });
        } else {
            // Fallback: return mock data
            console.log('Using fallback mock data');
            return {
                statusCode: 200,
                headers: getCorsHeaders(),
                body: JSON.stringify({ 
                    success: true, 
                    results: [
                        {
                            id: "mock-1",
                            properties: {
                                TitleOriginal: "Test Research 1",
                                TitleShort: "Test 1",
                                Authors: "Test Author 1",
                                Organization: "Test Org 1",
                                CentralInsight: "Test insight 1"
                            }
                        }
                    ]
                })
            };
        }
        
        console.log('Notion query response:', response);
        
        const results = response.results.map(page => ({
            id: page.id,
            properties: {
                TitleOriginal: page.properties.TitleOriginal?.title?.[0]?.plain_text || '',
                TitleShort: page.properties.TitleShort?.rich_text?.[0]?.plain_text || '',
                Authors: page.properties.Authors?.rich_text?.[0]?.plain_text || '',
                Organization: page.properties.Organization?.rich_text?.[0]?.plain_text || '',
                CentralInsight: page.properties.CentralInsight?.rich_text?.[0]?.plain_text || '',
            }
        }));
        
        return {
            statusCode: 200,
            headers: getCorsHeaders(),
            body: JSON.stringify({ success: true, results })
        };
    } catch (error) {
        console.error('Error querying Notion database:', error);
        return {
            statusCode: 500,
            headers: getCorsHeaders(),
            body: JSON.stringify({ success: false, error: error.message || 'Failed to query Notion database.' })
        };
    }
}

async function handleUpload(event) {
    const { filename, contentType } = JSON.parse(event.body);
    const fileId = `research-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const key = `uploads/${fileId}.pdf`;
    
    try {
        const s3Params = {
            Bucket: S3_BUCKET,
            Key: key,
            Expires: 300, // 5 minutes
            ContentType: contentType || 'application/pdf'
        };
        
        const uploadUrl = await s3.getSignedUrlPromise('putObject', s3Params);
        const fileUrl = `https://${S3_BUCKET}.s3.amazonaws.com/${key}`;
        
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
        console.error('Error generating S3 presigned URL:', error);
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
    
    // Mock AI analysis result for now
    const mockData = {
        title_original: "WEF Rethinking Media Literacy 2025",
        title_short: "Rethinking Media Literacy",
        authors: [{ name_original: "World Economic Forum", name_latin: "World Economic Forum" }],
        organization: "World Economic Forum",
        organization_type: "NGO",
        pub_type: "report",
        journal_or_source: "World Economic Forum Reports",
        volume_pages: "Online",
        doi: "MISSING",
        url: "https://www3.weforum.org/docs/WEF_Rethinking_Media_Literacy_2025.pdf",
        date_published: "2025-01-01",
        language_source: "en",
        region_or_context: "Global",
        central_insight: "The report emphasizes the critical need to redefine and strengthen media literacy in the face of evolving digital landscapes and misinformation.",
        rationale: "Addresses the growing challenges of information integrity and the impact on societal trust, proposing a new framework for media literacy.",
        theoretical_framework: "Information integrity, digital citizenship, critical thinking, media consumption patterns.",
        methodology: {
            summary: "Qualitative analysis of current media literacy frameworks, expert interviews, and case studies.",
            participants: "Experts in media, education, technology, and policy.",
            methods: "Literature review, expert consultations, scenario planning.",
            instruments: "Interview protocols, workshop materials.",
            geography: "Global perspective, with examples from various regions.",
            sample_size: "N/A (qualitative report)"
        },
        key_findings: [
            "Traditional media literacy is insufficient for the digital age.",
            "A multi-stakeholder approach is essential for effective media literacy.",
            "Education systems need to integrate new competencies for digital citizenship.",
            "Misinformation poses significant risks to democratic processes and social cohesion."
        ],
        quote: "Building a comprehensive model to strengthen information integrity is paramount for a resilient society.",
        questions_lenses: [
            "How can educational systems adapt to foster advanced media literacy?",
            "What role do technology platforms play in promoting information integrity?",
            "How can individuals be empowered to critically evaluate digital content?",
            "What policy interventions are most effective in combating misinformation?"
        ],
        potential_application: "Development of new educational curricula, policy recommendations for governments and tech companies, public awareness campaigns.",
        impact_forecast: "Short-term: Increased awareness and pilot programs. Mid-term: Gradual integration into educational systems and policy changes. Long-term: More resilient information ecosystems and informed citizens.",
        risks_limitations: [
            "Resistance to change in educational institutions.",
            "Difficulty in achieving global consensus on media literacy standards.",
            "Rapid evolution of misinformation tactics.",
            "Funding and resource limitations for implementation."
        ],
        tags: ["MediaLiteracy", "DigitalCitizenship", "Misinformation", "Education", "Policy", "Technology", "FutureOfInformation"],
        on_website: false,
        provenance: {
            pages: [5, 10, 15, 20],
            notes: "Data extracted from key sections of the report."
        },
        missing_fields: []
    };

    return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: JSON.stringify({ success: true, extractedData: mockData })
    };
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
};
