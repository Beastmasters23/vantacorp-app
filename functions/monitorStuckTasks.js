import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const tasks = await base44.getTasks(); // Mock function to get current tasks
        const currentTime = Date.now();
        const stuckTasks = tasks.filter(task => 
            (task.status === 'Running' && (currentTime - task.startTime) > 3600000) // 1 hour
        );

        for (const task of stuckTasks) {
            console.log(`Task ${task.id} has been running for over 60 minutes. Attempting to remedy.`);
            await base44.terminateTask(task.id); // Mock function to terminate the task
            await base44.notifyAdmin(`Task ${task.id} was terminated after exceeding execution time.`);
        }

        return Response.json({ message: 'Task monitoring completed successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});