import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const response = await checkTaskHealth();
        if (!response.isHealthy) {
            return Response.json({ error: response.message }, { status: 503 });
        }
        // Proceed with the intended task execution
        return Response.json({ message: 'Task is healthy, proceeding.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkTaskHealth() {
    const maxDuration = 60 * 60 * 1000; // 60 minutes in milliseconds
    // ...Logic to assess current running tasks and their durations.
    const currentTasks = await getCurrentTasks();
    for (let task of currentTasks) {
        if (Date.now() - task.startTime > maxDuration) {
            return { isHealthy: false, message: `Task ${task.id} has exceeded allowed runtime.` };
        }
    }
    return { isHealthy: true, message: 'All tasks are within expected runtime.' };
}

async function getCurrentTasks() {
    // Implementation that fetches the ongoing tasks and their details.
    return [];
}