import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check for APT locks
        const aptLockExists = await checkForAptLocks();
        if (aptLockExists) {
            return Response.json({ error: 'APT lock detected, please resolve.' }, { status: 409 });
        }
        // Proceed with the intended task processing
        return Response.json({ message: 'No APT lock, ready to execute tasks.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkForAptLocks() {
    const lockFilePath = '/var/lib/dpkg/lock'; // Common APT lock file location
    try {
        await Deno.stat(lockFilePath);
        return true; // Lock exists
    } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
            return false; // No lock file means no locks
        }
        throw error; // Rethrow other errors
    }
}