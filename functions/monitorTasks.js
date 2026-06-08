import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TASK_TIMEOUT_LIMIT = 60; // minutes

    async function monitorTasks(task) {
        if (task.runningFor > TASK_TIMEOUT_LIMIT) {
            console.log(`Task exceeding timeout limit: ${task.id}`);
            // Implement logic to log the error or take action if needed
        }
        // Additional monitoring logic can be added
    }

    async function runTaskWithMonitoring(task) {
        try {
            console.log(`Starting task: ${task.id}`);
            const startTime = Date.now();
            const result = await executeTask(task);
            const runningFor = (Date.now() - startTime) / 1000 / 60; // minutes
            await monitorTasks({ runningFor, id: task.id });
            return result;
        } catch (error) {
            console.error(`Error executing task: ${task.id}`, error);
            return null;  // Handle error appropriately
        }
    }

    async function executeTask(task) {
        // Task execution logic goes here
        return 'Task executed successfully';
    }

    // Example of a task being executed
    const exampleTask = { id: 'exampleTask' };
    await runTaskWithMonitoring(exampleTask);
    return Response.json({ message: 'Task monitoring initiated' });
});