import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function enhancedFileSearch(keywords, retries = 3, timeout = 30000) {
    const startTime = Date.now();
    let attempts = 0;
    while (attempts < retries) {
        try {
            // Simulating searching for keywords in files with a timeout 
            const result = await performSearch(keywords);
            return result;
        } catch (error) {
            const elapsed = Date.now() - startTime;
            if (elapsed >= timeout) {
                throw new Error('Search timed out after ' + timeout + ' ms');
            }
            attempts++;
            console.log(`Attempt ${attempts} failed, retrying...`);
        }
    }
    throw new Error('Failed to complete file search after ' + retries + ' attempts');
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const keywords = ['Lyra', 'Weaver', 'maritime']; // Example keywords to search for
    try {
        const searchResults = await enhancedFileSearch(keywords);
        return Response.json({ success: true, results: searchResults });
    } catch (error) {
        console.error(error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});