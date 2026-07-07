import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TASK_TIMEOUT_THRESHOLD = 60 * 60 * 1000; // 60 minutes in milliseconds

    async function checkAndClearStuckTasks() {
        const tasks = await base44.getRunningTasks(); // Hypothetical function to fetch running tasks
        const now = Date.now();

        for (const task of tasks) {
            const timeElapsed = now - task.startTime;
            if (timeElapsed > TASK_TIMEOUT_THRESHOLD) {
                await base44.clearTask(task.id); // Hypothetical function to clear or reinitialize the task
                console.log(`Cleared stuck task: ${task.id}`);
            }
        }
    }

    try {
        await checkAndClearStuckTasks();
        return Response.json({ message: 'Checked for stuck tasks and cleared as necessary.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});