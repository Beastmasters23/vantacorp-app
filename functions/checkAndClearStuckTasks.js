import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkForStuckTasks() {
    // This function retrieves the current running tasks and checks their status.
    const tasks = await getRunningTasks();
    const stuckTasks = tasks.filter(task => task.status === 'running' && (Date.now() - task.startTime) > 3600000); // more than 60 minutes

    for (const task of stuckTasks) {
        await clearTask(task.id); // Assuming we have a function to clear stuck tasks
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkForStuckTasks();
        // Logic to proceed with new tasks execution here
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});