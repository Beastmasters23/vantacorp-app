import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTPendingLocks() {
    const aptLockFiles = ['/var/lib/dpkg/lock', '/var/lib/dpkg/lock-frontend', '/var/cache/apt/archives/lock'];
    let clearedLocks = false;

    for (const lockFile of aptLockFiles) {
        try {
            await Deno.remove(lockFile);
            clearedLocks = true;
            console.log(`Cleared lock file: ${lockFile}`);
        } catch (error) {
            if (error.name !== 'NotFound') {
                console.warn(`Failed to clear lock file ${lockFile}: ${error.message}`);
            }
        }
    }

    return clearedLocks;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const locksCleared = await clearAPTPendingLocks();
        return Response.json({ success: true, locksCleared }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});