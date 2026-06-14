import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MAX_EXECUTION_TIME = 60 * 1000; // 1 minute timeout for tasks

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const tasks = await base44.fetchTasks(); // Fetch all tasks from the system
    
    for (const task of tasks) {
        if (task.status === 'Running' && (Date.now() - task.startTime) > MAX_EXECUTION_TIME) {
            await base44.killTask(task.id); // Forcefully terminate stuck tasks
            console.log(`Terminated stuck task: ${task.id}`);
        }
    }

    return Response.json({ status: 'Completed task checks and terminated stuck tasks.' });
});