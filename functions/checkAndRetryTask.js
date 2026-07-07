import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const MAX_RETRIES = 5;
    const RETRY_DELAY = 2000; // Initial retry delay in milliseconds

    async function checkAndRetryTask(taskId, attempt = 1) {
        const taskStatus = await checkTaskStatus(taskId);

        if (taskStatus === 'FAILED' && attempt <= MAX_RETRIES) {
            console.log(`Retrying task ${taskId} - Attempt ${attempt}`);
            await wait(RETRY_DELAY * attempt);
            return checkAndRetryTask(taskId, attempt + 1);
        } else if (taskStatus === 'SUCCESS') {
            console.log(`Task ${taskId} completed successfully.`);
            return true;
        } else if (taskStatus === 'FAILED') {
            console.error(`Task ${taskId} failed after ${MAX_RETRIES} attempts.`);
            return false;
        } else {
            console.log(`Task ${taskId} is still running. Current status: ${taskStatus}`);
            return false;
        }
    }

    async function wait(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function checkTaskStatus(taskId) {
        // Simulated function to fetch task status, replace with actual logic
        return 'FAILED'; // Placeholder logic for demonstration
    }

    const taskId = 'task-id'; // Replace with actual task ID
    await checkAndRetryTask(taskId);

    return Response.json({ message: 'Task processing finished.' });
});