import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function monitorTask(taskId) {
    // Function to check task status and log outcomes
    try {
        const taskStatus = await getTaskStatus(taskId);
        if (taskStatus === 'stuck') {
            alertAdmins(`Task ${taskId} is stuck. Initiating recovery.`);
            // Attempt to recover the task
            const recoverySuccessful = await recoverStuckTask(taskId);
            if (!recoverySuccessful) {
                throw new Error(`Failed to recover task ${taskId}`);
            } else {
                logTaskRecovery(taskId);
            }
        }
    } catch (error) {
        logError(`Error monitoring task ${taskId}: ${error.message}`);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const taskId = base44.get('taskId');
        await monitorTask(taskId);
        return Response.json({ status: 'Monitoring initiated' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});