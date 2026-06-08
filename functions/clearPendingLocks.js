import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearPendingLocks() {
    const locks = await checkForLockedAPT();
    if (locks.length > 0) {
        for (const lock of locks) {
            await clearAPTLock(lock);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearPendingLocks(); 
        return Response.json({ message: 'APT locks cleared and ready for task execution.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});