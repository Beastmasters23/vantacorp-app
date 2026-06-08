import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const exec = Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -cuk /var/lib/dpkg/lock'],
        stdout: 'piped',
        stderr: 'piped'
    });
    const { code } = await exec.status();
    exec.close();
    return code === 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const locksCleared = await clearAptLocks();
        if (!locksCleared) {
            throw new Error('Unable to clear APT locks');
        }
        return Response.json({ message: 'APT locks cleared successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});