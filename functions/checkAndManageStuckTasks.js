import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const currentTime = Date.now();
        const maxAllowedTime = 60 * 60 * 1000; // 60 minutes in milliseconds
        const stuckTasks = [];

        // Check currently running tasks (pseudo code)
        const tasks = await getCurrentTasks();

        for (const task of tasks) {
            if (currentTime - task.startTime > maxAllowedTime) {
                stuckTasks.push(task);
                // Log the stuck task (pseudo code)
                await logStuckTask(task);
                // Terminate the stuck task (pseudo code)
                await terminateTask(task.id);
            }
        }

        if (stuckTasks.length) {
            // Notify admins about stuck tasks (pseudo code)
            await notifyAdmins(stuckTasks);
        }

        return Response.json({ message: 'Checked and managed stuck tasks.', stuckTasks }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});