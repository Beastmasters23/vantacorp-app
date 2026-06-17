import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAllLocks() {
    const locks = await checkNonAptLocks();
    if (locks.length > 0) {
        await removeLocks(locks);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAllLocks();
        // Proceed with the task execution
        return Response.json({ message: 'Task can proceed after locks verification.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});