import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearStuckTasks(taskTimeout = 60) {
    const now = Date.now();
    const activeTasks = await getAllActiveTasks();

    for (const task of activeTasks) {
        if (now - task.startTime > taskTimeout * 60000) {
            await cancelTask(task.id);
        }
    }
}

async function checkAPTAndResources() {
    const isLocked = await checkForAPPLock();
    const hasEnoughResources = await checkSystemResources();
    return !isLocked && hasEnoughResources;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearStuckTasks(); // Clear any stuck tasks based on timeout

        if (await checkAPTAndResources()) {
            // Proceed with the task execution
            return Response.json({ message: 'All systems ready, proceed with task execution.' }, { status: 200 });
        } else {
            return Response.json({ error: 'System not ready, APT lock detected or insufficient resources.' }, { status: 503 });
        }
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});