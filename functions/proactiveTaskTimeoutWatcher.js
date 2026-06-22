import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TASK_TIMEOUT_LIMIT = 3600 * 1000; // 1 hour timeout

    try {
        const taskId = base44.get('taskId');
        const startTime = Date.now();

        // Perform the task and monitor its status
        const taskStatus = await base44.executeTask(taskId);
        const elapsed = Date.now() - startTime;

        // Check for task timeout
        if (elapsed > TASK_TIMEOUT_LIMIT) {
            // An error occurred due to exceeding timeout
            await base44.reportError(taskId, 'Task exceeded timeout limit.');
            return Response.json({ error: 'Task timed out, please check the tasks.' }, { status: 500 });
        }

        // Return the task result
        return Response.json({ result: taskStatus });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});