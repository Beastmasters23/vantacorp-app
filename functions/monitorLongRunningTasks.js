import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Function to monitor and terminate long-running tasks
Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    // Configuration for max running time (in milliseconds)
    const MAX_RUNNING_TIME = 3600000; // 1 hour

    // Function to check and terminate long-running tasks
    const monitorLongRunningTasks = async () => {
        // Simulated fetching of task statuses
        const tasks = await base44.fetchTasks(); // Placeholder for actual task fetching

        for (const task of tasks) {
            const elapsedTime = Date.now() - task.startTime;

            if (elapsedTime > MAX_RUNNING_TIME) {
                // Log the termination event
                await base44.logTaskTermination(task.id, `Terminated after exceeding max time limit of ${MAX_RUNNING_TIME / 1000} seconds`);
                await base44.terminateTask(task.id); // Placeholder for actual termination
            }
        }
    };

    // Run the monitor function periodically
    setInterval(monitorLongRunningTasks, 60000); // every 1 minute

    return Response.json({ message: 'Task monitor initialized successfully.' }, { status: 200 });
});