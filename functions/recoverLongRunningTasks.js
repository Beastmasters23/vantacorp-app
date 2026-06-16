import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    // Function to check for and recover long-running tasks
    async function recoverLongRunningTasks(taskRegistry) {
        const THRESHOLD_MINUTES = 60;
        const now = Date.now();

        for (const task of taskRegistry) {
            const elapsed = (now - task.startTime) / 60000; // Convert to minutes
            if (elapsed > THRESHOLD_MINUTES) {
                console.warn(`Task ${task.id} is running for too long (${elapsed} mins). Terminating...`);
                task.terminate();  // Assuming task has a terminate method
                logRecoveryAction(task.id, 'terminated due to timeout');
            }
        }
    }

    // Function to log recovery actions
    function logRecoveryAction(taskId, action) {
        console.log(`Task ${taskId} action taken: ${action}`);
        // Add further logging as needed, possibly to a centralized logging service
    }

    try {
        // Assuming existing task registry to manage states
        const taskRegistry = []; // Replace with actual task tracking mechanism
        await recoverLongRunningTasks(taskRegistry);
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ status: "monitoring completed" });
});