import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndRetryTask(taskId) {
    const task = await getTaskById(taskId);
    if (task.status === 'running' && Date.now() - task.startTime > 3600000) { // 1 hour timeout
        await retryTask(taskId);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const tasks = await getStuckTasks(); // Fetch tasks that are potentially stuck
        for (const task of tasks) {
            await checkAndRetryTask(task.id);
        }
        return Response.json({ message: 'Checked for stuck tasks and retried if necessary.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});