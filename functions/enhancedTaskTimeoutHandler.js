import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TASK_TIMEOUT = 300; // default timeout set to 300 seconds
    const customTimeoutMultiplier = 2; // adjust as necessary per task priority

    try {
        const taskExecution = async (taskFunction) => {
            return await Promise.race([
                taskFunction(),
                new Promise((_, reject) => setTimeout(() => {
                    reject(new Error(`Task timed out after ${TASK_TIMEOUT * customTimeoutMultiplier} seconds`));
                }, TASK_TIMEOUT * customTimeoutMultiplier * 1000))
            ]);
        };

        // Example Task
        const executedTask = await taskExecution(async () => {
            // Simulating task execution logic
            await new Promise(resolve => setTimeout(resolve, 200000)); // Simulating long task
            return { success: true };
        });

        return Response.json(executedTask);
    } catch (error) {
        console.error("Task execution failed:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});