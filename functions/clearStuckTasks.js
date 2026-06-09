import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearStuckTasks() {
    // This function would implement logic to check for stuck tasks and clear them if needed
    const thresholdMinutes = 60;
    const currentTime = Date.now();

    // Get the list of current tasks (mock implementation)
    const tasks = await getCurrentTasks(); // Assume this is a predefined function

    for (const task of tasks) {
        if (task.status === 'Running' && (currentTime - task.startTime) > thresholdMinutes * 60 * 1000) {
            // Clear the stuck task (mock implementation)
            await clearTask(task.id); // Assume this is a predefined function to clear the task
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearStuckTasks();
        return Response.json({ message: 'Stuck tasks cleared, ready to execute new tasks.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});