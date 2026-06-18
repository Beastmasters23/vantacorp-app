import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TASK_TIMEOUT_THRESHOLD = 60 * 60 * 1000; // 1 hour timeout

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const currentTime = Date.now();

    try {
        const tasks = await base44.fetchRunningTasks(); // Fetch currently running tasks
        const stuckTasks = tasks.filter(task => (currentTime - task.startTime) > TASK_TIMEOUT_THRESHOLD);
        
        // Cancel stuck tasks
        for (const task of stuckTasks) {
            await base44.cancelTask(task.id);
            await base44.logTaskCancellation(task.id, 'Timeout exceeded');
        }
        return Response.json({ success: true, message: `${stuckTasks.length} tasks cancelled due to timeout.` });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});