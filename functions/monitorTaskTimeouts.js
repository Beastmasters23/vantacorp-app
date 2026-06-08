import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TIMEOUT_LIMIT = 60 * 1000; // 60 seconds timeout

    const monitorTasks = async () => {
        const tasks = await getCurrentTasks(); // Assume this retrieves active tasks
        for (const task of tasks) {
            if (task.state === 'running' && (Date.now() - task.startTime) > TIMEOUT_LIMIT) {
                await terminateTask(task.id); // Assume this safely terminates the task
                console.log(`Terminated task: ${task.id} due to timeout`);
            }
        }
    };

    // Execute the monitoring function periodically
    setInterval(monitorTasks, 30000); // Every 30 seconds 

    return new Response('Task Monitoring Initialized', { status: 200 });
});