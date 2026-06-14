import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTAndRunTask(task) {
    // Logic to check and clear APT locks
    const aptLockStatus = await checkForAPTLocks();
    if (aptLockStatus.isLocked) {
        await resolveAPTLock(aptLockStatus);
    }
    // Proceed to run the task
    await runTask(task);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const task = req.body.task; // Assuming task is sent in the body
    try {
        await clearAPTAndRunTask(task);
        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});