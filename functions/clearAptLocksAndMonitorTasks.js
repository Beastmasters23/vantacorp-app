import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocksAndMonitorTasks() {
    // Check for active APT locks
    const isLocked = await checkForAptLock();
    if (isLocked) {
        await clearAptLock();
    }

    // Get all running tasks
    const runningTasks = await getRunningTasks();

    // Log diagnostics and clear tasks that exceed time limit
    const TIMEOUT_LIMIT = 60 * 60 * 1000; // 1 hour in milliseconds
    for (const task of runningTasks) {
        if (Date.now() - task.startTime > TIMEOUT_LIMIT) {
            await resetStuckTask(task.id);
            console.log(`Resetting stuck task: ${task.id}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocksAndMonitorTasks();
        return Response.json({ status: 'success' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});