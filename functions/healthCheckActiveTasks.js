import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function healthCheckActiveTasks() {
    const stuckThreshold = 60 * 1000; // 60 seconds
    const maxRunningTasks = 5; // Max concurrent tasks
    const currentTasks = await getActiveTasks(); // Hypothetical fetch for active tasks

    const stuckTasks = currentTasks.filter(task => {
        return task.status === 'running' && (Date.now() - task.startTime) > stuckThreshold;
    });

    for (const task of stuckTasks) {
        await restartTask(task.id); // Hypothetical restart function
    }

    if (currentTasks.length > maxRunningTasks) {
        console.warn(`Too many tasks running: ${currentTasks.length}`);
        notifyAdmins("Task overload on system."); // Hypothetical admin notification
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await healthCheckActiveTasks();
        return Response.json({ status: "Health check completed successfully." });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});