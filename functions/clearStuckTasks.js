import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const timeThreshold = 60 * 1000;  // 60 seconds in milliseconds

async function clearStuckTasks() {
    // Implement logic to check running tasks and their timestamps
    const runningTasks = await fetchRunningTasks();
    const currentTime = Date.now();

    for (const task of runningTasks) {
        if (currentTime - task.startTime > timeThreshold) {
            // Logic to clear or restart the stuck task
            await restartTask(task.id);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Invoke clearStuckTasks before executing further commands
        await clearStuckTasks();
        // Proceed with further command executions here
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});