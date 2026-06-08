import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearStuckTasks() {
    // Logic to check for stuck tasks and reset them if needed
    const stuckTasks = await checkForStuckTasks();
    await resetStuckTasks(stuckTasks);
}

async function checkForStuckTasks() {
    // Retrieve tasks and identify those that are stuck
    // Mocking the task retrieval for this example
    const tasks = await getCurrentTasks();
    return tasks.filter(task => task.status === 'Running' && task.duration > 60);
}

async function resetStuckTasks(tasks) {
    // Loop through stuck tasks and reset them
    for (const task of tasks) {
        await resetTask(task.id);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearStuckTasks();
        return Response.json({ status: 'Stuck tasks cleared' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});