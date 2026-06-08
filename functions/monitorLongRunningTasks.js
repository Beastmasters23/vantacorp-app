import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    const monitorLongRunningTasks = async () => {
        const tasks = await getCurrentRunningTasks(); // Fetch currently running tasks
        const currentTime = Date.now();

        tasks.forEach(async (task) => {
            if (task.startTime && (currentTime - task.startTime) > 60 * 60 * 1000) { // Check if task exceeds 60 minutes
                console.log(`Task ${task.id} is stuck. Attempting to recover...`);
                await terminateTask(task.id); // Attempt to terminate stuck task
                await clearAPTLocksForTask(); // Clear APT locks if any
                console.log(`Task ${task.id} terminated and APT locks cleared.`);
            }
        });
    };

    try {
        await monitorLongRunningTasks();
        return Response.json({ message: 'Monitoring long-running tasks initiated.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});