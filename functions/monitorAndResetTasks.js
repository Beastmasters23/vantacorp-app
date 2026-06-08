import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Initialize task parameters
        const taskTimeout = 10 * 60 * 1000; // 10 minutes
        const resetThreshold = 60 * 1000; // 1 minute

        // Monitor and manage stuck tasks
        const monitorTasks = async () => {
            const runningTasks = await getRunningTasks();
            const currentTime = Date.now();

            for (const task of runningTasks) {
                // Check if the task has exceeded the timeout
                if (currentTime - task.startTime > taskTimeout) {
                    // Reset stuck task and log the action
                    await resetTask(task.id);
                    console.log(`Task ${task.id} was reset after exceeding timeout.`);
                }
            }
        };

        // Execution logic
        await monitorTasks();
        return Response.json({ status: "Task monitoring in progress" });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});