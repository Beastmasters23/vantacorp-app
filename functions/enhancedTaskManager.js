import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    // Function to enhance task execution by ensuring no resource lock and dynamic timeout handling
    const enhancedTaskManager = async (taskDirective) => {
        const timeoutDuration = 60;  // Standard timeout duration (in minutes)
        let isTaskRunning = false;
        let taskStartTime = Date.now();

        while (isTaskRunning) {
            const currentTime = Date.now();
            const elapsedMinutes = (currentTime - taskStartTime) / (1000 * 60);

            // Check if task exceeds timeout
            if (elapsedMinutes > timeoutDuration) {
                await clearStuckTasks(); // Function to clear any stuck tasks
                throw new Error(`Task timeout exceeded ${timeoutDuration} minutes.`);
            }

            await new Promise(resolve => setTimeout(resolve, 5000)); // wait for 5 seconds before checking again
        }

        // Dynamically clear apt locks and execute the task
        await clearAptLocks();
        const taskOutput = await executeTask(taskDirective); // Function to execute the task
        return taskOutput;
    };

    // Example of executing the enhanced task
    try {
        const result = await enhancedTaskManager('Your task directive here');
        return Response.json({ success: true, data: result });
    } catch (error) {
        return Response.json({ error: error.message }, {status: 500});
    }
});