import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TIMEOUT_THRESHOLD = 300;  // 300 seconds timeout for tasks

    // Function to handle task execution with timeout monitoring
    async function executeTaskWithTimeout(taskFunction) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Task execution exceeded time limit. Triggering notification and retries.'));
            }, TIMEOUT_THRESHOLD * 1000);

            taskFunction()
                .then(resolve)
                .catch(reject)
                .finally(() => clearTimeout(timeout));
        });
    }

    // Example task function implementation
    async function exampleTask() {
        // Placeholder for actual task execution code
        await new Promise(res => setTimeout(res, 400 * 1000)); // Simulate long task
        return 'Task completed successfully';
    }

    try {
        const result = await executeTaskWithTimeout(exampleTask);
        return Response.json({ result }, { status: 200 });
    } catch (error) {
        // Notify admins about long running task and log error
        await vantaNotifyAdmins(`Long running task error: ${error.message}`);
        return Response.json({ error: error.message }, { status: 500 });
    }
});