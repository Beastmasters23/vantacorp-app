import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function recoverStuckTasks() {
    const tasks = await getRunningTasks();
    for (const task of tasks) {
        const output = await checkTaskOutput(task);
        if (!output && task.runtime > 3600) { // 1 hour threshold
            await cancelTask(task);
            await restartTask(task);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await recoverStuckTasks();
        return Response.json({ status: 'Checked for stuck tasks and recovered where necessary.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});