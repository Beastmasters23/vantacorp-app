import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const maxRetries = 3;

    async function executeTaskWithRetry(taskFunction, retriesRemaining) {
        try {
            await taskFunction();
        } catch (error) {
            if (error.message.includes('APT lock')) {
                if (retriesRemaining > 0) {
                    console.log(`Task failed due to APT lock, retrying... (${maxRetries - retriesRemaining + 1})`);
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait before retrying
                    await executeTaskWithRetry(taskFunction, retriesRemaining - 1);
                } else {
                    throw new Error('Task failed after maximum retries due to APT lock.');
                }
            } else {
                throw error; // Re-throw other errors without retrying
            }
        }
    }

    async function runTask() {
        // Sample task function that simulates task execution
        console.log('Executing task...');
        // Simulate APT lock failure for demonstration
        throw new Error('APT lock issue');
    }

    await executeTaskWithRetry(runTask, maxRetries);

    return Response.json({ message: 'Task executed successfully.' });
});