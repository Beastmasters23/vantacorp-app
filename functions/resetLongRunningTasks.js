import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function resetLongRunningTasks() {
    const stuckTasks = await checkForStuckTasks();
    if (stuckTasks.length > 0) {
        await resetTasks(stuckTasks);
        console.log('Resetting stuck tasks:', stuckTasks);
    }
}

async function checkForStuckTasks() {
    // Logic to check for tasks that have exceeded runtime limits
    const threshold = 60 * 60 * 1000; // 60 minutes in milliseconds
    const tasks = await getRunningTasks();
    return tasks.filter(task => (new Date() - new Date(task.startTime)) > threshold);
}

async function resetTasks(tasks) {
    for (const task of tasks) {
        // Logic to reset each task, depending on the system's API
        await task.reset();
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await resetLongRunningTasks();
        return Response.json({ message: 'Checked for stuck tasks and reset if necessary.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});