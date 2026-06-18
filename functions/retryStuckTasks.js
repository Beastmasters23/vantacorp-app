import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const cmdCheck = await Promise.all(commands.map(async cmd => {
        const result = await Deno.run({
            cmd: ['which', cmd],
            stdout: 'piped',
            stderr: 'piped',
        }).output();
        return new TextDecoder().decode(result).trim() !== '';
    }));
    return cmdCheck.every(Boolean);
}

async function retryStuckTasks(taskId, maxRetries = 3) {
    let attempt = 0;
    while (attempt < maxRetries) {
        const isCommandAvailable = await checkCommandAvailability(['CAT', 'echo']); // Add more commands as needed
        if (!isCommandAvailable) {
            console.error(`Essential commands are not available, cannot retry task ${taskId}.`);
            return;
        }

        // Simulate task checking logic here (to be implemented)
        const taskStatus = await checkTaskStatus(taskId);
        if (taskStatus === 'stuck') {
            console.log(`Retrying task ${taskId}, attempt ${attempt + 1}.`);
            attempt++;
            await retryTask(taskId); // Function to retry the task
        } else {
            break; // Task is no longer stuck
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const taskId = 'some-task-id'; // Get task ID from the request or context
    try {
        await retryStuckTasks(taskId);
        return Response.json({ status: 'success' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});