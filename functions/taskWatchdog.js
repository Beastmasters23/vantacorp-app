import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TASK_TIMEOUT_MS = 300000; // 5 minutes timeout

    const watchTask = async (taskId, taskFunction) => {
        const taskPromise = taskFunction();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Task exceeded execution time limit')), TASK_TIMEOUT_MS)
        );

        return Promise.race([taskPromise, timeoutPromise]);
    };

    try {
        const taskId = base44.getTaskId(); // hypothetical method to get task ID
        await watchTask(taskId, async () => {
            // Execute the task logic here:
            const result = await base44.executeTask(taskId);
            return result;
        });
        return Response.json({ success: true }, { status: 200 });
    } catch(error) {
        console.error(error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});