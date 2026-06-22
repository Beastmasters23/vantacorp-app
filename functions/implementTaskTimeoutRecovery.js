import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const maxTimeout = 60 * 60 * 1000; // 60 minutes
        const runningTasks = await base44.fetchRunningTasks();
        const now = Date.now();
        const stuckTasks = runningTasks.filter(task => (now - task.startTime) > maxTimeout);

        if (stuckTasks.length > 0) {
            for (const task of stuckTasks) {
                await base44.terminateTask(task.id);
                await base44.logTaskRecovery(task.id, 'Task terminated due to timeout');
            }
            return Response.json({ message: 'Stuck tasks terminated and logged.' }, { status: 200 });
        }
        return Response.json({ message: 'No stuck tasks found.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
