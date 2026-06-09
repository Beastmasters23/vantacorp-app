import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearStalledTasks() {
    const commonCommands = ['cat', 'echo', 'ls'];
    const taskTimeoutThreshold = 300;
    const tasks = getTasks(); // Mock function to retrieve running tasks

    // Check for command availability
    for (const command of commonCommands) {
        const isAvailable = await checkCommandAvailability(command);
        if (!isAvailable) {
            console.error(`Command ${command} is not available. Ensure it is installed`);
        }
    }

    // Auto-clear stalled tasks
    for (const task of tasks) {
        if (task.duration > taskTimeoutThreshold) {
            console.warn(`Clearing stalled task: ${task.id}`);
            clearStalledTask(task.id); // Mock function to clear the task
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearStalledTasks();
        return Response.json({ status: 'success' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});