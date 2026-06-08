import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Retrieve the list of tasks that are running
        const runningTasks = await base44.getRunningTasks();

        // Check each running task for output validity and timeout
        for (const task of runningTasks) {
            const taskTimeout = 60; // Define the timeout threshold
            const currentTime = Date.now();

            if (currentTime - task.startTime > taskTimeout * 1000) {
                // If the task is stuck, reset it
                await base44.resetTask(task.id);
                console.log(`Task ${task.id} was reset due to timeout.`);
            }

            // Additionally check for task output validity
            if (!task.output || task.output.length === 0) {
                // Reset task if output is invalid
                await base44.resetTask(task.id);
                console.log(`Task ${task.id} was reset due to invalid output.`);
            }
        }

        return Response.json({ status: 'Checked all running tasks' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});