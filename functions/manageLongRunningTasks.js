import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearOldTasks(tasks) {
    const now = Date.now();
    const maxDuration = 60 * 60 * 1000; // 60 minutes
    const cleared = [];

    for (const task of tasks) {
        if (now - task.startTime > maxDuration) {
            await cancelTask(task.id);
            cleared.push(task.id);
        }
    }
    return cleared;
}

async function checkForAPT() {
    const locked = await checkAPTStatus();
    return !locked;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const activeTasks = await fetchActiveTasks();
        const clearedTasks = await clearOldTasks(activeTasks);

        if (!await checkForAPT()) {
            return Response.json({ error: 'System is locked by APT, cannot execute tasks.' }, { status: 500 });
        }

        // Proceed with task execution or other logic here
        return Response.json({ success: true, clearedTasks });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});