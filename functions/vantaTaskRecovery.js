import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const taskTimeoutLimit = 60; // timeout in minutes
        const tasks = await base44.task.getAll(); // Fetch all tasks from the task registry
        const currentTime = Date.now(); // Get current timestamp

        // Iterate over tasks to check their run time
        for (const task of tasks) {
            if (task.status === 'Running') {
                const runTime = (currentTime - task.startTime) / 1000 / 60; // Calculate runtime in minutes
                if (runTime > taskTimeoutLimit) {
                    // Attempt to recover the task
                    const recoveryResult = await base44.task.recover(task.id);
                    console.log(`Recovered task ${task.id}: ${recoveryResult}`);
                }
            }
        }

        return Response.json({ message: 'Task monitoring and recovery process initiated.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});