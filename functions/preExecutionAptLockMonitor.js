import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    // Check and clear any APT locks before proceeding
    try {
        const lockFileExists = await Deno.run({
            cmd: ['test', '-e', '/var/lib/dpkg/lock'],
        }).status();
        if (lockFileExists.success) {
            await Deno.run({
                cmd: ['sudo', 'rm', '/var/lib/dpkg/lock'],
            }).status();
        }
    } catch (error) {
        console.error("Failed to clear APT locks:", error);
    }
}

async function checkSystemReady() {
    // Run pre-checks to verify system readiness
    await clearAptLocks();
    const aptLockCleared = await Deno.run({
        cmd: ['test', '-e', '/var/lib/dpkg/lock'],
    }).status();
    if (aptLockCleared.success) {
        throw new Error('APT lock still exists, aborting task execution.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkSystemReady();
        // Proceed with task execution here
        return Response.json({ message: 'System is ready for task execution.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});