import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkSystemState() {
    // Check for active APT locks
    const locks = await getActiveLocks();
    if (locks.length > 0) {
        return { error: 'APT locks are active, please resolve them before proceeding.' };
    }

    // Check for lingering tasks
    const staleTasks = await getStaleTasks();
    if (staleTasks.length > 0) {
        return { error: 'There are stale tasks running.' };
    }

    // Check system resource availability (memory, CPU)
    const resourcesAvailable = await checkResources();
    return resourcesAvailable ? { ready: true } : { error: 'Insufficient system resources to execute tasks.' };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const systemCheck = await checkSystemState();
        if (systemCheck.error) {
            return Response.json({ error: systemCheck.error }, { status: 500 });
        }
        // Proceed with task execution if checks passed
        return Response.json({ message: 'System is ready for task execution.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});