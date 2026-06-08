import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function resetStuckTasks() {
    const currentTasks = await getCurrentRunningTasks(); // hypothetical function to get tasks
    const timeoutThreshold = 60 * 60 * 1000; // 1 hour in milliseconds

    for (const task of currentTasks) {
        if (task.startTime < Date.now() - timeoutThreshold) {
            await resetTask(task.id); // hypothetical reset function
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await resetStuckTasks();
        return Response.json({ status: 'Success' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});