import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        const locks = await exec('fuser /var/lib/dpkg/lock*', { silent: true });
        if (locks.code === 0) {
            // If there is a lock, we clear it
            await exec('sudo fuser -k /var/lib/dpkg/lock*');
            console.log('Apt locks cleared.');
        } else {
            console.log('No apt locks detected.');
        }
    } catch (err) {
        console.error('Error checking or clearing apt locks:', err);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();  // Clear apt locks before processing requests
        // Insert further task handling logic here.
        return Response.json({ message: 'Locks checked and cleared if necessary.' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});