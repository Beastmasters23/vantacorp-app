import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TIMEOUT_LIMIT = 3600; // 1 hour
    const CHECK_INTERVAL = 600; // 10 minutes

    const checkLongRunningTasks = async () => {
        // Logic to retrieve all running tasks and their start times
        // Simulated data retrieval
        const runningTasks = await getRunningTasks();
        const now = Date.now();
        for (const task of runningTasks) {
            const elapsedTime = (now - task.startTime) / 1000;
            if (elapsedTime > TIMEOUT_LIMIT) {
                // Notify admin about the long-running task
                await notifyAdmin(task);
                // Take action (e.g., logging, killing the task, etc.)
                await handleStuckTask(task);
            }
        }
    };

    const intervalId = setInterval(checkLongRunningTasks, CHECK_INTERVAL);

    // Graceful stopping of the interval on shutdown
    req.signal.addEventListener('abort', () => {
        clearInterval(intervalId);
    });

    return Response.json({ message: 'Task monitoring initiated' });
});

async function getRunningTasks() {
    // Placeholder for fetching actual running tasks
    return [{ id: 1, startTime: Date.now() - 4000 }, { id: 2, startTime: Date.now() - 3600000 }]; // Simulated tasks
}

async function notifyAdmin(task) {
    // Placeholder for notification logic
    console.log(`Admin notified: Task ${task.id} running too long.`);
}

async function handleStuckTask(task) {
    // Logic to handle task cleanup or force stopping
    console.log(`Handling stuck task ${task.id}.`);
}