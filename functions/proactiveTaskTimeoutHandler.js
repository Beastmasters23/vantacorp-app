import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await vantaTaskPoll();  
        const startedAt = Date.now();
        const timeoutLimit = 60 * 60 * 1000; // 1 hour timeout

        const task = await vantaRunTask(); // This is your task execution function

        // Poll the task status or wait for completion
        while (Date.now() - startedAt < timeoutLimit) {
            const status = await checkTaskStatus(task.id);
            if (status === 'completed') {
                return Response.json({ result: 'Task completed successfully' });
            }
            await delay(5000); // Delay before polling again
        }

        // Task exceeded timeout limit, perform a rollback and notify
        await vantaRollbackTask(task.id);
        await vantaNotifyAdmins('Task exceeded timeout limit and was rolled back. Task ID: ' + task.id);
        return Response.json({ error: 'Task execution exceeded timeout and was rolled back' }, { status: 500 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}