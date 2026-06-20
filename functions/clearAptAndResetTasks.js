import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTAndResetTasks() {
    // Implement logic to check and clear APT locks
    const aptLocked = await isAptLocked();
    if (aptLocked) {
        await clearAptLock();
        console.log('APT lock cleared.');
    }
    // Check for stalled tasks and reset them
    const stalledTasks = await getLongRunningTasks();
    for (const task of stalledTasks) {
        await resetTask(task);
        console.log(`Resetting stalled task: ${task.id}`);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAPTAndResetTasks();
        return Response.json({ message: 'Tasks audited and reset where needed.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});