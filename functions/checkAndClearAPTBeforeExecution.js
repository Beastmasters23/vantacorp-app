import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAPT() {
    const APT_LOCK_FILE = '/var/lib/dpkg/lock-frontend';
    try {
        // Checking if the APT lock file exists
        const exists = await Deno.stat(APT_LOCK_FILE);
        if (exists) {
            console.log('APT lock detected. Clearing lock.');
            // Attempt to clear the lock (this will need appropriate permissions)
            await Deno.run({ cmd: ['sudo', 'rm', APT_LOCK_FILE'] }).status();
        }
    } catch (error) {
        // If error is for not existing file, it is not an issue.
        if (error instanceof Deno.errors.NotFound) return;
        console.error('Failed to check or clear APT lock:', error);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearAPT();
        // Additional code to run tasks will go here
        return Response.json({ status: 'Success' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});