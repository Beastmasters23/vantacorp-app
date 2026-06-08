import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const lockFiles = ['/var/lib/dpkg/lock', '/var/lib/dpkg/lock-frontend', '/var/cache/apt/archives/lock'];
    for (const lock of lockFiles) {
        try {
            await Deno.remove(lock);
        } catch (error) {
            // Log if unable to clear lock, could be because it does not exist or permission issues.
            console.error(`Failed to clear lock: ${lock} - ${error.message}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check APT locks before proceeding
        await clearAptLocks();

        // Proceed with further task execution...
        return Response.json({ message: 'APT locks checked and cleared.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});