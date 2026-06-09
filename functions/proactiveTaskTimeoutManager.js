import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const tasks = await base44.fetchRunningTasks(); // Fetch running tasks
        const timeoutThreshold = 60 * 1000; // 60 seconds timeout
        let tasksCleared = 0;

        for (const task of tasks) {
            const currentTime = Date.now();
            if (currentTime - task.startTime > timeoutThreshold) {
                await base44.clearTask(task.id); // Clear the task if it exceeds the timeout
                tasksCleared++;
            }
        }

        return Response.json({ success: true, tasksCleared }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});