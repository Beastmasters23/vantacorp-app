import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MAX_RUNTIME_MINUTES = 60;

async function checkAndMonitorTasks() {
    // Placeholder for tracking long-running tasks
    let stuckTasks = await getStuckTasks();
    if (stuckTasks.length > 0) {
        for (const task of stuckTasks) {
            if (task.runtime > MAX_RUNTIME_MINUTES) {
                await cancelTask(task.id);
                await logTaskCancellation(task.id, 'Task exceeded maximum runtime and has been canceled.');
            }
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndMonitorTasks();
        return Response.json({ status: 'Monitoring complete' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});