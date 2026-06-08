import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAPTAndTasks(): Promise<boolean> {
    // Logic to check for existing APT locks and running tasks.
    const isLocked = await checkForAPPLock();
    const hasRunningTasks = await hasCurrentRunningTasks();
    return !isLocked && !hasRunningTasks;
}

async function clearAPTLockIfNeeded() {
    const isLocked = await checkForAPPLock();
    if (isLocked) {
        await clearAPPLock();
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAPTLockIfNeeded();
        const isReady = await checkAPTAndTasks();
        if (!isReady) {
            throw new Error('System not ready for new tasks: APT lock or existing tasks detected.');
        }
        // Proceed with task execution here
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});