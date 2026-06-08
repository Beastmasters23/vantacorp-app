import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { vantaTaskMonitor } from './taskMonitor'; // Assuming this is a hypothetical path

const TASK_TIMEOUT_LIMIT = 3600; // Set to 60 minutes

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const tasks = await vantaTaskMonitor.getRunningTasks();
        for (const task of tasks) {
            const elapsed = Date.now() - task.startTime;
            if (elapsed > TASK_TIMEOUT_LIMIT * 1000) { // Convert to milliseconds
                await vantaTaskMonitor.resetStuckTask(task.id); // Hypothetical function to reset the task
                console.log(`Reset stuck task: ${task.id}`);
            }
        }
        return Response.json({ status: 'checked for stuck tasks' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});