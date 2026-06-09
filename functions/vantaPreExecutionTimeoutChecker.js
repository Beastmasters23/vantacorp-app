import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const MAX_EXECUTION_TIME = 300; // seconds
        const tasks = await base44.getRunningTasks(); // Hypothetical function to get running tasks
        for (const task of tasks) {
            const executionTime = Date.now() - task.startTime;
            if (executionTime > MAX_EXECUTION_TIME * 1000) {
                await base44.killTask(task.id); // Hypothetical function to kill a task
                console.log(`Killed task ${task.id} due to timeout.`);
            }
        }
        return Response.json({ message: 'Checked for stuck tasks and killed the ones that exceeded execution time.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});