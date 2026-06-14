import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Function to handle long-running tasks with a timeout
        const runTaskWithTimeout = async (taskFunction, timeout) => {
            let timeoutHandle;
            const taskPromise = taskFunction();

            const timeoutPromise = new Promise((_, reject) => {
                timeoutHandle = setTimeout(() => {
                    reject(new Error('Task exceeded the timeout limit. Cancelling...'));
                }, timeout);
            });

            try {
                const result = await Promise.race([taskPromise, timeoutPromise]);
                clearTimeout(timeoutHandle);
                return result;
            } catch (error) {
                clearTimeout(timeoutHandle);
                throw error;
            }
        };

        // Example task function
        const exampleTask = async () => {
            // Simulate a long-running task
            return new Promise(resolve => setTimeout(resolve, 120000)); // 2 mins
        };

        // Execute task with a 60 seconds timeout
        const result = await runTaskWithTimeout(exampleTask, 60000);
        return Response.json({ result }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});