import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TASK_RUNTIME_LIMIT = 60 * 60 * 1000; // 1 hour in milliseconds

    async function monitorStuckTasks() {
        const tasks = await getRunningTasks(); // Hypothetical function to get current running tasks
        const now = Date.now();

        for (const task of tasks) {
            if (now - task.startTime > TASK_RUNTIME_LIMIT) {
                await rollbackTask(task.id); // Hypothetical function to rollback task
                await notifyAdmins(task); // Notify admins about the stuck task
            }
        }
    }

    setInterval(monitorStuckTasks, 60000); // Check every minute

    try {
        // Your other logic here...
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});