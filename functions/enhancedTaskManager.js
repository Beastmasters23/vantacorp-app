import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    const TASK_TIMEOUT_MINUTES = 60;
    const APT_LOCK_CHECK_INTERVAL_MS = 5000;

    async function checkAndClearAptLocks() {
        // Logic to check and clear APT locks goes here
        // For demonstration, returning true to indicate success
        return true;
    }

    async function executeTaskWithRetries(taskFunction, maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const isAptLockCleared = await checkAndClearAptLocks();
                if (!isAptLockCleared) {
                    throw new Error('APT locks could not be cleared.');
                }

                const taskPromise = taskFunction();
                return await Promise.race([
                    taskPromise,
                    new Promise((_, reject) => {
                        setTimeout(() => reject(new Error('Task timed out')), TASK_TIMEOUT_MINUTES * 60 * 1000);
                    })
                ]);
            } catch (error) {
                if (attempt < maxRetries) {
                    console.log(`Retrying task, attempt ${attempt + 1} of ${maxRetries}`);
                    await new Promise((resolve) => setTimeout(resolve, APT_LOCK_CHECK_INTERVAL_MS));
                } else {
                    console.error(`Task failed after ${maxRetries} attempts: ${error.message}`);
                    throw error;
                }
            }
        }
    }

    try {
        const someTask = async () => {
            // Placeholder for the actual task logic
            // If this task takes too long, it will be stopped by the timeout logic
        };

        await executeTaskWithRetries(someTask);
        return Response.json({ status: 'Task completed successfully' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});