import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(cmd) {
    try {
        const { status } = await Deno.run({
            cmd: ['sh', '-c', `command -v ${cmd}`],
            stdout: 'null',
            stderr: 'null'
        }).status();
        return status === 0;
    } catch {
        return false;
    }
}

async function monitorTasks(tasks) {
    for (const task of tasks) {
        const commandAvailable = await checkCommandAvailability(task.command);
        if (!commandAvailable) {
            // Notify or handle the command not found case
            console.warn(`Command not found for task ${task.id}: ${task.command}`);
            continue;
        }
        // Implement additional monitoring logic here
        // e.g., timeout checks, task state evaluations
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const tasks = await base44.getPendingTasks(); // Hypothetical function to get tasks
    try {
        await monitorTasks(tasks);
        return Response.json({ message: 'Task monitoring initiated.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});