import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Proactive task runaway monitor
        const runningTasks = await base44.getRunningTasks();
        const currentTime = Date.now();
        const maxAllowedDuration = 60 * 60 * 1000; // 1 hour in milliseconds

        for (const task of runningTasks) {
            if (currentTime - task.startTime > maxAllowedDuration) {
                console.warn(`Aborting long-running task: ${task.id}`);
                await base44.abortTask(task.id);
            }
        }
        return Response.json({ message: 'Runaway tasks monitored and managed.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});