import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MAX_STUCK_TIME = 60 * 60 * 1000; // 60 minutes

async function clearStuckTasks() {
    // Logic to check for any tasks that have exceeded max duration
    const stuckTasks = await identifyStuckTasks();

    for (const task of stuckTasks) {
        await clearTask(task);
        console.log(`Cleared stuck task: ${task.id}`);
    }
}

async function identifyStuckTasks() {
    // Replace with real logic to get tasks from your task manager
    const tasks = await getRunningTasks();
    const now = Date.now();
    return tasks.filter(task => (now - task.startTime) > MAX_STUCK_TIME);
}

async function clearTask(task) {
    // Logic to reset or clear the stuck task
    return await resetTask(task.id);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearStuckTasks(); // Call to clear stuck tasks
        return Response.json({ message: 'Checked and cleared stuck tasks if any.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});