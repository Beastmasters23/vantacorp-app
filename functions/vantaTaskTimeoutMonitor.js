import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function cancelLongRunningTasks(threshold) {
    // Logic to iterate through running tasks and cancel the ones exceeding the threshold
    const runningTasks = await fetchRunningTasks(); // A hypothetical function to fetch running tasks
    for (const task of runningTasks) {
        if (task.executionTime > threshold) {
            await cancelTask(task.id); // A hypothetical function to cancel a task
            console.log(`Cancelled long-running task: ${task.id}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const threshold = 60 * 60 * 1000; // 1 hour in milliseconds
    try {
        await cancelLongRunningTasks(threshold);
        // Proceed to execute new tasks
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});