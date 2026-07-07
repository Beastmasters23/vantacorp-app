import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearLocksAndCheckTasks() {
    // Logic to clear APT locks - assuming a system command to clear locks
    // Logic to check for long-running tasks
    const runningTasks = await getRunningTasks();
    const longRunningTasks = runningTasks.filter(task => task.duration > TASK_TIMEOUT); // TASK_TIMEOUT defined elsewhere

    if (longRunningTasks.length > 0) {
        // Logic to cancel long-running tasks automatically
        await cancelTasks(longRunningTasks);
    }

    const aptLockStatus = await checkAptLocks();
    return { aptLockStatus, runningTasks: longRunningTasks.length > 0 };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const { aptLockStatus, runningTasks } = await clearLocksAndCheckTasks();
        if (aptLockStatus || runningTasks) {
            return Response.json({ error: 'System is not ready for new tasks due to APT locks or long-running operations.' }, { status: 503 });
        }
        // Proceed to execute actual tasks now that checks cleared
        return Response.json({ success: 'System is ready for new tasks.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});