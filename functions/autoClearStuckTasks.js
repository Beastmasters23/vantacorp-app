import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearStuckTasks() {
    const stuckThreshold = 60 * 1000; // 60 seconds threshold
    const currentTime = Date.now();
    const tasks = await getRunningTasks();

    tasks.forEach(task => {
        if (currentTime - task.startTime > stuckThreshold) {
            clearTask(task.id); // Custom function to clear the task
        }
    });
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearStuckTasks();
        return Response.json({ message: 'Checked and cleared stuck tasks if any.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});