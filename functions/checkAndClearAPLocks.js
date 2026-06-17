import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAPLocks() {
    const lockFilePath = '/var/lib/dpkg/lock';
    const fs = Deno;
    try {
        const entry = await fs.lstat(lockFilePath);
        if (entry.isFile) {
            // Delete the APT lock file
            await fs.remove(lockFilePath);
            return { status: 'success', message: 'APT lock removed successfully.' };
        }
    } catch (e) {
        // If the lock file doesn't exist, it's likely cleared already
        if (e instanceof Deno.errors.NotFound) {
            return { status: 'success', message: 'No APT lock file found.' };
        }
        return { status: 'error', message: e.message };
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const clearanceStatus = await checkAndClearAPLocks();
        return Response.json(clearanceStatus);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});