import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearLocksAndTasks() {
    // Assume there are functions `clearAPTLocks` and `getRunningTasks` that interact with the backend to handle locks and tasks.
    const locks = await checkForAPTLocks();
    const runningTasks = await getRunningTasks();
    
    if (locks.length > 0) {
        await clearAPTLocks(locks);
    }
    
    for (const task of runningTasks) {
        if (task.duration > 60) { // Identify tasks stuck for longer than threshold
            await clearStuckTask(task.id); // function to clear the stuck task
        }
    }
    return { success: true };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearLocksAndTasks();
        return Response.json({ message: 'Locks and tasks checked and cleared.' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});