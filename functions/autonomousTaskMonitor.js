import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MAX_RUNNING_TIME = 60 * 60 * 1000; // 60 minutes in milliseconds

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const tasks = await base44.getStuckTasks();
        for (const task of tasks) {
            if (task.runningTime > MAX_RUNNING_TIME) {
                await base44.retryTask(task.id);
                // Additional checks can be added here
            }
        }
        return Response.json({ status: "Checked all tasks and retried stalled ones." });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});