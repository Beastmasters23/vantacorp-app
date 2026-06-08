import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MAX_RUNTIME = 300000; // milliseconds

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    try {
        const ongoingTasks = await checkOngoingTasks();
        for (const task of ongoingTasks) {
            if (task.runningTime > MAX_RUNTIME) {
                await cancelTask(task.id);
                console.log(`Cancelled long-running task: ${task.id}`);
            }
        }
        return Response.json({ status: 'Monitoring ongoing tasks complete.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkOngoingTasks() {
    // This function should retrieve ongoing tasks from your task management system
    return [];
}

async function cancelTask(taskId) {
    // Logic to cancel the long-running task based on taskId
}