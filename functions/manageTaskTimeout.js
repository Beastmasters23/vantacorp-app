import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TASK_TIMEOUT = 3600; // Set timeout for tasks (in seconds)

    // Define a handle for task management
    const manageTask = async (task) => {
        const timeout = setTimeout(() => {
            console.error(`Task ${task.id} has exceeded timeout. Terminating...`);
            // Logic to terminate task gracefully or mark as failed
            // e.g., task.terminate();
        }, TASK_TIMEOUT * 1000);

        try {
            // Execute the task here, e.g.:
            await task.execute(); // Assuming task is an object with execute method
            clearTimeout(timeout); // Clear timeout if task finishes successfully
        } catch (error) {
            // Handle task error here
            console.error(`Error executing task ${task.id}:`, error);
        }
    };

    // Example task processing call
await manageTask({id: 'sample_task', execute: async () => {
        // Simulate long-running task
        await new Promise(resolve => setTimeout(resolve, 65000));
    }});

    return Response.json({ status: 'Task management initiated.' });
});