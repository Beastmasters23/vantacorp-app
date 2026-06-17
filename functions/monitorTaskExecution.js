import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const retryLimit = 3; // Number of times to retry a stuck task
    const timeoutThreshold = 60 * 1000; // 60 seconds in milliseconds

    async function monitorTaskExecution(directive) {
        const startTime = Date.now();
        let attempt = 0;

        while (attempt < retryLimit) {
            attempt++;
            const taskPromise = executeTask(directive);

            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Task timed out')), timeoutThreshold)
            );

            try {
                await Promise.race([taskPromise, timeoutPromise]);
                console.log(`Task executed successfully on attempt ${attempt}.`);
                return;
            } catch (error) {
                console.warn(`Attempt ${attempt} failed: ${error.message}`);
                if (attempt === retryLimit) {
                    console.error(`All attempts failed for directive: ${directive}`);
                    // Notify admins about the failure
                    await base44.call('vantaNotifyAdmins', { message: `Task failed after ${retryLimit} attempts: ${directive}` });
                }
                // Optionally, wait for some time before retrying
                await new Promise(res => setTimeout(res, 10000)); // wait 10 seconds
            }
        }
    }

    async function executeTask(directive) {
        // Simulated task execution logic
        console.log(`Executing task: ${directive}`);
        // Here implement the real task execution logic
        // throw new Error('Simulated task failure'); // Uncomment to simulate a task failure for testing
    }

    await monitorTaskExecution('Search for entity definitions in the workspace and check the bridge outbox for a reply from Lyra.');
});