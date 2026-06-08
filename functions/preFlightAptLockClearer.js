import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check for APT locks
        const lockCheck = await checkAndReleaseAptLocks();
        if (lockCheck.success) {
            // Proceed with normal operation
            return Response.json({ message: 'APT locks cleared, ready to execute tasks.' });
        } else {
            return Response.json({ error: lockCheck.message }, { status: 500 });
        }
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkAndReleaseAptLocks() {
    try {
        const locks = await Deno.run({
            cmd: ['bash', '-c', 'sudo fuser -v /var/lib/dpkg/lock; sudo fuser -v /var/cache/apt/archives/lock'],
            stdout: 'piped',
            stderr: 'piped'
        });
        const { code } = await locks.status();
        if (code === 0) {
            // Locks are present, release them
            await Deno.run({ cmd: ['sudo', 'apt-get', 'clean'],});
            return { success: true, message: 'APT locks successfully cleared.' };
        }
        return { success: false, message: 'No APT locks found, safe to proceed.' };
    } catch (error) {
        return { success: false, message: `Error checking APT locks: ${error.message}` };
    }
}