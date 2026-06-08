import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    const checkStuckTasks = async () => {
        const runningTasks = await fetchRunningTasks(); // Assume this function gets currently running tasks
        const currentTime = Date.now();
        for (const task of runningTasks) {
            if (currentTime - task.startTime > 60 * 60 * 1000) { // More than 60 minutes
                await handleStuckTask(task); // Custom logic to handle stuck task
            }
        }
    };

    const fetchRunningTasks = async () => {
        // Logic to fetch currently running tasks from the system
    };

    const handleStuckTask = async (task) => {
        // Logic to kill or restart the stuck task
        console.log(`Handling stuck task: ${task.id}`);
    };

    try {
        await checkStuckTasks();
        return Response.json({ message: 'Task health check completed.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});