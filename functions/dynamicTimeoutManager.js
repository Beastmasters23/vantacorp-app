import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function manageTimeout(taskId, taskFunction, initialTimeout) {
    const maxRetries = 3;
    let currentRetry = 0;
    let timeout = initialTimeout;

    while (currentRetry < maxRetries) {
        const taskPromise = taskFunction();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Task timed out')), timeout));

        try {
            await Promise.race([taskPromise, timeoutPromise]);
            return; // Task completed successfully
        } catch (error) {
            if (error.message.includes('timed out')) {
                console.warn(`Task ${taskId} timed out, retrying...`);
                timeout *= 2; // exponentially increase timeout
                currentRetry++;
            } else {
                throw error; // throw if it's not a timeout error
            }
        }
    }
    throw new Error(`Task ${taskId} failed after ${maxRetries} retries`);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const taskId = 'dynamicTask'; // Example task ID
        await manageTimeout(taskId, async () => {
            // Placeholder for actual task logic
            console.log('Running task logic...');
            await new Promise(resolve => setTimeout(resolve, 15000)); // Simulating task duration
        }, 30000); // Initial timeout set to 30 seconds
        return Response.json({ status: 'Task completed successfully!' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});