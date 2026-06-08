import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    const asyncTaskRunner = async (task, maxRetries = 3, timeout = 60000) => {
        let attempts = 0;
        const abortController = new AbortController();

        const timeoutId = setTimeout(() => abortController.abort(), timeout);

        while (attempts < maxRetries) {
            try {
                const result = await Promise.race([
                    task(),
                    new Promise((_, reject) => abortController.signal.addEventListener('abort', () => reject(new Error('Task timed out'))))
                ]);
                clearTimeout(timeoutId);
                return result;
            } catch (error) {
                attempts++;
                if (attempts >= maxRetries) {
                    throw new Error(`Task failed after ${maxRetries} attempts: ${error.message}`);
                }
            }
        }
    };

    try {
        // Example task function to be replaced with real tasks. Replace this with the actual tasks to run.
        const exampleTask = async () => {
            // Simulating a task that may fail or succeed.
            return 'Task completed';
        };

        const result = await asyncTaskRunner(exampleTask);
        return Response.json({ success: true, result }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});