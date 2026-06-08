import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearStuckTasks() {
    const stuckTasks = await fetchStuckTasks(); // Replace with actual logic to fetch stuck tasks
    for (const task of stuckTasks) {
        await cancelTask(task.id); // Implement logic to cancel the task
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearStuckTasks(); // Clear any stuck tasks before new execution
        const input = await req.json(); // Assuming JSON input
        // Execute new directives here, ensuring state is clear
        const output = await performNewDirective(input);
        return Response.json({ success: true, output });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});