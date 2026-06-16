import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    // Set the threshold for monitoring long-running tasks
    const LONG_TASK_THRESHOLD = 300000; // 5 minutes in milliseconds

    async function checkAndMonitorLongRunningTasks() {
        const tasks = await getRunningTasks(); // Hypothetical function to retrieve running tasks
        for (const task of tasks) {
            const runningTime = Date.now() - task.startTime;
            if (runningTime > LONG_TASK_THRESHOLD) {
                await alertOperator(task); // Hypothetical function to alert operators
                console.log(`Alert: Task ${task.id} has been running for ${Math.floor(runningTime / 1000)} seconds.`);
            }
        }
    }

    try {
        await checkAndMonitorLongRunningTasks();
        return Response.json({ message: 'Task monitoring initiated.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});