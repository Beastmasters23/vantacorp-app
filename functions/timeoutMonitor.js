import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function timeoutMonitor(taskId, timeoutDuration) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            console.log(`Task ${taskId} has exceeded timeout:`);
            reject(new Error(`Task ${taskId} exceeded timeout of ${timeoutDuration}ms`));
        }, timeoutDuration);
        // Successfully clear timeout and resolve if task completes
        // Simulate task completion for demonstration purpose
        setTimeout(() => {
            clearTimeout(timeout);
            console.log(`Task ${taskId} completed on time!`);
            resolve(true);
        }, timeoutDuration - 500); // Simulate task completing before timeout
    });
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const taskId = req.headers.get('Task-Id') || 'defaultTask';
        const timeoutDuration = 60000; // Set to 60 seconds
        await timeoutMonitor(taskId, timeoutDuration);
        // Add actual task execution logic here...
        return Response.json({ message: `Task ${taskId} executed successfully.` });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});