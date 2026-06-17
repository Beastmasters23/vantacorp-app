import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function timeoutHandler(task, timeout) {
    const promise = task(); // Execute the task
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Task exceeded time limit')), timeout));
    return Promise.race([promise, timeoutPromise]);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    // Wrap your existing task directives in the timeoutHandler function
    try {
        await timeoutHandler(async () => {
            // Example task: Replace this with actual task logic. 
            // You would wrap the existing task execution logic here.
            console.log('Executing task...'); 
            // Simulate task duration (for testing)
            await new Promise(resolve => setTimeout(resolve, 70000)); 
        }, 60000); // Set the timeout to 60 seconds
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ message: 'Task completed successfully.' });
});