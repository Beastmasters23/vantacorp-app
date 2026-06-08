import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TASK_TIMEOUT_THRESHOLD = 60 * 1000; // 60 seconds

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const taskId = req.headers.get('task-id');

    try {
        const taskStartTime = Date.now();
        const taskExecution = await startTask(); // Hypothetical function for starting a task

        let taskAlive = true;
        const timeoutHandler = setTimeout(() => {
            taskAlive = false;
            terminateTask(taskId); // Hypothetical function to terminate a task
            console.warn(`Task ${taskId} exceeded timeout and has been terminated.`);
        }, TASK_TIMEOUT_THRESHOLD);

        // Wait for task completion 
        const result = await taskExecution;
        if (taskAlive) {
            clearTimeout(timeoutHandler);
            return Response.json({ result });
        }
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function startTask() {
    // Simulated task execution logic here
    return new Promise((resolve) => setTimeout(resolve, 10000)); // Simulates a task that runs for 10 seconds
}

function terminateTask(taskId) {
    // Logic to end a task
}