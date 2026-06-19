import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearLongRunningTasks(timeoutDuration) {
    const currentTime = Date.now();
    const stuckTasks = await getStuckTasks(); // Fetch tasks that exceed timeoutDuration
    for (const task of stuckTasks) {
        if (currentTime - task.startTime > timeoutDuration) {
            await clearTask(task.id); // Clear the task
        }
    }
}

async function getStuckTasks() {
    // Implement the logic to retrieve stuck tasks here
    return []; // Placeholder for actual stuck tasks retrieval logic
}

async function clearTask(taskId) {
    // Implement clearing logic for the task based on its ID
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const timeoutDuration = 3600000; // 60 minutes in milliseconds
    try {
        await clearLongRunningTasks(timeoutDuration);
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});