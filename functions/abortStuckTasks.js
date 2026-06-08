import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function abortStuckTasks(threshold) {
    const currentTime = Date.now();
    const tasks = await getRunningTasks(); // Assume this function gets current running tasks

    for (const task of tasks) {
        if (currentTime - task.startTime > threshold) {
            await abortTask(task.id); // Assume this function aborts a task by ID
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TIMEOUT_THRESHOLD_MS = 60000; // 60 seconds
    try {
        await abortStuckTasks(TIMEOUT_THRESHOLD_MS);
        return Response.json({ message: 'Checked and aborted stuck tasks if any were found.' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});