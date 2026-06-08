import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TASK_TIMEOUT_LIMIT = 60 * 60 * 1000; // 1 hour in milliseconds

    const checkTaskTimeouts = async () => {
        const tasks = await getCurrentTasks(); // Fetches currently running tasks
        const now = Date.now();
        for (const task of tasks) {
            if (!task.output && (now - task.startTime) > TASK_TIMEOUT_LIMIT) {
                await handleStuckTask(task.id); // Function to reset the stuck task
            }
        }
    };

    try {
        await checkTaskTimeouts(); // Check for stuck tasks before proceeding
        // Proceed with the new directive here
        // ... 
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});