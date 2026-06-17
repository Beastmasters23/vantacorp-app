import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TASK_TIMEOUT = 300; // Timeout duration in seconds

    const manageStuckTasks = async () => {
        // Logic to check for running tasks and their durations
        const runningTasks = await getRunningTasks(); // hypothetical function to get all running tasks

        for (const task of runningTasks) {
            // Check if task exceeds the timeout duration
            if (task.runningTime > TASK_TIMEOUT) {
                // Log the incident
                await logIncident(task.id, 'Task exceeded maximum running time and will be terminated.'); // hypothetical logging function
                // Terminate the stuck task
                await terminateTask(task.id); // hypothetical function to terminate task
            }
        }
    };

    try {
        await manageStuckTasks(); // Call the management function
        return Response.json({ status: 'Checked for stuck tasks' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});