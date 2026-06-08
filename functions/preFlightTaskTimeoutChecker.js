import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TASK_TIMEOUT_THRESHOLD = 60 * 60 * 1000; // 1 hour in milliseconds

    const checkTaskTimeouts = async () => {
        const tasks = await base44.getRunningTasks(); // Hypothetical function to get running tasks
        const currentTime = Date.now();
        for (let task of tasks) {
            if ((currentTime - task.startTime) > TASK_TIMEOUT_THRESHOLD) {
                await base44.terminateTask(task.id); // Hypothetical function to terminate a task
                console.log(`Terminated task ${task.id} due to timeout.`);
            }
        }
    };

    try {
        await checkTaskTimeouts();
        return Response.json({ message: "Task timeout checked and handled." });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});