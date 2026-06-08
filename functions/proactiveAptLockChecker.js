import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearActiveLocks();
        // Proceed with normal task execution
        return Response.json({ status: 'Task execution can proceed' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function clearActiveLocks() {
    const lockFiles = ['/var/lib/dpkg/lock', '/var/lib/apt/lists/lock', '/var/cache/apt/archives/lock'];
    for (const lockFile of lockFiles) {
        try {
            await Deno.remove(lockFile);
        } catch (e) {
            if (e instanceof Deno.errors.NotFound) {
                // Lock file not found, it's safe
                continue;
            } else {
                console.error(`Unable to clear lock file: ${lockFile}, error: ${e.message}`);
                throw new Error(`Lock clearance failed for: ${lockFile}`);
            }
        }
    }
}