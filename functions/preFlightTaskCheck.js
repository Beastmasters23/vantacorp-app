import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function preFlightTaskCheck() {
    // Logic to verify that no tasks are currently running on Windows nodes.
    const currentTasks = await listCurrentTasks();
    const runningTasks = currentTasks.filter(task => task.status === 'running');
    return runningTasks.length === 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const canProceed = await preFlightTaskCheck();
        if (!canProceed) {
            throw new Error('Cannot execute the new task: existing tasks are still running.');
        }
        // Execute task logic here after confirming no tasks are running.
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});