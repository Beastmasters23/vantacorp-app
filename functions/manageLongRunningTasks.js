import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function manageLongRunningTasks() {
    const tasks = await getActiveTasks(); // Function to get currently running tasks
    const thresholdInMinutes = 60;
    const now = Date.now();

    tasks.forEach(async (task) => {
        if (task.startTime + thresholdInMinutes * 60 * 1000 < now) {
            console.log(`Terminating stuck task with ID: ${task.id}`);
            await terminateTask(task.id); // Function to gracefully terminate the task
            logTermination(task.id); // Function to log the termination event
        }
    });
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await manageLongRunningTasks();
        return Response.json({ message: 'Task execution management triggered.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});