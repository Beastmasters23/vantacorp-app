import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkTimeout(taskId, startTime) {
    const timeoutLimit = 60 * 1000; // 60 seconds timeout
    const currentTime = Date.now();
    if (currentTime - startTime > timeoutLimit) {
        console.error(`Task ${taskId} exceeded timeout limit.`);
        throw new Error(`Task ${taskId} timed out.`);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const taskId = req.headers.get('X-Task-ID') || 'unknown-task';
    const startTime = Date.now();

    try {
        // Example of task execution logic, replace with actual task calls
        await someTaskExecutionFunction();

        // Check for timeout after task execution
        await checkTimeout(taskId, startTime);
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});