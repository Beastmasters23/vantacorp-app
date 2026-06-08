import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const APT_TIMEOUT_THRESHOLD = 60 * 1000; // 60 seconds

async function clearLockedTasks() {
    // Check for APT locks and clear them if they exist
    const locked = await checkAndClearAptLocks();
    if (locked) {
        console.log('APT locks cleared for new task execution.');
    }
}

async function checkTaskDuration(task) {
    const startTime = Date.now();
    const timeout = setTimeout(async () => {
        console.log(`Task ${task.id} exceeded timeout. Terminating...`);
        await terminateTask(task.id);
    }, APT_TIMEOUT_THRESHOLD);
    await executeTask(task);
    clearTimeout(timeout);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {  
        await clearLockedTasks();
        const tasks = await getTasksToExecute();
        for (const task of tasks) {
            await checkTaskDuration(task);
        }
        return Response.json({ status: 'success' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});