import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // List all currently running tasks
        const runningTasks = await checkRunningTasks();
        const stuckTasks = runningTasks.filter(task => task.duration > 60 * 1000); // Filter tasks stuck for more than 60 seconds

        // Attempt to reset or log stuck tasks
        for (const task of stuckTasks) {
            await resetStuckTask(task.id);
            console.log(`Resetting stuck task: ${task.id}`);
        }

        return Response.json({ message: 'Processed running tasks', stuckTasks: stuckTasks.map(t => t.id) }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkRunningTasks() {
    // Implement logic to retrieve running tasks
    // Placeholder for actual logic
    return [
        { id: 'task1', duration: 62000 },
        { id: 'task2', duration: 30000 }
    ];
}

async function resetStuckTask(taskId) {
    // Implement logic to reset stuck task
    // Placeholder for actual logic
    console.log(`Task ${taskId} has been reset.`);
}