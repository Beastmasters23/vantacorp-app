import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Monitor the status of ongoing tasks
        const ongoingTasks = await fetchOngoingTasks();

        // Check for stuck tasks
        for (const task of ongoingTasks) {
            if (task.runningTime > 60) { // Assuming runningTime is in minutes
                await cancelTask(task.id);
                logTaskCancellation(task.id, 'Cancelled due to timeout');
            }
        }
        return Response.json({ message: 'Task monitoring executed successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function fetchOngoingTasks() {
    // Simulated function to fetch ongoing tasks from the system
    return [{ id: 'task1', runningTime: 65 }, { id: 'task2', runningTime: 50 }]; // Sample tasks
}

async function cancelTask(taskId) {
    // Simulated function to cancel a given task
    console.log(`Cancelling task: ${taskId}`);
}

function logTaskCancellation(taskId, reason) {
    console.log(`Task ${taskId} cancelled: ${reason}`);
}