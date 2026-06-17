import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    async function monitorAndRecoverStuckTasks() {
        const tasksToMonitor = await getRunningTasks(); // Function to fetch current running tasks
        const currentTime = Date.now();

        for (const task of tasksToMonitor) {
            if (currentTime - task.startTime > 3600000) { // If task has been running for over 1 hour
                console.warn(`Task ${task.id} is stuck. Recovering...`);
                await recoverTask(task.id); // Function to recover the task
            }
        }
    }

    async function recoverTask(taskId) {
        // Logic to cancel the task and restart it
        await cancelTask(taskId); // Function to cancel the stuck task
        await executeTask(taskId); // Function to execute the task again
    }

    // Regularly monitor for stuck tasks every 5 minutes
    setInterval(monitorAndRecoverStuckTasks, 300000);

    return new Response('Monitoring active tasks for potential recovery.', { status: 200 });
});