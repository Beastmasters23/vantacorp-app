import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TIMEOUT_LIMIT = 60 * 1000; // 60 seconds

async function logTaskDetails(taskName, startTime, status) {
    const executionTime = Date.now() - startTime;
    console.log(`Task: ${taskName}, Status: ${status}, Execution Time: ${executionTime}ms`);
}

async function executeTask(taskName, taskFunction) {
    const startTime = Date.now();
    try {
        const result = await Promise.race([
            taskFunction(),
            new Promise((_, reject) => setTimeout(() => { 
                reject(new Error(`Task: ${taskName} exceeded timeout limit`));
            }, TIMEOUT_LIMIT))
        ]);
        await logTaskDetails(taskName, startTime, 'Completed');
        return result;
    } catch (error) {
        await logTaskDetails(taskName, startTime, 'Failed');
        throw error;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Example task
        const result = await executeTask('Search Directory', async () => {
            // Simulate task execution
            await new Promise(resolve => setTimeout(resolve, Math.random() * 120000)); // Simulate random task duration
            return 'Task Done';
        });
        return Response.json({ result });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});