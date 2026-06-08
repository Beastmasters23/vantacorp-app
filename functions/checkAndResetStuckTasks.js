import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndResetStuckTasks(maxDuration = 60) {
    const stuckTasks = []; // Array to keep track of stuck tasks
    // Logic to check running tasks and their durations
    const runningTasks = await getRunningTasks(); // hypothetical function to get running tasks
    const now = Date.now();

    for (const task of runningTasks) {
        if (now - task.startTime > maxDuration * 60 * 1000) {
            // Mark task as stuck
            stuckTasks.push(task);
            await resetTask(task.id); // hypothetical function to reset tasks
        }
    }
    return stuckTasks;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const stuckTasks = await checkAndResetStuckTasks();
        return Response.json({ message: 'Checked and reset stuck tasks', stuckTasks });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});