import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTAndCheckStatus() {
    // Logic to clear APT locks...
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check if there are APT locks
        await clearAPTAndCheckStatus();

        const tasks = await base44.getTasks();
        const tasksInProgress = tasks.filter(task => task.status === 'running');

        if (tasksInProgress.length > 0) {
            return Response.json({ error: 'Tasks are still running. Please try again later.' }, { status: 400 });
        }

        // Proceed with new task execution...
        // Logic to execute new tasks
        return Response.json({ message: 'Tasks executed successfully.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});