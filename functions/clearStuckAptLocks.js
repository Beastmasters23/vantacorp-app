import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearStuckAptLocks() {
    const lockFile = '/var/lib/dpkg/lock';
    const checkLock = await Deno.stat(lockFile).then(() => true).catch(() => false);
    if (checkLock) {
        console.log('APT lock is present. Attempting to clear...');
        await Deno.run({
            cmd: ['sudo', 'rm', lockFile]
        }).status();
        console.log('APT lock cleared.');
    } else {
        console.log('No APT lock present.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearStuckAptLocks();
        return Response.json({ message: 'Checks completed' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});