import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    // Function to validate task execution output
    async function validateTaskOutput(taskId) {
        const taskResponse = await base44.getTaskResponse(taskId);
        if (!taskResponse || taskResponse.error || !taskResponse.output) {
            await base44.resetTask(taskId);
            return { status: 'failed', taskId }; // Mark task for review
        }
        return { status: 'success', taskId }; // Task executed successfully
    }

    const tasksToValidate = ['task1', 'task2', 'task3']; // List of tasks to check
    for (const taskId of tasksToValidate) {
        const validationResponse = await validateTaskOutput(taskId);
        console.log(validationResponse);
    }

    return Response.json({ message: 'Task output validation done.' }, { status: 200 });
});