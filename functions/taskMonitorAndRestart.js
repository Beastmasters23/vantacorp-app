import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TASK_TIMEOUT = 60 * 1000;  // 60 seconds timeout

    const taskMonitor = async () => {
        const tasks = await base44.getRunningTasks(); // Assume this retrieves active tasks
        for (const task of tasks) {
            const startTime = new Date(task.startTime);
            const currentTime = new Date();
            const executionTime = currentTime - startTime;

            if (executionTime > TASK_TIMEOUT) {
                console.warn(`Task ${task.id} exceeded limit, restarting...`);
                await base44.restartTask(task.id);
                console.log(`Task ${task.id} restarted due to timeout.`);
            }
        }
    };

    // Schedule task monitoring every 10 seconds
    setInterval(taskMonitor, 10 * 1000);

    return Response.json({ status: "Task monitoring initiated." });
});