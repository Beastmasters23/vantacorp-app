import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const OUTPUT_TIMEOUT = 60 * 1000; // 60 seconds

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const tasks = await base44.getStuckTasks();
        for (const task of tasks) {
            if (task.status === 'running' && (Date.now() - task.startTime) > OUTPUT_TIMEOUT) {
                await base44.resetTask(task.id);
                console.log(`Resetting stuck task: ${task.id}`);
            }
        }
        return Response.json({ status: 'checked tasks for output validity' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});