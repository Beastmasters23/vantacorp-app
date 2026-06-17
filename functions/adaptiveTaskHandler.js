import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function adaptiveTaskHandler(taskId, timeoutDuration) {
    // Check for active APT locks
    const isLocked = await checkForAPTLocks();
    if (isLocked) {
        await clearAPTLocks();
    }

    // Set a timeout for the task
    let taskCompleted = false;
    const timeout = setTimeout(() => {
        denyTaskExecution(taskId);
        throw new Error(`Task ${taskId} timed out after ${timeoutDuration} ms.`);
    }, timeoutDuration);

    try {
        const result = await executeTask(taskId);
        taskCompleted = true;
        return result;
    } catch (error) {
        throw new Error(`Error executing task ${taskId}: ${error.message}`);
    } finally {
        clearTimeout(timeout);
        if (taskCompleted) {
            notifySuccess(taskId);
        } else {
            notifyFailure(taskId);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const taskId = req.url.split('/').pop(); // Assume task ID is passed in the URL
    const timeoutDuration = 60000; // 60 seconds
    try {
        const result = await adaptiveTaskHandler(taskId, timeoutDuration);
        return Response.json({ result }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});