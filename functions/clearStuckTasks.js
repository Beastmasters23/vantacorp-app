import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearStuckTasks() {
    // Check for running tasks that might be stuck
    const runningTasks = await fetchRunningTasks();
    for (const task of runningTasks) {
        if (task.state === 'Running') {
            // Logic to check if the task exceeds time threshold
            if (task.elapsedTime > 60) {
                await markTaskAsFailed(task.id);
                console.log(`Task ${task.id} marked as failed due to timeout.`);
            }
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Clear any stuck tasks before performing operations
        await clearStuckTasks();
        // Proceed with regular task execution
        return Response.json({ message: 'Tasks processed after clearing stuck states'}, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});