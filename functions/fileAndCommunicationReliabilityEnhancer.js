import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const maxRetries = 3; // Set maximum number of retries
    const retryDelay = 2000; // Delay in ms before each retry

    // Function to search for entities with retry logic
    async function searchWithRetry(searchFunction) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const result = await searchFunction();
                if (result) {
                    return result;
                }
                throw new Error('No content returned'); // Trigger retry if no result
            } catch (error) {
                console.error(`Attempt ${attempt} failed: ${error.message}`);
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay)); // Wait before retrying
                } else {
                    throw new Error('Max retries reached, operation failed: ' + error.message);
                }
            }
        }
    }

    // Example function to fetch entities (replace with actual logic)
    async function fetchEntities() {
        // Placeholder for the logic to search for files or external communications
        return null; // Simulating no output to trigger retry
    }

    try {
        const entities = await searchWithRetry(fetchEntities);
        return Response.json({ entities }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});