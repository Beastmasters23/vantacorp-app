import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearStuckTasksAndLocks() {
    // Logic to check for stuck tasks
    let stuckTasks = await checkForStuckTasks();
    for (const task of stuckTasks) {
        await resetTask(task);
    }

    // Logic to check for APT locks
    let aptLocks = await checkForAPTLocks();
    if (aptLocks.length > 0) {
        await clearAPLocks(aptLocks);
        return { message: 'APT locks cleared and stuck tasks reset' };
    }
    return { message: 'No issues detected' };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const result = await clearStuckTasksAndLocks();
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});