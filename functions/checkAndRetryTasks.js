import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    // Function to check outputs and retry failed tasks
    async function checkAndRetryTasks(taskId) {
        const taskOutput = await base44.getTaskOutput(taskId);
        if (!taskOutput || taskOutput.length === 0) {
            console.error(`Task ${taskId} failed or returned no output. Retrying...`);
            const retryResult = await base44.retryTask(taskId);
            return retryResult;
        }
        return taskOutput;
    }

    try {
        // Example task IDs to check (these would be provided in the actual implementation)
        const taskIds = ['task1', 'task2', 'task3'];
        for (const taskId of taskIds) {
            const result = await checkAndRetryTasks(taskId);
            console.log(`Task ${taskId} result:`, result);
        }

        return Response.json({ message: 'Tasks checked and retried if necessary.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});