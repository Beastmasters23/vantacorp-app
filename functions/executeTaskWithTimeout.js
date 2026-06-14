import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    const TIMEOUT_THRESHOLD = 300; // 300 seconds
    const RETRY_LIMIT = 3; // Allow up to 3 retries

    const executeTaskWithTimeout = async (task, retries = 0) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_THRESHOLD * 1000);

        try {
            const result = await task({ signal: controller.signal });
            clearTimeout(timeoutId);
            return result;
        } catch (error) {
            if (error.name === 'AbortError' && retries < RETRY_LIMIT) {
                console.warn('Task timed out, retrying...', { task, retries });
                return executeTaskWithTimeout(task, retries + 1);
            }
            throw error;
        }
    };

    try {
        const task = async () => await base44.runDirectedTask(); // Example task execution
        const taskResult = await executeTaskWithTimeout(task);
        return Response.json({ result: taskResult });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});