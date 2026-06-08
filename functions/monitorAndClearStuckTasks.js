import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TIMEOUT_LIMIT = 60 * 1000; // 60 seconds
globalThis.stuckTasks = new Map();

async function checkAndClearStuckTasks() {
    for (const [taskId, startTime] of stuckTasks.entries()) {
        if (Date.now() - startTime > TIMEOUT_LIMIT) {
            console.log(`Clearing stuck task: ${taskId}`);
            // Logic to clear/cancel task
            stuckTasks.delete(taskId);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check for stuck tasks regularly
        setInterval(checkAndClearStuckTasks, 10000); // every 10 seconds

        // Your core logic here (task execution, etc.)

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});