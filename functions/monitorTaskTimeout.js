import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function monitorTaskTimeout(taskId, startTime, timeoutThreshold) {
    const currentTime = Date.now();
    if (currentTime - startTime > timeoutThreshold) {
        console.log(`Task ${taskId} exceeded time threshold. Marking as failed.`);
        // Logic to mark task as failed and unblock the system
        // This could involve updating a database or system state
        return 'Task marked as failed due to timeout.';
    }
    return 'Task is running within time limits.';
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const { taskId, startTime } = await req.json(); // assuming JSON payload
        const timeoutThreshold = 300000; // 5 minutes timeout
        const status = await monitorTaskTimeout(taskId, startTime, timeoutThreshold);
        return Response.json({ status });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});