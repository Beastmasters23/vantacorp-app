import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TASK_TIMEOUT_THRESHOLD = 60 * 60 * 1000; // 1 hour in milliseconds

async function monitorLongRunningTasks() {
    const activeTasks = await getActiveTasks(); // Assume this function retrieves current running tasks
    const now = Date.now();
    for (const task of activeTasks) {
        if (task.startTime && (now - task.startTime) > TASK_TIMEOUT_THRESHOLD) {
            await terminateTask(task.id); // Assume this function forcefully terminates the task
            console.log(`Terminated long-running task: ${task.id}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await monitorLongRunningTasks();
        return Response.json({ message: "Monitoring completed" }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});