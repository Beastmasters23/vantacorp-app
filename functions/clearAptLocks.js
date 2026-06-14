import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    // Command to check for APT locks
    const checkLockCommand = 'fuser /var/lib/dpkg/lock';
    const lockCheck = await Deno.run({
        cmd: ['sh', '-c', checkLockCommand],
        stdout: 'piped',
        stderr: 'piped',
    });
    const { code } = await lockCheck.status();
    if (code === 0) {
        // Command to release the APT lock
        const unlockCommand = 'sudo fuser -k /var/lib/dpkg/lock';
        await Deno.run({ cmd: ['sh', '-c', unlockCommand] });
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks(); // Clear APT locks before executing any tasks
        // Execute other crucial tasks here...
        return Response.json({ status: 'success' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
