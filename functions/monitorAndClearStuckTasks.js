import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearStuckTasks(base44) {
    // Fetch current running tasks
    const runningTasks = await base44.getRunningTasks();

    for (const task of runningTasks) {
        // Check task duration against timeout limits
        if (task.duration > 3600) { // 1 hour limit
            await base44.cancelTask(task.id); // cancel it
            console.log(`Cancelled stuck task ${task.id}.`);
        }
        // Check for active locks on resources, clear if necessary
        const lockStatus = await base44.checkLocks(task.resources);
        if (lockStatus.hasActiveLocks) {
            await base44.clearLocks(task.resources);
            console.log(`Cleared locks for task ${task.id}.`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearStuckTasks(base44);
        return Response.json({ status: 'Monitoring completed' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});