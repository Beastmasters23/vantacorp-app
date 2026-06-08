import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const taskTimeout = 60 * 1000; // 60 seconds
    const monitoringTasks = new Map();

    async function monitorTask(taskId, startTime) {
        while (true) {
            if (Date.now() - startTime > taskTimeout) {
                console.log(`Task ${taskId} exceeded time limit and will be terminated.`);
                // Here, implement logic to cancel task if possible
                // (Placeholder for actual cancellation logic)
                monitoringTasks.delete(taskId);
                return;
            }
            await new Promise((res) => setTimeout(res, 10000)); // Check every 10 seconds
        }
    }

    try {
        const taskId = base44.id; // Assume task ID can be derived from request
        // Start monitoring task execution time
        monitoringTasks.set(taskId, Date.now());
        monitorTask(taskId, monitoringTasks.get(taskId)).catch(console.error);
        // Execute the task logic...
        // Once complete, remove it from monitoring
        monitoringTasks.delete(taskId);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});