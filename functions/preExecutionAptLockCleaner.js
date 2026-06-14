import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    // Logic to check and clear APT locks
    const locksPresent = await checkAptLocks();
    if (locksPresent) {
        await clearLocks();
        return true;
    }
    return false;
}

async function adjustTimeoutAndExecute(task) {
    const lockCleared = await clearAptLocks();
    if (lockCleared) {
        // Logic to dynamically adjust timeout for the task execution
        const timeout = computeDynamicTimeout(task);
        return await executeTaskWithTimeout(task, timeout);
    }
    throw new Error("Could not clear APT locks before executing the task");
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const task = await base44.getTask(); // Fetching the task from the request
        const result = await adjustTimeoutAndExecute(task);
        return Response.json({ result }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});