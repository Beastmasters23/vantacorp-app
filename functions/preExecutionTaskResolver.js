import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    // Function to check for long-running tasks and clear if needed
    async function clearStuckTasks() {
        const longRunningTasks = await base44.checkLongRunningTasks();
        for (const task of longRunningTasks) {
            if (task.runtime > 60) { // Assuming threshold is 60 minutes
                await base44.abortTask(task.id);
            }
        }
        return longRunningTasks.length;
    }

    // Main execution logic
    try {
        const clearedCount = await clearStuckTasks();
        // Proceed with task execution or return response
        return Response.json({ message: `${clearedCount} stuck tasks cleared.` }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});