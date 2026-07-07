import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const MAX_RUNTIME = 60 * 1000; // 60 seconds

    async function executeWithTimeout(taskFunction) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), MAX_RUNTIME);
        try {
            await taskFunction();
        } catch (error) {
            console.error('Task interrupted due to timeout or error:', error);
            // Additional logging can be done here
        } finally {
            clearTimeout(timeoutId);
        }
    }

    // Placeholder for the actual task method
    const mockTask = async () => {
        // Simulating a task that could run long
        await new Promise(r => setTimeout(r, Math.random() * 120000)); // up to 120 seconds
    };

    await executeWithTimeout(mockTask);
    return Response.json({ status: 'Task executed with timeout handling' });
});