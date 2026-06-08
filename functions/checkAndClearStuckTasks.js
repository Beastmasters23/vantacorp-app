import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const response = await checkAndClearStuckTasks();
        return Response.json({ message: 'Stuck tasks checked and cleared if necessary.', response });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkAndClearStuckTasks() {
    const taskThreshold = 60; // threshold in minutes
    const runningTasks = await getRunningTasks(); // Implement this function to retrieve running tasks.
    const now = Date.now();

    for (const task of runningTasks) {
        const taskDuration = (now - task.startTime) / (1000 * 60); // Convert milliseconds to minutes
        if (taskDuration > taskThreshold) {
            await forciblyClearTask(task.id); // Implement this function to forcibly clear the stuck task.
        }
    }
    return { status: 'Checked running tasks for stalls and cleared as necessary.' }; 
}