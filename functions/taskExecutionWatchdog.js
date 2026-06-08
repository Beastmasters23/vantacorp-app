import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Define a set of tasks to monitor
        const tasks = await fetchActiveTasks();  // A hypothetical function to fetch running tasks

        // Iterate through each task to check its state
        for (const task of tasks) {
            const currentTime = Date.now();
            const taskStartTime = new Date(task.startTime).getTime();
            const elapsedTime = currentTime - taskStartTime;

            // Check if the task has exceeded the allowed runtime
            if (elapsedTime > 3600000) { // 60 minutes
                await terminateTask(task.id); // A hypothetical function to terminate the task
                console.error(`Terminated task: ${task.id} due to excessive runtime.`);
            }
        }
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});