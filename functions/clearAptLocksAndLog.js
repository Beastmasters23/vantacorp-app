import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        // Check for APT locks
        const { status } = await exec('lsof /var/lib/dpkg/lock');
        if (status === 0) {
            // Forcefully kill any processes holding the lock
            await exec('sudo kill $(lsof -t /var/lib/dpkg/lock)');
        }
        // Optionally verify that APT locks are now clear
        const verifyStatus = await exec('lsof /var/lib/dpkg/lock');
        return verifyStatus.status !== 0;
    } catch (error) {
        console.error('Error clearing APT locks:', error);
        return false;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const locksCleared = await clearAptLocks();
        if (!locksCleared) {
            return Response.json({ error: 'Failed to clear APT locks' }, { status: 500 });
        }
        // Continue with further actions after lock clearance...
        return Response.json({ message: 'APTs checked and cleared if necessary.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});