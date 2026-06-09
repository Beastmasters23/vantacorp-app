import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const task = req.json();
        // Setting a timeout for long-running tasks
        const timeoutDuration = 300; // seconds
        const taskPromise = executeTask(task);

        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Task execution timed out')), timeoutDuration * 1000);
        });

        const result = await Promise.race([taskPromise, timeoutPromise]);
        return Response.json({ result }, { status: 200 });
    } catch (error) {
        console.error('Error executing task:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function executeTask(task) {
    // Placeholder for actual task execution logic.
    // Implement your task logic here.
}