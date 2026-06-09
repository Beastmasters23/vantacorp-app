import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MAX_EXECUTION_TIME = 60 * 60 * 1000; // 1 hour

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const taskId = req.headers.get('Task-ID');
    if (!taskId) {
        return Response.json({ error: 'Task-ID header is required.' }, { status: 400 });
    }

    try {
        const startTime = Date.now();
        const taskState = await base44.getTaskStatus(taskId);

        if (taskState === 'running' && (Date.now() - startTime) > MAX_EXECUTION_TIME) {
            await base44.abortTask(taskId);
            await base44.retryTask(taskId);
            return Response.json({ message: 'Task was stuck and has been restarted.' }, { status: 200 });
        }
        return Response.json({ message: 'Task is functioning normally.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});