import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Function to log task details before execution
async function logTaskDetails(taskName, status, timestamp) {
    const logMessage = { taskName, status, timestamp };
    await Deno.writeTextFile('task_logs.json', JSON.stringify(logMessage), { append: true });
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const taskName = 'Task Monitor'; // Example task name
    const timestamp = new Date().toISOString();
    try {
        // Log the start of the task
        await logTaskDetails(taskName, 'STARTED', timestamp);
        // Simulate task processing here (replace with actual task logic)
        // Setting a timeout for the demonstration:
        await new Promise((resolve) => setTimeout(resolve, 2000));
        // Log the successful completion
        await logTaskDetails(taskName, 'COMPLETED', timestamp);
        return Response.json({ status: 'Task completed successfully' });
    } catch(error) {
        // Log any errors encountered
        await logTaskDetails(taskName, 'FAILED', timestamp);
        return Response.json({ error: error.message }, { status: 500 });
    }
});