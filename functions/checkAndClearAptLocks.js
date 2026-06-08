import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAptLocks() {
    const { exec } = Deno;
    // Check existing apt locks
    try {
        const { success } = await exec('test -e /var/lib/dpkg/lock-frontend');
        if (success) {
            console.log('APT lock detected. Attempting to clear...');
            await exec('sudo rm -f /var/lib/dpkg/lock-frontend');
            console.log('APT lock cleared.');
        }
    } catch (error) {
        console.error(`Error checking APT lock: ${error.message}`);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearAptLocks();
        return Response.json({ message: 'APT locks checked and cleared if necessary.' });
    } catch (error) { 
        return Response.json({ error: error.message }, { status: 500 }); 
    }
});