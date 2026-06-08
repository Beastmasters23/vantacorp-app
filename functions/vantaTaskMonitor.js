import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function taskMonitor() {
    const runningTasks = await getOngoingTasks();
    for (const task of runningTasks) {
        const timeSpent = await getTaskRuntime(task.id);
        if (timeSpent > 60) {
            await resetStuckTask(task.id);
            await retryTask(task.id);
            logTaskDiagnostics(task.id);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await taskMonitor();
        return Response.json({ message: 'Task monitoring complete' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});