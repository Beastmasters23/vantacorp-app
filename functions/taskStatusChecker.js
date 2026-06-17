import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const taskID = req.url.split('/').pop();  // Assuming task ID is the last segment in URL
        const taskStatus = await getTaskStatus(taskID); // Function to get previous task status
        if (taskStatus.exitCode !== 0) {
            console.log(`Task ${taskID} failed with exit code ${taskStatus.exitCode}. Error: ${taskStatus.error}`);
            return Response.json({ message: 'Task failed', error: taskStatus.error }, { status: 500 });
        }
        // Continue with regular task execution.
        return Response.json({ message: 'Task execution successful' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function getTaskStatus(taskID) {
    // Placeholder function to simulate retrieval of task status.
    // In practice, this function would check a log or database for task results.
    return { exitCode: 1, error: 'No output available' };  // Simulating a failed task as an example
}