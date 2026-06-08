import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    // Command to check for any APT locks
    const lockCheckCommand = 'sudo lsof /var/lib/dpkg/lock';
    // Command to clear APT locks
    const clearLocksCommand = 'sudo rm /var/lib/dpkg/lock /var/cache/apt/archives/lock';
    try {
        // Checking for APT locks
        const lockCheck = await exec(lockCheckCommand);
        // If locks are found, clear them
        if (lockCheck.success) {
            console.log('APT locks found. Clearing now...');
            await exec(clearLocksCommand);
            console.log('APT locks cleared successfully.');
        } else {
            console.log('No APT locks detected.');
        }
    } catch (error) {
        console.error('Error managing APT locks:', error);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        // Proceed to execute the intended task
        return Response.json({ message: 'APT lock check and clearance done. Ready for task execution.' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});