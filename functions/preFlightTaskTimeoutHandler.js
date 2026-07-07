import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const MAX_RUNNING_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

    async function clearStuckTasks() {
        const tasks = await base44.getTasks(); // Assuming a function to get ongoing tasks
        const now = Date.now();
        for (const task of tasks) {
            if (task.status === 'running' && (now - task.startTime) > MAX_RUNNING_TIME) {
                await base44.cancelTask(task.id); // Assuming a function to cancel the specific task
                console.log(`Cancelled stuck task: ${task.id}`);
                await resolveUnderlyingIssues(); // Function to address potential issues causing task delays
            }
        }
    }

    async function resolveUnderlyingIssues() {
        // Implement logic to check for APT locks, missing files, etc.
        await runAPTChecker();
        await runFileExistenceCheck();
    }

    try {
        await clearStuckTasks();
        return Response.json({ status: 'Checked for stuck tasks and cleared them.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});