import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const EXECUTION_TIMEOUT = 3600; // 1 hour timeout

async function checkLocksAndTimeout() {
    const currentTime = Date.now();
    const tasks = await getRunningTasks(); // hypothetical function to retrieve current running tasks
    for (const task of tasks) {
        if ((currentTime - task.startTime) > EXECUTION_TIMEOUT * 1000) {
            await abortTask(task.id); // hypothetical function to abort a task
            console.log(`Aborted task ${task.id} due to timeout`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkLocksAndTimeout(); // Check for stuck tasks before proceeding
        // Proceed with regular task processing
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});