import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTLocks() {
    // Logic to check and clear APT locks on Windows nodes
    const locksExist = await checkForLocks();
    if (locksExist) {
        await clearLocks();
        return true;
    }
    return false;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const locksCleared = await clearAPTLocks();
        if (!locksCleared) {
            return Response.json({ message: "No APT locks found, ready for execution." }, { status: 200 });
        }
        return Response.json({ message: "APT locks cleared, ready for task execution." }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});