import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const locks = await Deno.run({ 
        cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock; sudo fuser -k /var/cache/apt/archives/lock; sudo fuser -k /var/lib/apt/lists/lock'],
        stdout: 'piped',
        stderr: 'piped' 
    });
    const { code } = await locks.status();
    if (code !== 0) {
        throw new Error('Failed to clear APT locks');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ message: 'APT locks cleared successfully' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});