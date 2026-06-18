import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearStuckTasksAndValidate() {
    // Logic to check the running tasks
    const stuckTasks = await getStuckTasks();
    for (const task of stuckTasks) {
        await clearTask(task.id);
    }
    // Check to ensure all tasks completed correctly
    const failedTasks = await getFailedTasks();
    if (failedTasks.length > 0) {
        await logFailures(failedTasks);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearStuckTasksAndValidate();
        return Response.json({ status: 'Processed' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});