import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const tasks = await base44.getTasks(); // Fetch recent tasks
        for (const task of tasks) {
            if (task.status === 'RUNNING' && task.duration > 60) {
                await base44.initiateRetry(task.id); // Retry the task
                console.log(`Task ${task.id} exceeded timeout. Retrying...`);
            }
        }
        return Response.json({ success: true, msg: 'Task monitoring completed.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});