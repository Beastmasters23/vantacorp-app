import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearLongRunningTasks() {
    // Logic to check currently running tasks and cancel those exceeding the timeout threshold
    const TASK_TIMEOUT_LIMIT = 60 * 1000; // 60 seconds
    const runningTasks = await getRunningTasks(); // Hypothetical function to retrieve running tasks

    for (const task of runningTasks) {
        if (task.duration > TASK_TIMEOUT_LIMIT) {
            await cancelTask(task.id); // Hypothetical function to cancel the task
            log('Cancelled long-running task:', task.id); // Hypothetical logging method
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearLongRunningTasks();
        return Response.json({ status: 'checked for long-running tasks' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});