import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    async function clearPotentialLocks() {
        const locks = await checkForAPTLocks();
        if (locks) {
            await clearAPTLocks();
        }
    }

    async function taskIsStuck(identifier) {
        const status = await getTaskStatus(identifier);
        return status === 'Running';
    }

    async function executeTask(directive) {
        await clearPotentialLocks();
        const taskId = await startTask(directive);
        const timeout = setTimeout(async () => {
            if (await taskIsStuck(taskId)) {
                console.error(`Task ${taskId} is stuck; initiating recovery.`);
                await recoverTask(taskId);
                clearTimeout(timeout);
            }
        }, 3600000); // 1 hour timeout
    }

    try {
        const directive = await base44.getRequestTask(req);
        await executeTask(directive);
        return Response.json({ result: 'Task executed successfully.' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});