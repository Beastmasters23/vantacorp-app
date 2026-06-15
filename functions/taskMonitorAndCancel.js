import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TASK_TIMEOUT = 60 * 60 * 1000; // 1 hour
    const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
    
    try {
        const taskList = await base44.getRunningTasks();
        const timeNow = Date.now();
        for (const task of taskList) {
            if (timeNow - task.startTime > TASK_TIMEOUT) {
                await base44.cancelTask(task.id);
                console.log(`Cancelled stuck task: ${task.id}`);
            }
        }
        return Response.json({ status: 'Task monitoring complete.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});