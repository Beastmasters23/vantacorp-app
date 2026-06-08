import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // milliseconds

async function taskWithRetries(taskFn, ...args) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const result = await taskFn(...args);
            if (result) return result;
        } catch (error) {
            console.log(`Attempt ${attempt + 1} failed: ${error.message}`);
            if (attempt === MAX_RETRIES - 1) throw error; // Throw error if max retries reached
        }
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY)); // wait before retrying
    }
}

async function performTask(request) {
    // Simulating a task execution, e.g. searching directories or contacting the bridge
    const base44 = createClientFromRequest(request);
    // Placeholder for the actual task function, replace with real logic
    return base44.searchDirectories();
}

Deno.serve(async (req) => {
    try {
        const result = await taskWithRetries(performTask, req);
        return Response.json({ result }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});