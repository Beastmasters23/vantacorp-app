import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearPendingTasks(taskId) {
    // Logic to clear any pending tasks in the system
}

async function checkLongRunningTasks() {
    const currentTime = Date.now();
    const tasks = await fetchTasks(); // Hypothetical function to fetch running tasks
    for (const task of tasks) {
        if (currentTime - task.startTime > task.timeout) {
            await clearPendingTasks(task.id); // Clear long-running task
            await notifyAdmins(`Task ${task.id} cleared due to timeout.`); // Notify admins
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkLongRunningTasks(); // Execute the check on each request
        return Response.json({ status: 'Task check completed' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});