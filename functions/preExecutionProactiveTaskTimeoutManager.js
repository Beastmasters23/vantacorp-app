import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TIMEOUT_THRESHOLD = 60 * 1000; // 60 seconds timeout threshold

async function checkRunningTasks() {
    // Function to simulate fetching currently running tasks
    const runningTasks = await fetchRunningTasks();
    return runningTasks.filter(task => task.startTime + TIMEOUT_THRESHOLD > Date.now());
}

async function fetchRunningTasks() {
    // Placeholder function mimicking fetching running tasks. Replace with actual implementation.
    return [
        { id: 1, startTime: Date.now() - 65 * 1000 }, // Stuck
        { id: 2, startTime: Date.now() - 10 * 1000 } // Running fine
    ];
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const hungTasks = await checkRunningTasks();
        if (hungTasks.length > 0) {
            // Implement logic to clear hung tasks
            for (const task of hungTasks) {
                await clearTask(task.id); // Placeholder function to clear hung task.
            }
        }
        // If no hung tasks, proceed with execution of the new task.
        return Response.json({ message: 'No hung tasks, executing new task.' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function clearTask(taskId) {
    // Placeholder function to simulate clearing a task. Implement actual task clearing logic.
    console.log(`Clearing hung task with ID: ${taskId}`);
}