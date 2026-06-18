import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    const TASK_TIMEOUT = 1800; // 30 minutes timeout for tasks

    async function monitorTasks() {
        const tasks = await fetchTasksFromSystem(); // simulated fetch function to get all running tasks

        for (const task of tasks) {
            if (task.state === 'running' && !task.isCompleted) {
                const elapsedTime = Date.now() - task.startTime;
                if (elapsedTime > TASK_TIMEOUT) {
                    await terminateTask(task.id); // simulated terminate task function
                    console.warn(`Task ${task.id} exceeded timeout and was terminated.`);
                }
            }
        }
    }

    setInterval(monitorTasks, 300000); // check every 5 minutes

    try {
        // Initial call to monitor tasks and also during server start
        await monitorTasks();
        return new Response('Task monitoring started.', { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});