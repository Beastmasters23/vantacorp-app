import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkTaskTimeout(taskId, startTime, timeoutDuration) {
    const currentTime = Date.now();
    if (currentTime - startTime > timeoutDuration) {
        console.log(`Task ${taskId} has exceeded the timeout of ${timeoutDuration}ms`);
        // Logic to terminate the stuck task and log the details
        return { success: false, message: 'Task has been aborted due to timeout.' };
    }
    return { success: true };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const taskId = req.headers.get('X-Task-ID'); // Assuming task ID is passed in headers
    const timeoutDuration = 3600000; // 60 minutes in milliseconds
    const startTime = Date.now(); // Capture start time of the task

    try {
        // Main task execution logic here
        // e.g., await performTask();

        const timeoutCheck = await checkTaskTimeout(taskId, startTime, timeoutDuration);
        if (!timeoutCheck.success) {
            return Response.json({ error: timeoutCheck.message }, { status: 500 });
        }

        // If the task was successful
        return Response.json({ message: 'Task completed successfully' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});