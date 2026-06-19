import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Define a threshold for maximum allowed task duration
        const MAX_TASK_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

        // Function to monitor tasks and cancel if they exceed the time limit
        async function monitorLongRunningTasks() {
            const tasks = await base44.getRunningTasks(); // Hypothetical API to get running tasks
            for (const task of tasks) {
                const taskDuration = Date.now() - task.startTime;
                if (taskDuration > MAX_TASK_DURATION) {
                    console.warn(`Cancelling long-running task: ${task.id}`);
                    await base44.cancelTask(task.id); // Hypothetical API to cancel the task
                }
            }
        }

        // Periodically check for long-running tasks
        setInterval(monitorLongRunningTasks, 300000); // Check every 5 minutes

        // Execute the main logic of the server
        return Response.json({ message: 'Monitoring for long-running tasks initiated.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});