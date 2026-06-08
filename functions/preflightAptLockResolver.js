import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAptLocks() {
    // Check for APT locks and attempt to clear them
    const lockFiles = ['/var/lib/dpkg/lock', '/var/lib/apt/lists/lock'];
    const fs = Deno;

    for (const lockFile of lockFiles) {
        try {
            const stat = await fs.stat(lockFile);
            if (stat.isFile) {
                console.log(`Lock file found: ${lockFile}. Attempting to remove...`);
                await fs.remove(lockFile);
                console.log(`Successfully removed lock: ${lockFile}`);
            }
        } catch (error) {
            if (error.name !== 'NotFound') {
                console.error(`Error checking lock file: ${lockFile} - ${error.message}`);
            }
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Execute APT lock resolver
        await checkAndClearAptLocks();
        return Response.json({ message: 'APT Locks checked and cleared if present.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});