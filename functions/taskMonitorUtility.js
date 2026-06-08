import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const TASK_TIMEOUT = 3600; // 60 minutes

        const checkAndTerminateLongRunningTasks = async () => {
            const runningTasks = await getRunningTasks(); // hypothetical function to get all running tasks
            for (const task of runningTasks) {
                if (task.runningTime > TASK_TIMEOUT) {
                    await terminateTask(task.id); // hypothetical function to terminate a task
                    await notifyAdmins(`Task ${task.id} has been terminated due to exceeding timeout.`);
                }
            }
        };

        // Run the check periodically
        setInterval(checkAndTerminateLongRunningTasks, 60000); // checks every minute

        return Response.json({ success: true, message: 'Task monitoring initialized.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});