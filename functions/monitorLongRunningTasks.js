import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TASK_CHECK_INTERVAL = 30000; // Check every 30 seconds

async function monitorTasks() {
    // Logic to check for running tasks
    const runningTasks = await getRunningTasks(); // Replace with actual logic

    for (const task of runningTasks) {
        const taskOutput = await checkTaskOutput(task); // Replace with actual output check
        if (!taskOutput && task.runningTime > 60 * 1000) { // 60 seconds threshold
            await clearStuckTask(task); // Replace with actual clearing logic
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        setInterval(monitorTasks, TASK_CHECK_INTERVAL);
        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});