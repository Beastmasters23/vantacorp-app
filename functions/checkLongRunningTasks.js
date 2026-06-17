import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const MAX_EXECUTION_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

    async function checkLongRunningTasks() {
        const tasks = await base44.getRunningTasks();
        for (const task of tasks) {
            const executionTime = Date.now() - task.startTime;
            if (executionTime > MAX_EXECUTION_TIME) {
                await base44.cancelTask(task.id);
                console.log(`Cancelled long-running task: ${task.id}`);
            }
        }
    }

    try {
        await checkLongRunningTasks();
        return Response.json({ message: 'Task health check completed.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});