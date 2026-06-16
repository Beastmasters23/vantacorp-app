import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearStuckTasks() {
    const stuckTasks = await getStuckTasks(); // Assume this function retrieves stuck tasks.
    for (const task of stuckTasks) {
        await clearStuckTask(task.id); // Assume this function clears the specified task.
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearStuckTasks();
        return Response.json({ status: 'Checked and cleared stuck tasks' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});