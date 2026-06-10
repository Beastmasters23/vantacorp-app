import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TASK_TIMEOUT_THRESHOLD = 60 * 1000; // 60 seconds

async function checkAndCancelTasks() {
    const runningTasks = await getRunningTasks();
    const now = Date.now();

    for (const task of runningTasks) {
        if (now - task.startTime > TASK_TIMEOUT_THRESHOLD) {
            await cancelTask(task.id);
            console.log(`Cancelled task ${task.id} due to timeout.`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndCancelTasks();
        return Response.json({ message: 'Checked and canceled tasks if necessary' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function getRunningTasks() {
    // Placeholder for actual task retrieval logic
    return [];
}

async function cancelTask(taskId) {
    // Placeholder for actual task cancellation logic
}