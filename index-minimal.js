exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    };

    try {
        const { httpMethod, path, pathParameters, queryStringParameters, body } = event;
        
        // Handle CORS preflight requests
        if (httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: 'CORS preflight' })
            };
        }

        console.log('HTTP Method:', httpMethod);
        console.log('Path:', path);
        
        if (path === '/upload') {
            return handleUpload(event, headers);
        } else if (path.startsWith('/process/')) {
            return handleProcess(event, headers);
        } else if (path === '/notion/create') {
            return handleNotionCreate(event, headers);
        } else if (path === '/notion/query') {
            return handleNotionQuery(event, headers);
        } else {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Endpoint not found' })
            };
        }
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};

async function handleUpload(event, headers) {
    console.log('Upload endpoint called');
    
    const fileId = `research-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Mock upload URL for testing
    const uploadUrl = `https://mock-s3.amazonaws.com/uploads/${fileId}.pdf`;

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            fileId,
            uploadUrl
        })
    };
}

async function handleProcess(event, headers) {
    console.log('Process endpoint called');
    
    const fileId = event.pathParameters?.fileId;
    if (!fileId) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'File ID is required' })
        };
    }

    // Mock processing for testing
    const mockData = {
        title_original: "Test Research Document",
        title_short: "Test Research",
        authors: [{ name_original: "Test Author", name_latin: "Test Author" }],
        organization: "Test Organization",
        organization_type: "University",
        pub_type: "journal",
        journal_or_source: "Test Journal",
        volume_pages: "Vol. 1, pp. 1-10",
        doi: "10.1000/test",
        url: "https://example.com/test",
        date_published: "2025-01-01",
        language_source: "en",
        region_or_context: "Global",
        central_insight: "This is a test research document for system testing.",
        rationale: "Testing the research processing system.",
        theoretical_framework: "Test framework",
        methodology: {
            summary: "Test methodology",
            participants: "Test participants",
            methods: "Test methods",
            instruments: "Test instruments",
            geography: "Test geography",
            sample_size: "N=100"
        },
        key_findings: ["Finding 1", "Finding 2", "Finding 3"],
        quote: "This is a test quote from the research.",
        questions_lenses: ["Question 1", "Question 2"],
        potential_application: "Test application",
        impact_forecast: "Test impact forecast",
        risks_limitations: ["Limitation 1", "Limitation 2"],
        tags: ["test", "research", "mock"],
        on_website: false,
        provenance: {
            pages: [1, 2, 3],
            notes: "Mock data for testing"
        },
        missing_fields: []
    };

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            extractedData: mockData,
            fileUrl: `https://mock-s3.amazonaws.com/uploads/${fileId}.pdf`
        })
    };
}

async function handleNotionCreate(event, headers) {
    console.log('Notion create endpoint called');
    
    try {
        const data = JSON.parse(event.body);
        console.log('Notion data received:', JSON.stringify(data, null, 2));
        
        // Mock Notion creation
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Research item created in Notion (mock)',
                id: 'mock-id-' + Date.now()
            })
        };
    } catch (error) {
        console.error('Notion create error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
}

async function handleNotionQuery(event, headers) {
    console.log('Notion query endpoint called');
    
    try {
        // Mock Notion query response
        const mockResults = [
            {
                id: 'mock-1',
                properties: {
                    TitleOriginal: { title: [{ text: { content: 'Test Research 1' } }] },
                    TitleShort: { rich_text: [{ text: { content: 'Test 1' } }] },
                    Authors: { rich_text: [{ text: { content: 'Test Author 1' } }] },
                    Organization: { rich_text: [{ text: { content: 'Test Org 1' } }] },
                    CentralInsight: { rich_text: [{ text: { content: 'Test insight 1' } }] }
                }
            },
            {
                id: 'mock-2',
                properties: {
                    TitleOriginal: { title: [{ text: { content: 'Test Research 2' } }] },
                    TitleShort: { rich_text: [{ text: { content: 'Test 2' } }] },
                    Authors: { rich_text: [{ text: { content: 'Test Author 2' } }] },
                    Organization: { rich_text: [{ text: { content: 'Test Org 2' } }] },
                    CentralInsight: { rich_text: [{ text: { content: 'Test insight 2' } }] }
                }
            }
        ];

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                results: mockResults
            })
        };
    } catch (error) {
        console.error('Notion query error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
}
