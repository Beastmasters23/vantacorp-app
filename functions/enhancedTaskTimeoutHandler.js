import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const timeoutThreshold = 60 * 60 * 1000; // 60 minutes in milliseconds

        // Periodically check running tasks and implement timeout handling
        setInterval(async () => {
            const tasks = await base44.getRunningTasks();
            const currentTime = Date.now();

            for (const task of tasks) {
                if (currentTime - task.startTime > timeoutThreshold) {
                    await base44.terminateTask(task.id);
                    console.error(`Terminated stuck task: ${task.id} due to timeout.`);
                    await base44.notifyAdmins(`Task ${task.id} was terminated due to timeout after exceeding threshold.`);
                }
            }
        }, 5 * 60 * 1000); // Check every 5 minutes

        return Response.json({ success: true }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});