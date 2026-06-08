import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const lockFiles = ['/var/lib/dpkg/lock', '/var/lib/dpkg/lock-frontend'];
    for (const lockFile of lockFiles) {
        try {
            const exists = await Deno.stat(lockFile);
            if (exists) {
                console.log(`Removing lock file: ${lockFile}`);
                await Deno.remove(lockFile);
            }
        } catch (error) {
            console.warn(`No lock file found, or unable to remove: ${lockFile}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        // Add additional task execution logic here after ensuring no APT locks are present.
        return Response.json({ message: 'APT locks cleared, ready for task execution.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});