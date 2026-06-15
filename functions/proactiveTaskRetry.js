import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MAX_RETRIES = 5;
const RETRY_DELAY_BASE_MS = 1000;

async function executeTaskWithRetry(taskFunction, taskParams) {
    let attempt = 0;
    while (attempt < MAX_RETRIES) {
        try {
            return await taskFunction(...taskParams);
        } catch (error) {
            console.error(`Task failed on attempt ${attempt + 1}: ${error.message}`);
            attempt++;
            if (attempt < MAX_RETRIES) {
                const delayTime = RETRY_DELAY_BASE_MS * Math.pow(2, attempt);
                console.log(`Retrying in ${delayTime}ms...`);
                await new Promise(resolve => setTimeout(resolve, delayTime));
            } else {
                throw new Error(`Failed after ${MAX_RETRIES} attempts`);
            }
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Example usage of executeTaskWithRetry to run a task
        const result = await executeTaskWithRetry(vantaTaskPoll, [/* task parameters here */]);
        return Response.json(result);
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});