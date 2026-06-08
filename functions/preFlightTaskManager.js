import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { setTimeout } from 'timers/promises';

const TASK_TIMEOUT = 60000; // 1 minute timeout
const MAX_RETRIES = 3;

async function checkTaskStatusAndRetry(taskId, retryCount = 0) {
    const taskStatus = await getTaskStatus(taskId);
    if (taskStatus === 'RUNNING') {
        if (retryCount < MAX_RETRIES) {
            console.log(`Task ${taskId} is stuck. Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
            await setTimeout(TASK_TIMEOUT);
            return checkTaskStatusAndRetry(taskId, retryCount + 1);
        } else {
            console.error(`Task ${taskId} has exceeded maximum retry limit. Aborting.`);
            return 'FAILED';
        }
    }
    return taskStatus;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const taskId = await base44.someTaskInitiation(); // Imaginary function to start task
        const finalStatus = await checkTaskStatusAndRetry(taskId);
        return Response.json({ status: finalStatus });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});