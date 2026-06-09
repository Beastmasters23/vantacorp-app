import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function handleTimeoutsAndRetries(taskId) {
    // Check the status of a task and log timeouts
    const taskDuration = await getTaskDuration(taskId);
    if (taskDuration > 300) {  // threshold of 5 minutes
        console.warn(`Task ${taskId} has exceeded timeout threshold. Killed for recovery.`);
        await killTask(taskId);
        await logTimeout(taskId);
        return true;  // Indicates a timeout was handled
    }
    return false;  // No timeout
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const tasksToCheck = await getRunningTasks();
    for (const task of tasksToCheck) {
        const timeoutHandled = await handleTimeoutsAndRetries(task.id);
        if (timeoutHandled) {
            await retryTask(task.id);
        }
    }
    return Response.json({ message: 'Timeouts checked and handled' });
});