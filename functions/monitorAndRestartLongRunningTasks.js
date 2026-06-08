import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
  
Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    // Function to check and restart long-running tasks
    async function monitorAndRestartLongRunningTasks() {
        const tasks = await base44.getRunningTasks();
        const now = Date.now();
        const threshold = 3600000; // 1 hour threshold

        for (const task of tasks) {
            if (now - task.startTime > threshold) {
                await base44.restartTask(task.id);
                console.log(`Restarted task ${task.id} due to exceeding execution time`);
            }
        }
    }
    
    try {
        await monitorAndRestartLongRunningTasks();
        return Response.json({ message: 'Checked and restarted long-running tasks successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});