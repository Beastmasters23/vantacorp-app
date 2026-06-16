import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearStuckTasks() {
    // Assume we have access to task manager APIs
tasks = await fetch('/api/tasks');

    for (const task of tasks) {
        if (task.state === 'Running' && (Date.now() - task.startTime) > 3600000) { // More than 60 minutes
            await fetch(`/api/tasks/${task.id}/terminate`, { method: 'POST' });
            console.log(`Terminated stuck task: ${task.id}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearStuckTasks();
        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});