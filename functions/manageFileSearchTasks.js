import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TASK_TIMEOUT = 60 * 1000; // 60 seconds

async function manageFileSearchTasks(taskId) {
    const startTime = Date.now();
    let taskCompleted = false;
    while (!taskCompleted) {
        // Simulate the task processing logic here (replace with actual file search logic)
        taskCompleted = false; // Set this to true when the task completes successfully.
        if (Date.now() - startTime > TASK_TIMEOUT) {
            console.error(`Task ${taskId} exceeded time limit.`);
            // Handle the timeout (e.g., terminate task, log issue, notify admins)
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated processing delay
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const taskId = req.url.split('/').pop(); // Assuming taskId is part of the URL
    try {
        await manageFileSearchTasks(taskId);
        return Response.json({ message: `Task ${taskId} completed successfully.` });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});