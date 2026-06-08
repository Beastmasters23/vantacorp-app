import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const timeoutThreshold = 60 * 60 * 1000; // 60 minutes in milliseconds
        const maxRetryAttempts = 3; // Max attempts to check/clear tasks

        // Function to monitor and cancel stuck tasks
        async function monitorAndCancelStuckTasks() {
            const tasks = await getRunningTasks(); // Function to retrieve running tasks

            for (const task of tasks) {
                const elapsedTime = Date.now() - task.startTime;
                if (elapsedTime > timeoutThreshold) {
                    const maxAttempts = task.retryCount || 0;
                    if (maxAttempts < maxRetryAttempts) {
                        await cancelTask(task.id);
                        task.retryCount = (task.retryCount || 0) + 1;
                    }
                }
            }
        }

        // Call the monitoring function at intervals
        setInterval(monitorAndCancelStuckTasks, 60000); // Check every minute

        return Response.json({ status: "Monitoring tasks for stuck statuses and attempting to cancel" });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function getRunningTasks() {
    // Placeholder function logic to fetch running tasks
    return [];
}

async function cancelTask(taskId) {
    // Placeholder function logic to cancel a task based on its ID
    console.log(
        `Cancelled task with ID: ${taskId} due to prolonged running time`
    );
}