import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TASK_TIMEOUT_THRESHOLD = 60 * 1000; // 60 seconds timeout threshold

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const tasks = await base44.getRunningTasks(); // Fetch currently running tasks
        const currentTime = Date.now();
        const timeoutTasks = [];

        for (const task of tasks) {
            if (currentTime - task.startTime >= TASK_TIMEOUT_THRESHOLD) {
                timeoutTasks.push(task);
            }
        }

        // Handle timed-out tasks
        if (timeoutTasks.length > 0) {
            for (const task of timeoutTasks) {
                await base44.killTask(task.id); // Terminate the long-running task
                await base44.logTaskState(task.id, { status: 'failed', reason: 'Timeout exceeded' }); // Log the last state
            }
            return Response.json({ message: 'Timed out tasks handled', details: timeoutTasks }, { status: 200 });
        }

        return Response.json({ message: 'No long-running tasks detected' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});