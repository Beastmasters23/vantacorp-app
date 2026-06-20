import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    // Logic to check and clear APT locks
    try {
        const locks = await checkAptLocks();
        if (locks.length > 0) {
            await clearLocks(locks);
            return 'APT locks cleared.';
        }
        return 'No APT locks found.';
    } catch (error) {
        console.error('Failed to clear APT locks:', error);
        throw new Error('Unable to clear APT locks.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const result = await clearAptLocks();
        return Response.json({ message: result }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});