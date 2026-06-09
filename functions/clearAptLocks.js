import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    try {
        // Fetch apt lock status
        const lockStatus = await Deno.run({
            cmd: ['sh', '-c', 'sudo lsof /var/lib/dpkg/lock']
        }).status();

        // If there is a lock, attempt to clear it
        if (lockStatus.success) {
            console.log('APT lock detected, attempting to clear it...');
            await Deno.run({
                cmd: ['sh', '-c', 'sudo rm /var/lib/dpkg/lock']
            }).status();
            console.log('APT lock cleared successfully.');
        } else {
            console.log('No APT lock encountered.');
        }
    } catch (error) {
        console.error('Error while checking or clearing APT lock:', error);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    await clearAptLocks();
    return Response.json({ message: 'APT lock checking complete.' });
});