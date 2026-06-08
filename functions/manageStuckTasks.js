import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await manageStuckTasks();
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ message: 'Stuck tasks management executed successfully.' });
});

async function manageStuckTasks() {
    const maxRuntime = 60 * 60 * 1000; // 1 hour in milliseconds
    const currentTime = Date.now();
    const tasks = await getRunningTasks(); // Assume this function retrieves current running tasks

    for (const task of tasks) {
        if (currentTime - task.startTime > maxRuntime) {
            console.log(`Forcefully clearing task: ${task.id} due to timeout.`);
            await clearTask(task.id); // Assume this function handles task clearance
        }
    }
}

async function getRunningTasks() {
    // Mock function to return running tasks, replace with actual implementation
    return [
        { id: 'task1', startTime: Date.now() - (70 * 60 * 1000) }, // running for 70 minutes
        { id: 'task2', startTime: Date.now() - (30 * 60 * 1000) }  // running for 30 minutes
    ];
}

async function clearTask(taskId) {
    // Logic to clear the task, implementing the force kill of the process or removing from queue
    console.log(`Task ${taskId} cleared.`);
}