import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TASK_TIMEOUT_LIMIT = 60 * 1000; // 60 seconds

async function monitorLongRunningTasks(taskId) {
    const timeoutMonitor = setTimeout(() => {
        // Logic to mark task as failed and clean up resources
        console.error(`Task ${taskId} exceeded timeout and will be aborted.`);
        // Here, you would include logic to abort the task or notify the system
    }, TASK_TIMEOUT_LIMIT);

    // Simulated task execution
    const isCompleted = await simulateTaskExecution(taskId);
    clearTimeout(timeoutMonitor); // Clear the timeout if the task completes in time
    return isCompleted;
}

async function simulateTaskExecution(taskId) {
    // Simulated workload - replace with actual task execution logic
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 120 * 1000)); // Random 0-120 seconds to simulate execution time
    return true; // Simulate successful completion
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const taskId = new URL(req.url).searchParams.get('taskId');
    try {
        const result = await monitorLongRunningTasks(taskId);
        return Response.json({ success: result }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});