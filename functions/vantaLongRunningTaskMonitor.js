import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function validateAndResetLongRunningTasks(taskId, taskDuration, output) {
    const VALID_OUTPUTS = ['expectedOutput1', 'expectedOutput2'];
    if (taskDuration > 60 * 60) { // 60 minutes threshold
        // Reset task if it is running too long
        await resetTask(taskId);
        return 'Task reset due to timeout';
    }
    if (!VALID_OUTPUTS.includes(output)) {
        await resetTask(taskId);
        return 'Task reset due to invalid output';
    }
    return null; // Task is fine
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const taskId = req.headers.get('task-id');
    const taskDuration = parseInt(req.headers.get('task-duration'));
    const output = req.headers.get('output');
    try {
        const result = await validateAndResetLongRunningTasks(taskId, taskDuration, output);
        return Response.json({ result }, { status: 200 });
    } catch (error) { 
        return Response.json({ error: error.message }, { status: 500 });
    }
});