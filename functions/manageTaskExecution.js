import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAPTLocks();
        await abortLongRunningTasks();
        // Continue with the execution of other functions
        return Response.json({ success: true }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function clearAPTLocks() {
    const locks = await getActiveLocks();
    for (const lock of locks) {
        // Logic to clear lock
        await clearLock(lock);
    }
}

async function abortLongRunningTasks() {
    const taskInfo = await getRunningTasks();
    const currentTime = Date.now();
    for (const task of taskInfo) {
        if (task.startTime && (currentTime - task.startTime) > 3600000) { // 1 hour
            await terminateTask(task);
        }
    }
}
