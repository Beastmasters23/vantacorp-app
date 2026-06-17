import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TASK_TIMEOUT = 60 * 1000; // 60 seconds timeout

async function monitorLongRunningTasks() {
    const activeTasks = getActiveTasks(); // Assume this function retrieves currently active tasks
    for (const task of activeTasks) {
        if (task.executionTime > TASK_TIMEOUT) {
            await terminateTask(task.id); // Assume this function terminates the task
            console.log(`Terminated task ${task.id} as it exceeded timeout threshold.`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await monitorLongRunningTasks(); // Invoke monitoring on each request
        // ... other code to handle tasks
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});