import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkForStuckTasks() {
    const stuckTaskThreshold = 60 * 60 * 1000; // 1 hour in milliseconds
    const currentTime = Date.now();
    const tasks = await fetchStuckTasks(); // Assume this fetches tasks that are stuck

    for (const task of tasks) {
        if (currentTime - new Date(task.startTime).getTime() > stuckTaskThreshold) {
            // Handle stuck task logic, e.g., logging, auto-retry, etc.
            await handleStuckTask(task);
        }
    }
    return tasks.length === 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const areTasksRunningSmoothly = await checkForStuckTasks();
        if (!areTasksRunningSmoothly) {
            return Response.json({ error: 'System is currently busy with stuck tasks.' }, { status: 503 });
        }
        // Proceed with executing new tasks
        return Response.json({ message: 'Ready to execute tasks.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});