import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TASK_OUTPUT_TIMEOUT = 30 * 60 * 1000; // 30 minutes timeout

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const runningTasks = {}; // This stores task status

    const checkTaskOutput = async (taskId) => {
        const taskState = runningTasks[taskId];
        if (taskState && (Date.now() - taskState.startTime > TASK_OUTPUT_TIMEOUT)) {
            // Task output check logic
            if (!taskState.output) { // If no output received
                console.log(`Cancelling task ${taskId} due to timeout`);
                // Logic to cancel the task
                delete runningTasks[taskId]; // Clean up task state
                // Logic to rerun the task can be added here
            }
        }
    };

    try {
        // Logic to initiate tasks and store their output state
        // For example:
        const taskId = 'exampleTaskId'; // This should be assigned when initiating the task
        runningTasks[taskId] = { startTime: Date.now(), output: null }; // Initial task state

        // Simulate task running and checking outputs
        setInterval(() => { checkTaskOutput(taskId); }, 10000); // Check every 10 seconds
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});