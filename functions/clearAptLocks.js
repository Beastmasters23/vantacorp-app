import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const exec = Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock-frontend; sudo fuser -k /var/lib/dpkg/lock; sudo apt-get update'],
        stdout: 'piped',
        stderr: 'piped',
    });
    const { code } = await exec.status();
    return code === 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const locksCleared = await clearAptLocks();
        if (!locksCleared) {
            return Response.json({ error: 'Failed to clear APT locks.' }, { status: 500 });
        }
        return Response.json({ message: 'APT locks cleared successfully.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
