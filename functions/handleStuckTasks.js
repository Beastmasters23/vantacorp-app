import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearStuckTask(taskId) {
    // Logic to clear and restart the stuck task
    console.log(`Clearing and restarting stuck task: ${taskId}`);
    // TODO: Add actual implementation to clear the task
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const stuckTasks = [];

    try {
        // Example logic to fetch stuck tasks based on predefined criteria
        // This would involve checking task age and status
        const tasks = await base44.fetchTasks({ status: 'running', duration: '> 60m' });
        for (const task of tasks) {
            if (task.isStuck()) {
                stuckTasks.push(task.id);
                await clearStuckTask(task.id);
            }
        }
        return Response.json({ success: true, stuckTasks });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});