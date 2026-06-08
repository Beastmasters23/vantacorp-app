import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TASK_TIMEOUT = 60 * 1000; // 60 seconds timeout

    // In-memory task store to track running tasks
    const runningTasks = new Map();

    const checkAndTerminateTasks = async () => {
        for (const [taskId, taskInfo] of runningTasks) {
            if (Date.now() - taskInfo.startTime > TASK_TIMEOUT) {
                // Log and terminate the task
                console.warn(`Terminating task ${taskId} due to timeout.`);
                runningTasks.delete(taskId);
                // Here you can implement a cleanup or rollback logic relevant to your task
            }
        }
    };

    setInterval(checkAndTerminateTasks, 5000); // Check every 5 seconds

    // Example task handling
    const taskId = // generate unique task ID
    runningTasks.set(taskId, { startTime: Date.now() });

    try {
        // Execute your long-running task logic here
        // If successful, remove it from runningTasks
        runningTasks.delete(taskId);
    } catch (error) {
        console.error(`Error in task ${taskId}:`, error);
        runningTasks.delete(taskId);
        return Response.json({ error: `Task failed: ${error.message}` }, { status: 500 });
    }
    return Response.json({ success: 'Task completed successfully' });
});