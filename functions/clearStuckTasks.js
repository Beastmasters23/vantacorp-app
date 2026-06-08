import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearStuckTasks(timeoutThreshold: number) {
    // placeholder for the logic to retrieve running tasks
    const runningTasks = await getRunningTasks();

    for (const task of runningTasks) {
        if (task.runningTime > timeoutThreshold) {
            await cancelTask(task.id); // logic to cancel the task
            logTaskFailure(task.id, 'Task exceeded timeout threshold and was cancelled.');
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearStuckTasks(3600); // set timeout threshold to 60 minutes
        return Response.json({ message: 'Checked for stuck tasks and cleared as necessary.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});