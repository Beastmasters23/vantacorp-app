import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const APT_LOCK_CHECK_INTERVAL = 300000; // Check every 5 minutes

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        // Check if there is an APT lock on the system
        const { success } = await exec({
            cmd: ['sh', '-c', 'fuser /var/lib/dpkg/lock || fuser /var/lib/apt/lists/lock || fuser /var/cache/apt/archives/lock']
        });
        
        if (success) {
            console.log('APT lock detected, attempting to clear it...');
            await exec({ cmd: ['sudo', 'killall', 'apt-get', 'dpkg'] }); // This may be dangerous; ensure this is safe for your environment.
        } else {
            console.log('No APT lock detected.');
        }
    } catch (error) {
        console.error('Error while trying to clear APT locks:', error);
    }
}

setInterval(clearAptLocks, APT_LOCK_CHECK_INTERVAL);

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        return Response.json({ message: 'APT lock monitoring is active.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});