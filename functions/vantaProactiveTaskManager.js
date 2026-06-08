import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const tasks = await getStuckTasks(); // Function to fetch all tasks stuck in 'Running'
        for (const task of tasks) {
            await cancelTask(task.id); // Function to cancel the task gracefully
            await restartTask(task.id); // Function to restart the task
        }
        return Response.json({ message: "Stuck tasks have been canceled and restarted." }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function getStuckTasks() {
    // Logic to identify tasks that are stuck (e.g., running for >60 min without output)
}

async function cancelTask(taskId) {
    // Logic to cancel the task safely
}

async function restartTask(taskId) {
    // Logic to restart the task
}