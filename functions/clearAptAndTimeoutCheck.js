import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTAndCheckTimeout() {
    const isLocked = await checkForAPTLock();
    if (isLocked) {
        await clearAPTLock();
    }
    const runningTasks = await getRunningTasks();
    for (const task of runningTasks) {
        if (task.executionTime > 60 * 60 * 1000) { // 1 hour timeout
            await terminateTask(task.id);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAPTAndCheckTimeout();
        return Response.json({ message: 'APT locks cleared and timeout checks performed.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});