import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function monitorAndCancelStuckTasks(thresholdMinutes) {
    const currentTime = Date.now();
    const tasks = await getActiveTasks(); // This function retrieves currently running tasks
    for (const task of tasks) {
        if (currentTime - task.startTime > thresholdMinutes * 60 * 1000) {
            await cancelTask(task.id); // This function cancels the stuck task
            await notifyAdmins(`Task ${task.id} was cancelled after exceeding the threshold of ${thresholdMinutes} minutes.`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await monitorAndCancelStuckTasks(60); // Monitor tasks every invocation
        return Response.json({ status: 'Monitoring complete' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function getActiveTasks() {
    // Implementation to retrieve active tasks
}

async function cancelTask(taskId) {
    // Implementation to cancel a task by ID
}

async function notifyAdmins(message) {
    // Implementation to notify admins
}