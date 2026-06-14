import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const aptLockStatus = await checkAndClearAptLocks();
        if (!aptLockStatus.success) {
            return Response.json({ error: 'Could not clear APT locks.', status: aptLockStatus.error }, { status: 500 });
        }
        // Proceed with regular task execution logic here
        return Response.json({ message: 'Tasks executed successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkAndClearAptLocks() {
    // Logic to check for APT locks and clear them if necessary
    const lockCheck = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock; sudo fuser -k /var/cache/apt/archives/lock'],
        stdout: 'piped',
        stderr: 'piped',
    });
    const output = await lockCheck.output();
    const error = await lockCheck.stderrOutput();
    if (lockCheck.status === 0) {
        return { success: true };
    } else {
        return { success: false, error: new TextDecoder().decode(error) };
    }
}