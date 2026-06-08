import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MAX_RETRIES = 3;

async function executeTaskWithRetries(taskFunction, ...args) {
    let attempt = 0;
    while (attempt < MAX_RETRIES) {
        attempt++;
        try {
            const result = await taskFunction(...args);
            return result;
        } catch (error) {
            console.log(`Attempt ${attempt} failed: ${error.message}`);
            if (attempt === MAX_RETRIES) {
                throw new Error(`Task failed after ${MAX_RETRIES} attempts`);
            }
        }
    }
}

async function searchForKeywords(...keywords) {
    // Implementation to search in directories based on provided keywords.
    // Simulate a search action that may fail and throw an error.
    // This is also where detailed logging of each attempt would occur.
    // Placeholder implementation for demonstration purposes.
    if (Math.random() < 0.5) throw new Error('Search function encountered an issue.');
    return `Found entries for keywords: ${keywords.join(', ')}`;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const result = await executeTaskWithRetries(searchForKeywords, 'Lyra', 'Weaver');
        return Response.json({ result }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});