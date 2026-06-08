import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TASK_TIMEOUT_THRESHOLD = 60 * 1000; // 60 seconds timeout
const TASK_RETRIES = 3;

async function handleLongRunningTask(taskId, executeTask) {
    let attempts = 0;
    let taskStatus = 'Running';

    while (attempts < TASK_RETRIES) {
        const startTime = Date.now();
        const taskPromise = executeTask();

        const timeout = new Promise((_, reject) => setTimeout(() => {
            if (taskStatus === 'Running') {
                reject(new Error(`Task ${taskId} is stuck, resetting...`));
            }
        }, TASK_TIMEOUT_THRESHOLD));

        try {
            await Promise.race([taskPromise, timeout]);
            taskStatus = 'Completed';
            break; // Exit the loop on success
        } catch (error) {
            console.warn(error.message);
            attempts += 1;
            taskStatus = 'Running';
            // Optional: Add logic to clean up or reset state if necessary
        }
    }
    if (taskStatus === 'Running') {
        throw new Error(`Task ${taskId} failed after ${TASK_RETRIES} attempts.`);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const { taskId, directive } = await req.json();
    try {
        await handleLongRunningTask(taskId, async () => {
            // Replace with the actual task execution logic using the directive
            console.log(`Executing task ${taskId} for directive: ${directive}`);
            // Simulated task execution logic ...
            await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate a task duration
            return "Task completed";
        });
        return Response.json({ message: `Task ${taskId} completed successfully.` });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});