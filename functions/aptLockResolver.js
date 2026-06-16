import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        await exec({ cmd: ['sudo', 'apt-get', 'clean'] });
        await exec({ cmd: ['sudo', 'rm', '/var/lib/apt/lists/lock'] });
        await exec({ cmd: ['sudo', 'rm', '/var/cache/apt/archives/lock'] });
        return true;
    } catch (error) {
        console.error('Failed to clear APT locks:', error.message);
        return false;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const aptCleared = await clearAptLocks();
        if (!aptCleared) {
            return Response.json({ error: 'Failed to clear APT locks, task cannot proceed.' }, { status: 400 });
        }
        // Proceed with task execution after confirming APT locks are cleared
        // (Additional task logic goes here)
        return Response.json({ message: 'Tasks can proceed as APT locks have been cleared.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});