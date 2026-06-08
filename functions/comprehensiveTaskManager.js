import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TASK_TIMEOUT = 60 * 1000; // 60 seconds timeout
const RETRY_LIMIT = 3;

async function preFlightChecks() {
    // Check for stuck tasks and clear them
    await clearStuckTasks();
    // Additional checks could go here
}

async function clearStuckTasks() {
    // Logic to identify and clear stuck tasks if they exceed the timeout threshold.
}

async function executeTaskWithTimeout(taskFn, retries = RETRY_LIMIT) {
    const taskPromise = taskFn();
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Task timed out')), TASK_TIMEOUT));

    return Promise.race([taskPromise, timeoutPromise]).catch(async (error) => {
        if (retries > 0) {
            // Retry the task if it fails due to timeout
            console.log('Retrying task due to error: ', error.message);
            return executeTaskWithTimeout(taskFn, retries - 1);
        } else {
            throw error;
        }
    });
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await preFlightChecks();
        // Example task to be executed
        const result = await executeTaskWithTimeout(() => someLongRunningOperation());
        return Response.json({ result }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function someLongRunningOperation() {
    // Placeholder for a long running operation that needs monitoring.
}