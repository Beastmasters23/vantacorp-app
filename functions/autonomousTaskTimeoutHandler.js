import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TASK_TIMEOUT = 60000; // 60 seconds

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    let taskExecution;

    try {
        const startTime = Date.now();
        taskExecution = await base44.runTask();

        // Check task duration
        const duration = Date.now() - startTime;
        if (duration > TASK_TIMEOUT) {
            await base44.handleTaskTimeout();
            return Response.json({ error: 'Task timeout exceeded.' }, { status: 408 });
        }

        return Response.json(taskExecution);
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});