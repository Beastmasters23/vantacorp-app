import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function taskWatchdog(taskId: string) {
    const startTime = Date.now();
    const timeoutDuration = 300000; // 300 seconds
    try {
        // Simulate task execution
        while (true) {
            // Check if the task exceeds the timeout threshold
            if (Date.now() - startTime > timeoutDuration) {
                throw new Error('Task timed out after 300 seconds.');
            }
            await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate running task every 5 seconds.
        }
    } catch (error) {
        // Log error and mark task as failed (this part can be enhanced as needed)
        console.error(`Task ${taskId} failed: ${error.message}`);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const taskId = req.headers.get('X-Task-ID') || 'default-task-id'; // Example of grabbing task id from headers
    try {
        await taskWatchdog(taskId);
        return Response.json({ message: 'Task completed successfully' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});