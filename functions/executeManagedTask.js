import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TASK_TIMEOUT = 3600; // 1 hour timeout
const RETRY_LIMIT = 5;

async function executeManagedTask(task, retries = 0) {
    const startTime = Date.now();
    let response;
    try {
        response = await task(); // Execute the task
        const duration = Date.now() - startTime;
        if (duration > TASK_TIMEOUT * 1000) {
            throw new Error('Task exceeded time limit');
        }
        return response; // Successful task execution
    } catch (error) {
        if (retries < RETRY_LIMIT) {
            console.warn(`Task failed: ${error.message}. Retrying (${retries + 1}/${RETRY_LIMIT})...`);
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000)); // Exponential backoff
            return executeManagedTask(task, retries + 1);
        } else {
            console.error('Task failed after maximum retries:', error);
            throw error; // Final failure
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Define your task here - this is just a placeholder example
        const sampleTask = async () => {
            // Simulate some task logic here
            return { result: 'Task complete' };
        };
        const result = await executeManagedTask(sampleTask);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});