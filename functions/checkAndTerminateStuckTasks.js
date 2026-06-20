import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const timeoutThreshold = 60000; // 60 seconds threshold

async function checkAndTerminateStuckTasks() {
    const currentTasks = await getRunningTasks(); // Mock function to retrieve current running tasks
    for (const task of currentTasks) {
        const taskDuration = Date.now() - taskStartTime(task.id); // Mock function to get task start time
        if (taskDuration > timeoutThreshold) {
            await terminateTask(task.id); // Mock function to terminate the task
            console.log(`Terminated task ${task.id} due to excessive duration`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndTerminateStuckTasks(); // Check for and terminate long-running tasks
        return Response.json({ message: 'Checked for stuck tasks successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});