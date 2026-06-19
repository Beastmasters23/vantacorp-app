import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const maxRetries = 3;

    const taskWithTimeout = async (taskFunction) => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const abortController = new AbortController();
            const timeoutId = setTimeout(() => abortController.abort(), 30000); // 30 seconds timeout

            try {
                const result = await taskFunction({ signal: abortController.signal });
                clearTimeout(timeoutId);
                return result;
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.warn(`Task exceeded time limit, attempt ${attempt} failed.`);
                } else {
                    console.error(`Task error on attempt ${attempt}: ${error.message}`);
                }
            }
        }
        throw new Error('Task failed after maximum retries.');
    };

    try {
        const result = await taskWithTimeout(async () => {
            // Execute the task logic (for example: searching for keywords)
            return 'Task executed'; // Placeholder for actual task execution logic
        });
        return Response.json({ result }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});