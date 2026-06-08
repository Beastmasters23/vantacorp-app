import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function handleTaskTimeout(taskId) {
    // Logic to check task status and retry if needed
    const taskStatus = await getTaskStatus(taskId);
    if (taskStatus === 'Running') {
        await retryTask(taskId);
        console.log(`Task ${taskId} timed out and has been retried.`);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const taskId = req.headers.get('X-Task-Id'); // Assuming task ID is passed in headers
    const timeout = 60 * 1000; // 60 seconds timeout

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();
        handleTaskTimeout(taskId);
    }, timeout);

    try {
        const result = await executeTask(req, { signal: controller.signal }); // Execute the task
        clearTimeout(timeoutId); // Clear the timeout if task completes
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function executeTask(req, options) {
    // Task execution logic
    return {}; // Return the execution result
}

async function getTaskStatus(taskId) {
    // Logic to get the current status of the task
    return 'Running'; // Returning dummy status for demonstration
}

async function retryTask(taskId) {
    // Logic to retry the task execution
}