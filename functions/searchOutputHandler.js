import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkSearchOutput(taskId, timeout) {
    const start = Date.now();
    const checkInterval = 5000; // Check every 5 seconds

    while (Date.now() - start < timeout) {
        const output = await fetchSearchOutput(taskId);
        if (output) {
            return output;
        }
        await new Promise((resolve) => setTimeout(resolve, checkInterval));
    }
    throw new Error('No output after timeout. Task may need re-execution.');
}

async function fetchSearchOutput(taskId) {
    // Implement the logic to fetch the output from the search based on taskId.
    // For demonstration, assume fetching from a pseudo-service or database.
    // return await fetch(`/search/results/${taskId}`);
    return null; // Placeholder for demo
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const taskId = req.url.split('/').pop(); // Extract taskId from URL
    const timeout = 300000; // 5 minutes

    try {
        const output = await checkSearchOutput(taskId, timeout);
        return Response.json({ output }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});