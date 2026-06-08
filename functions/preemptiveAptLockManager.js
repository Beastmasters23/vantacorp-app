import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const output = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -v /var/lib/dpkg/lock'],
        stdout: 'piped',
        stderr: 'piped'
    });
    const { success } = await output.status();
    if (success) {
        await Deno.run({
            cmd: ['sudo', 'rm', '/var/lib/dpkg/lock'],
        }).status();
        return true;
    }
    return false;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const aptLockCleared = await clearAptLocks();
        if (!aptLockCleared) {
            throw new Error('Failed to clear apt locks.');
        }
        // Add additional logic for executing the task here.
        return Response.json({ message: 'Apt locks cleared, task can proceed.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});