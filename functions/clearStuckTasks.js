import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearStuckTasks() {
    // Logic to monitor all running tasks and cancel any that have surpassed the defined threshold.
    const MAX_RUNNING_TIME = 60 * 60 * 1000; // 60 minutes
    const currentTime = Date.now();

    const runningTasks = await getRunningTasks(); // Assume this returns currently running tasks
    for (const task of runningTasks) {
        if ((currentTime - task.startTime) > MAX_RUNNING_TIME) {
            await cancelTask(task.id); // Assume this function cancels a task
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearStuckTasks(); // Execute pre-flight check for stuck tasks
        // Additional task execution logic here
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});