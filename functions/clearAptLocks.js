import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks(): Promise<boolean> {
    // Logic to check and clear any APT locks before executing tasks
    const locks = await checkForAptLocks();
    if (locks) {
        await clearLocks();
        return true;
    }
    return false;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const locksCleared = await clearAptLocks();
        if (!locksCleared) {
            return Response.json({ message: 'No APT locks present, proceeding with task execution.' }, { status: 200 });
        }
        return Response.json({ message: 'APT locks cleared, ready to execute tasks.' }, { status: 200 });
    } catch (error) { 
        return Response.json({ error: error.message }, { status: 500 });
    }
});