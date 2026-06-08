import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    // Check for any active APT lock files
    const lockFiles = ['/var/lib/dpkg/lock', '/var/lib/dpkg/lock-frontend', '/var/cache/apt/archives/lock'];
    for (const lockFile of lockFiles) {
        try {
            const exists = await Deno.stat(lockFile);
            if (exists) {
                // If a lock file exists, attempt to remove it
                await Deno.remove(lockFile);
            }
        } catch (error) {
            // Log error or handle cases where file doesn't exist
            console.error(`No lock file found at ${lockFile}, or cannot remove: ${error.message}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Execute APT lock clearance before tasks execution
        await clearAptLocks();
        return Response.json({ status: 'APT locks cleared.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});