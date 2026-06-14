import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TASK_TIMEOUT_THRESHOLD = 60 * 1000; // 60 minutes 
    const TIME_ADJUSTMENT_FACTOR = 0.9;

    // Function to adjust timeout based on prior failures
    async function adjustTaskTimeout(taskName) {
        const failureCount = await base44.getFailureCount(taskName);
        if (failureCount > 5) {
            return TASK_TIMEOUT_THRESHOLD * TIME_ADJUSTMENT_FACTOR;
        }
        return TASK_TIMEOUT_THRESHOLD;
    }

    // Main task execution function
    async function executeTask(task) {
        const adjustedTimeout = await adjustTaskTimeout(task.name);
        const start = Date.now();

        const taskPromise = task.run(); // Assume task has a run method

        return Promise.race([
            taskPromise,
            new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Task timed out.')); // Reject after adjusted time
                }, adjustedTimeout);
            }),
        ]);
    }

    // Example task
    const exampleTask = { name: 'exampleTask', run: async () => { /* task logic */ } };

    try {
        await executeTask(exampleTask);
        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});