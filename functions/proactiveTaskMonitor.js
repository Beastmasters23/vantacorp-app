import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Monitor ongoing tasks and automatically restart them if they exceed the execution time threshold
        const TASK_TIMEOUT = 60 * 60 * 1000; // 1 hour timeout

        const checkStuckTasks = async () => {
            const runningTasks = await getRunningTasks(); // Assume this retrieves a list of tasks
            const now = Date.now();
            for (const task of runningTasks) {
                if (now - task.startTime > TASK_TIMEOUT) {
                    await restartTask(task.id); // Assume this restarts the task
                    console.log(`Task ${task.id} has been restarted after exceeding timeout.`);
                }
            }
        };

        // Call the function periodically
        setInterval(checkStuckTasks, 5 * 60 * 1000); // Check every 5 minutes

        return Response.json({ message: "Proactive monitoring initiated" }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});