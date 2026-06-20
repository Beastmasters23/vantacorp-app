import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkSystemReady() {
    const hasLock = await checkAptLocks(); // Function to check if there are apt locks
    const runningTasks = await getRunningTasks(); // Function to get currently running tasks
    return !hasLock && runningTasks.length < 5; // Check system readiness criteria
}

async function clearStuckTasks() {
    const tasks = await getAllTasks(); // Function to get all tasks
    for (const task of tasks) {
        if (task.status === 'Running' && task.executionTime > 3600) { // 1 hour in seconds
            await resetTask(task.id); // Function to reset a stuck task
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        if (await checkSystemReady()) {
            await clearStuckTasks(); // Clear any stuck tasks
            // Logic to proceed with task execution
            return Response.json({ message: 'System ready, proceeding with task execution.' });
        } else {
            return Response.json({ error: 'System not ready for task execution, please check for locks or excessive running tasks.' }, { status: 503 });
        }
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});