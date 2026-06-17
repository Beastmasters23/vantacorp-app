import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkStuckTasks() {
    const threshold = 60 * 1000; // 60 seconds
    const currentTime = new Date().getTime();
    const stuckTasks = []; // Store identifiers of stuck tasks

    // Here would be the logic to retrieve the running tasks (mockup for demonstration)
    const runningTasks = await getRunningTasks();

    for (const task of runningTasks) {
        const { id, startTime } = task;
        if ((currentTime - startTime) > threshold) {
            stuckTasks.push(id);
            // Logic for terminating stuck tasks or sending notifications could go here
            await terminateTask(id);
        }
    }

    return stuckTasks;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const stuckTaskIds = await checkStuckTasks();
        return Response.json({ success: true, stuckTasks: stuckTaskIds });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});