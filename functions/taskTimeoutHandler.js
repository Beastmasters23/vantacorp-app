import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TIMEOUT_THRESHOLD = 60 * 1000; // 60 seconds
    const tasksStatus = new Map(); // Map to track task statuses

    try {
        // Monitoring function for long running tasks
        async function monitorTasks(taskId) {
            let isCompleted = false;

            // Check task status every few seconds
            const interval = setInterval(async () => {
                if (!tasksStatus.has(taskId) || (Date.now() - tasksStatus.get(taskId)) > TIMEOUT_THRESHOLD) {
                    console.error(`Task ${taskId} timed out.`);
                    clearInterval(interval);
                    // Terminate the task or take required actions
                    await terminateTask(taskId);
                }
                // Mark task as completed if it finished under the threshold
                else if (isCompleted) {
                    clearInterval(interval);
                }
            }, 5000); // Check every 5 seconds

            return async () => { isCompleted = true; }; // Function to mark task as completed
        }

        async function terminateTask(taskId) {
            // Log the timeout instance or handle the task termination logic
            // Here we can implement the logic to clean up or notify admins if necessary
            console.log(`Handling termination for task: ${taskId}`);
            // Placeholder for task termination logic
        }

        // Example usage
        const taskId = 'exampleTask'; // Here you should assign the real task ID
        tasksStatus.set(taskId, Date.now());
        const markAsCompleted = await monitorTasks(taskId);

        // Simulate task completion or handle task logic here
        // On completion call markAsCompleted();
        // markAsCompleted(); // Uncomment to mark task as completed

    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});