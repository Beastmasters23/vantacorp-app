import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTAndStuckTasks() {
    // Logic to check for APT locks and clear them
    const aptLocksCleared = await clearLocks();
    // Logic to check for stuck tasks and terminate them
    const tasksTerminated = await terminateStuckTasks();
    return { aptLocksCleared, tasksTerminated };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const { aptLocksCleared, tasksTerminated } = await clearAPTAndStuckTasks();
        return Response.json({
            status: 'success',
            aptLocksCleared,
            tasksTerminated
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});