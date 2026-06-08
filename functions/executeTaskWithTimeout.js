import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TASK_TIMEOUT = 3600; // 1 hour timeout

async function executeTaskWithTimeout(taskFunc, ...args) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TASK_TIMEOUT * 1000);
    try {
        await taskFunc(...args, { signal: controller.signal });
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('Task exceeded timeout and was aborted.');
            // handle timeout specific actions here
        } else {
            console.error('Task execution error:', error);
        }
    } finally {
        clearTimeout(timeoutId);
    }
}

async function vantaCustomTask() {
    // Simulate task functionality here, replace with actual task logic
    return new Promise((resolve) => {
        setTimeout(resolve, 5000); // simulate a long task
    });
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await executeTaskWithTimeout(vantaCustomTask);
        return Response.json({ status: 'Task Completed' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});