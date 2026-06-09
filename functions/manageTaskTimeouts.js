import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
const TIMEOUT_THRESHOLD = 60 * 1000; // 60 seconds timeout

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const currentTime = Date.now();
        const tasks = await base44.getTasks(); // Assume this fetches the current running tasks
        const failedTasks = [];

        // Iterate through tasks to check for timeout
        for (const task of tasks) {
            if (task.status === "running" && (currentTime - task.startTime) > TIMEOUT_THRESHOLD) {
                // Task has exceeded the time limit
                failedTasks.push(task);
                await base44.markTaskAsFailed(task.id, 'Exceeded timeout limit'); // Fail the task
            }
        }

        return Response.json({ success: true, failedTasks });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});