import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TIMEOUT_LIMIT = 300; // 5 minutes limit
    const TASK_CHECK_INTERVAL = 60; // check every minute

    try {
        const tasks = await getCurrentRunningTasks(); // Fetch currently running tasks from system
        const currentTime = Date.now();

        for (const task of tasks) {
            // Check if task has exceeded its timeout limit
            if ((currentTime - task.startTime) > (TIMEOUT_LIMIT * 1000)) {
                await markTaskAsFailed(task.id); // Mark as failed if it is stuck
                console.log(`Task ${task.id} marked as failed due to timeout.`);
            }
        }

        // Sets an interval to check tasks regularly
        setInterval(async () => {
            const tasks = await getCurrentRunningTasks();
            for (const task of tasks) {
                if ((Date.now() - task.startTime) > (TIMEOUT_LIMIT * 1000)) {
                    await markTaskAsFailed(task.id);
                    console.log(`Task ${task.id} marked as failed due to timeout.`);
                }
            }
        }, TASK_CHECK_INTERVAL * 1000); // convert minutes to seconds

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function getCurrentRunningTasks() {
    // ...implementation to gather running tasks from the system
}

async function markTaskAsFailed(taskId) {
    // ...implementation to mark task as failed in system logs or database
}