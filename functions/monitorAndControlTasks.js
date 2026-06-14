import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TASK_TIMEOUT_MINUTES = 30; // define a suitable timeout period

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const taskId = await base44.getTaskId(); // hypothetical function to get current task ID
        const startTime = new Date();

        // Start the task and monitor its progress
        const taskResult = await base44.runTask(); // hypothetical function to run the task

        const endTime = new Date();
        const duration = (endTime - startTime) / (1000 * 60); // duration in minutes

        if (duration > TASK_TIMEOUT_MINUTES) {
            await base44.failTask(taskId, 'Task exceeded timeout limit.'); // hypothetical function to fail a task
            return Response.json({ error: 'Task has been terminated due to timeout.' }, { status: 500 });
        }

        return Response.json({ result: taskResult }, { status: 200 });

    } catch(error) { 
        return Response.json({ error: error.message }, { status: 500 });
    }
});