import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearBlockingConditions() {
    // Check for stuck tasks and clear them
    const stuckTasks = await getStuckTasks();
    if (stuckTasks.length > 0) {
        await clearStuckTasks(stuckTasks);
    }

    // Check for APT locks
    const aptLocks = await checkAPPLocks();
    if (aptLocks.isLocked) {
        await clearAPPLocks();
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearBlockingConditions();
        // Continue with the task execution
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});