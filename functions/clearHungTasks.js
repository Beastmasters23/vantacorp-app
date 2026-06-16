import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TASK_TIMEOUT_LIMIT = 60000; // 60 seconds

async function clearHungTasks() {
    const tasks = await getActiveTasks(); // Assume this function retrieves active running tasks
    const now = Date.now();

    for (const task of tasks) {
        if (now - task.startTime > TASK_TIMEOUT_LIMIT) {
            await clearTask(task.id); // Assume this clears the task
            console.log(`Cleared stuck task: ${task.id}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearHungTasks(); // Call function on each request to ensure freshness
        return Response.json({ message: "Monitoring for stuck tasks in progress." });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});