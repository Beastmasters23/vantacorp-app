import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TIMEOUT_LIMIT = 60 * 1000; // 60 seconds timeout limit

async function clearStuckTasks() {
    const currentTime = Date.now();
    const tasks = await getAllRunningTasks(); // Function to fetch all running tasks
    for (const task of tasks) {
        if (currentTime - task.startTime > TIMEOUT_LIMIT) {
            await cancelTask(task.id); // Function to cancel the task
            console.log(`Cancelled stuck task: ${task.id}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearStuckTasks(); // Run the stuck task monitoring function
        return Response.json({ message: 'Stuck task monitoring executed.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});