import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MAX_TASK_RUNTIME = 60 * 1000; // 60 seconds timeout

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const ongoingTasks = await base44.getOngoingTasks();

    for (const task of ongoingTasks) {
        if (task.startTime + MAX_TASK_RUNTIME < Date.now()) {
            await base44.cancelTask(task.id, 'Task exceeded maximum runtime. Cancelling for recovery.');
            console.log(`Cancelled task ${task.id} due to timeout`);
        }
    }

    return Response.json({ message: 'Monitoring completed and tasks managed.' }, { status: 200 });
});