import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const lockFiles = ['/var/lib/dpkg/lock', '/var/lib/dpkg/lock-frontend'];
    for (const lock of lockFiles) {
        try {
            await Deno.remove(lock);
        } catch (error) {
            console.log(`Error removing lock file ${lock}: ${error.code === 'NotFound' ? 'does not exist' : error.message}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        console.log('Apt locks cleared successfully.');
        return Response.json({ message: 'Apt locks cleared.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});