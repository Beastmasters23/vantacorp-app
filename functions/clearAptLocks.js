import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    try {
        const { exec } = Deno;
        // Attempt to clear APT locks
        await exec('sudo rm /var/lib/dpkg/lock-frontend'); // Remove lock file if exists
        await exec('sudo rm /var/lib/dpkg/lock'); // Remove lock file if exists
        await exec('sudo dpkg --configure -a'); // Reconfigure any half-installed packages.
    } catch (err) {
        console.error('Failed to clear APT locks:', err);
        throw new Error('APT lock clearance failed.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ status: 'APT locks cleared' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});