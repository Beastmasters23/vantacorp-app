import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Function to check for APT locks before executing tasks
async function checkAptLocks() {
    const aptLockCheck = await Deno.run({ cmd: ['sh', '-c', 'sudo lsof /var/lib/dpkg/lock /var/lib/dpkg/lock-frontend'] });
    const status = await aptLockCheck.status();
    return status.success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check for APT locks
        const isLocked = await checkAptLocks();
        if (isLocked) {
            return Response.json({ error: 'APT lock is active, cannot proceed.' }, { status: 503 });
        }
        // Proceed with task execution if no locks are found
        return Response.json({ message: 'No APT locks detected, proceeding with task execution.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});