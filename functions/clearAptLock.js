import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { exec } from 'https://deno.land/x/exec/mod.ts';

async function clearAptLock() {
    // Check if the apt lock exists
    try {
        const result = await exec("lsof /var/lib/dpkg/lock");
        if (result.stdout) {
            // If lock exists, terminate the process holding the lock
            console.log('Apt lock detected, clearing...');
            await exec("sudo kill -9 $(lsof -t /var/lib/dpkg/lock)");
            console.log('Apt lock cleared.');
        } else {
            console.log('No apt lock detected.');
        }
    } catch (error) {
        console.error('Error clearing apt lock:', error.message);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLock();
        return Response.json({ message: 'Apt lock check complete.' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});