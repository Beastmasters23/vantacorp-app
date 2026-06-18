import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    let retries = 5;
    const timeout = 30000; // 30 seconds timeout for each attempt

    async function clearAptLocks() {
        const lockCheck = await base44.executeCommand('check_apt_locks');
        if (lockCheck.hasLocks) {
            await base44.executeCommand('clear_apt_locks');
        }
    }

    async function executeTaskWithRetry(task) {
        for (let attempt = 0; attempt < retries; attempt++) {
            await clearAptLocks();
            const result = await base44.executeCommand(task);
            if (result.success) {
                return result;
            } else if (result.error === 'TASK_STUCK') {
                console.warn('Task was stuck, retrying...');
                await new Promise(res => setTimeout(res, timeout)); // wait before retrying
            } else {
                throw new Error(result.error);
            }
        }
        throw new Error('Max retries reached for task execution');
    }

    try {
        // Example task execution
        const taskResult = await executeTaskWithRetry('your_directive_here');
        return Response.json(taskResult);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});