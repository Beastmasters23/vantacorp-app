import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const command = 'sudo fuser -v /var/lib/dpkg/lock';
    try {
        const { status } = await Deno.run({
            cmd: ['sh', '-c', command],
            stdout: 'piped',
            stderr: 'piped',
        }).output();
        if (status === 0) {
            return { status: 'success', message: 'No APT locks found to clear.' };
        } else {
            // Attempt to clear the locks
            await Deno.run({
                cmd: ['sudo', 'rm', '/var/lib/dpkg/lock', '/var/lib/dpkg/lock-frontend'],
            }).status();
            return { status: 'success', message: 'APT locks cleared.' };
        }
    } catch (error) {
        return { status: 'failed', message: error.message };
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const result = await clearAptLocks();
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});