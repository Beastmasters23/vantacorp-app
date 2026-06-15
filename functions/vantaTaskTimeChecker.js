import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TIMEOUT_LIMIT = 3600; // 1 hour

    try {
        // Check and cancel stuck tasks
        const taskStatus = await base44.getTaskStatuses();
        const now = Date.now();

        for (let task of taskStatus) {
            if (task.status === 'Running' && (now - task.startTime) > TIMEOUT_LIMIT * 1000) {
                console.log(`Cancelling stuck task: ${task.id}`);
                await base44.cancelTask(task.id);
            }
        }
        return Response.json({ message: 'Checked and cleared stuck tasks successfully.' });
    } catch (error) {
        console.error('Error while checking tasks:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});