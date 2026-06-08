import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAptLocks() {
    const { exec } = Deno;
    try {
        // Check for active, stale apt locks
        const result = await exec('lsof | grep /var/lib/dpkg/lock');
        if (result.success) {
            await exec('sudo rm /var/lib/dpkg/lock /var/lib/dpkg/lock-frontend');
            console.log('Cleared stale apt locks.');
        } else {
            console.log('No stale apt locks found.');
        }
    } catch (error) {
        console.error('Error checking/clearing apt locks:', error);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearAptLocks();
        // Proceed with normal operations after clearing apt locks
        return Response.json({ status: 'APT locks checked and cleared if necessary.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});