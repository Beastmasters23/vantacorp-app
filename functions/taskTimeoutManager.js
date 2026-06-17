import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    const TASK_TIMEOUT_THRESHOLD = 60 * 1000; // 60 seconds
    const loggedTasks = new Map();

    async function checkAndCancelLongRunningTasks() {
        const currentTime = Date.now();
        for (const [taskID, startTime] of loggedTasks.entries()) {
            if (currentTime - startTime > TASK_TIMEOUT_THRESHOLD) {
                // Logic to cancel the task based on taskID
                console.log(`Cancelling long-running task: ${taskID}`);
                // Add your cancellation logic here, e.g., vantaAutoRetry(taskID);
                loggedTasks.delete(taskID);
            }
        }
    }

    try {
        // Assuming we get a taskID from the request to manage
        const taskID = req.headers.get('task-id');

        if (taskID) {
            // Log the start time of the task
            loggedTasks.set(taskID, Date.now());
            // Function to check and cancel long-running tasks
            await checkAndCancelLongRunningTasks();
            // Execute task logic here
            // Add your task logic here...

            // After completing the task, remove it from logs
            loggedTasks.delete(taskID);
        }
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});