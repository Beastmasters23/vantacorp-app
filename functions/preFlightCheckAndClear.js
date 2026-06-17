import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// New function to handle pre-flight checks and clearing apt locks
async function preFlightCheck() {
    // Check for and clear apt locks first
    try {
        // Simulated command to check if apt lock exists
        const aptLocked = await checkAptLocks();
        if (aptLocked) {
            await clearAptLocks();
        }
    } catch (e) {
        console.error('Failed to clear apt locks:', e);
        // You might want to return an error response or handle it accordingly
    }

    // Restarting tasks by checking their state
    const tasks = await getRunningTasks();
    for (const task of tasks) {
        if (task.isRunning && task.startTime < Date.now() - 3600000) { // If task runs for over an hour
            console.warn(`Terminating long running task: ${task.id}`);
            await terminateTask(task.id);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await preFlightCheck();
        return Response.json({ message: 'Pre-flight check complete.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});