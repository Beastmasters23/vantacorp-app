import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkLongRunningTasks() {
    const THRESHOLD_MINUTES = 60;
    // Logic to retrieve tasks from task manager
    // Assuming a function fetchActiveTasks() exists to retrieve current running tasks
    const activeTasks = await fetchActiveTasks();

    activeTasks.forEach(async (task) => {
        const duration = (Date.now() - new Date(task.startTime).getTime()) / (1000 * 60);
        if (duration > THRESHOLD_MINUTES) {
            await notifyAdmins(`Task ${task.id} has been running for ${duration} minutes and will be terminated.`);
            await terminateTask(task.id);
        }
    });
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkLongRunningTasks();
        return Response.json({ message: 'Checked long-running tasks successfully.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});